// Configuration
const API_URL = "http://localhost:8005/v1/calculate";
let myChart = null;

// UI Helpers
const $ = (id) => document.getElementById(id);

// Theme Logic
function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        updateIcons('light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        updateIcons('dark');
    }
    // Redraw chart if exists to update text colors
    if (myChart) {
        // Trigger a re-render or just let the next calc handle it. 
        // ideally we would update config but for simplicity we rely on next calc or reload.
    }
}

function updateIcons(mode) {
    const sun = $('sun-icon');
    const moon = $('moon-icon');
    if (mode === 'dark') {
        sun.classList.remove('hidden');
        moon.classList.add('hidden');
    } else {
        sun.classList.add('hidden');
        moon.classList.remove('hidden');
    }
}

// Load Theme
const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    updateIcons('dark');
} else {
    document.documentElement.classList.remove('dark');
    updateIcons('light');
}

// UI Helpers


// Update Slider Labels
$('age').addEventListener('input', (e) => $('age-val').innerText = e.target.value);
$('ror').addEventListener('input', (e) => $('ror-val').innerText = (e.target.value * 100).toFixed(1) + "%");
$('wage').addEventListener('input', (e) => $('wage-val').innerText = (e.target.value * 100).toFixed(1) + "%");

async function calculate() {
    const gender = document.querySelector('input[name="gender"]:checked').value;

    const payload = {
        current_age: parseInt($('age').value),
        cpp_estimate_at_65: parseFloat($('cpp').value),
        rrsp_savings: parseFloat($('savings').value),
        health_status: $('health').value,
        real_rate_of_return: parseFloat($('ror').value),
        wage_growth: parseFloat($('wage').value),
        inflation_rate: 0.021,
        gender: gender
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        renderResults(data);
    } catch (err) {
        console.error("API Error:", err);
        alert("Ensure Backend is running at " + API_URL);
    }
}



// Separate function to just update LE without showing full results
async function updateLifeExpectancy() {
    const genderRatioReference = document.querySelector('input[name="gender"]:checked');
    if (!genderRatioReference) return;

    const payload = {
        current_age: parseInt($('age').value),
        cpp_estimate_at_65: parseFloat($('cpp').value),
        rrsp_savings: parseFloat($('savings').value),
        health_status: $('health').value,
        real_rate_of_return: parseFloat($('ror').value),
        wage_growth: parseFloat($('wage').value),
        inflation_rate: 0.021,
        gender: genderRatioReference.value
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.life_expectancy) {
            $('le-display').innerText = `Est. Life Expectancy: ${data.life_expectancy}`;
        }
    } catch (e) {
        console.log("Silent LE fetch fail", e);
    }
}

// Live Updates for Life Expectancy
$('health').addEventListener('change', updateLifeExpectancy);
$('age').addEventListener('change', updateLifeExpectancy); // Change fires on commit
document.querySelectorAll('input[name="gender"]').forEach(algo => algo.addEventListener('change', updateLifeExpectancy));

// Trigger once on load
window.addEventListener('DOMContentLoaded', updateLifeExpectancy);

function renderResults(data) {
    $('empty-state').classList.add('hidden');
    $('results').classList.remove('hidden');

    // 0. Update Life Expectancy Display (Also update here to be sure)
    if (data.life_expectancy) {
        $('le-display').innerText = `Est. Life Expectancy: ${data.life_expectancy}`;
    }

    // 1. Cost & Affordability
    $('cost-display').innerText = "$" + data.bridge_cost_lump_sum.toLocaleString();

    const badge = $('afford-badge');
    if (data.is_affordable) {
        badge.className = "mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800";
        badge.innerText = "✅ Fully Funded";
        $('cost-display').className = "text-3xl font-extrabold text-green-600";
    } else {
        badge.className = "mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800";
        badge.innerText = `❌ Shortfall: $${data.shortfall_amount.toLocaleString()}`;
        $('cost-display').className = "text-3xl font-extrabold text-red-600";
    }

    // 2. Probability
    $('prob-display').innerText = (data.probability_of_winning * 100).toFixed(1) + "%";
    $('rec-text').innerText = `"${data.recommendation_reasoning}"`;

    // 3. Chart
    renderChart(data.breakeven_age_economic, data.probability_of_winning);
}

function renderChart(breakevenAge, probability) {
    const ctx = $('resultChart').getContext('2d');

    if (myChart) myChart.destroy();

    const maxAge = 95;
    const startAge = 65;
    const redWidth = breakevenAge - startAge;
    const greenWidth = maxAge - breakevenAge;

    // Custom Plugin to draw text/lines on top
    const annotationPlugin = {
        id: 'annotationPlugin',
        afterDatasetsDraw(chart, args, options) {
            const { ctx, chartArea: { left, right, top, bottom, width, height }, scales: { x, y } } = chart;

            const isDark = document.documentElement.classList.contains('dark');
            const textColor = isDark ? '#94a3b8' : '#374151'; // Slate-400 vs Gray-700
            const lineColor = isDark ? '#475569' : '#d1d5db'; // Slate-600 vs Gray-300

            // 1. Draw Breakeven Line
            // The bar is stacked, so the boundary is exactly at the cumulative value of the first dataset
            // But easier: map the value on the linear X axis if we had one.
            // Since it's a stacked bar summing to (95-65)=30, we map the pixel position manually or use logic.
            // Actually, simple bar logic:

            const segmentWidth = chart.getDatasetMeta(0).data[0].width;
            const lineX = left + segmentWidth;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(lineX, top);
            ctx.lineTo(lineX, bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = lineColor;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.restore();

            // 2. Breakeven Label (Top)
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.fillText(`Breakeven: Age ${breakevenAge}`, lineX, top + 20); // Inside the bar roughly

            // 3. Zone Labels (Centered in their sections)
            const redCenter = left + (segmentWidth / 2);
            const greenCenter = lineX + ((width - segmentWidth) / 2);

            ctx.fillStyle = isDark ? '#fca5a5' : '#991B1B'; // Light Red vs Dark Red
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText("Early Win Zone", redCenter, bottom - 15);

            ctx.fillStyle = isDark ? '#86efac' : '#166534'; // Light Green vs Dark Green
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText("Bridge Win Zone", greenCenter, bottom - 25);
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText(`(Prob: ${(probability * 100).toFixed(1)}%)`, greenCenter, bottom - 10);
        }
    };

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Values'], // Single bar
            datasets: [
                {
                    label: 'Take Early',
                    data: [redWidth],
                    backgroundColor: '#FCA5A5', // Red-300
                    barPercentage: 0.6
                },
                {
                    label: 'Delay Bridge',
                    data: [greenWidth],
                    backgroundColor: '#86EFAC', // Green-300
                    barPercentage: 0.6
                }
            ]
        },
        plugins: [annotationPlugin],
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false } // We are using static labels instead
            },
            scales: {
                x: {
                    stacked: true,
                    display: false,
                    max: 30 // Fixed width (65 to 95)
                },
                y: {
                    stacked: true,
                    display: false
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });
}
