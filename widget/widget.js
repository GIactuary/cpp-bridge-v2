// Configuration
// Configuration
const API_URL = "/v1/calculate";
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
$('mortality-risk').addEventListener('change', calculate);

async function calculate() {
    const gender = document.querySelector('input[name="gender"]:checked').value;

    const payload = {
        current_age: parseInt($('age').value),
        cpp_estimate_at_65: parseFloat($('cpp').value),
        rrsp_savings: parseFloat($('savings').value),
        health_status: $('health').value,
        real_rate_of_return: parseFloat($('ror').value),
        wage_growth: parseFloat($('wage').value),
        discount_pre_retirement_mortality: $('mortality-risk').checked,
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
    const affordText = $('afford-text');
    affordText.classList.remove('hidden');

    if (data.is_affordable) {
        badge.className = "mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800";
        badge.innerText = "✅ Fully Funded";
        $('cost-display').className = "text-3xl font-extrabold text-green-600";
        affordText.innerText = "Your savings are sufficient to fund the cost of bridging.";
    } else {
        badge.className = "mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800";
        badge.innerText = `❌ Shortfall: $${data.shortfall_amount.toLocaleString()}`;
        $('cost-display').className = "text-3xl font-extrabold text-red-600";
        affordText.innerText = `Your savings are insufficient to fund the bridge (shortfall of $${data.shortfall_amount.toLocaleString()}).`;
    }

    // 2. Probability
    $('prob-display').innerText = (data.probability_of_winning * 100).toFixed(1) + "%";
    $('rec-text').innerText = data.recommendation_reasoning;

    // 3. EPV Table
    if (data.epv_early && data.epv_delayed) {
        $('epv-monthly-early').innerText = "$" + data.cpp_estimate_at_65_raw ? data.cpp_estimate_at_65_raw : parseInt($('cpp').value).toLocaleString(); // Use input if raw not returned, but safer to use input value directly or parse from text. 
        // Actually the API doesn't return the raw input 65 estimate in response body, but we have it in input.
        // Wait, 'target_monthly_income_at_70' is returned. We know 65 is just the input.

        $('epv-monthly-early').innerText = "$" + parseInt($('cpp').value).toLocaleString();
        $('epv-monthly-delayed').innerText = "$" + data.target_monthly_income_at_70.toLocaleString();

        $('epv-total-early').innerText = "$" + data.epv_early.toLocaleString();
        $('epv-total-delayed').innerText = "$" + data.epv_delayed.toLocaleString();

        // Highlight winner
        if (data.epv_delayed > data.epv_early) {
            $('epv-total-delayed').classList.add('text-green-600', 'dark:text-green-400');
            $('epv-total-early').classList.remove('text-green-600', 'dark:text-green-400');
        } else {
            $('epv-total-early').classList.add('text-green-600', 'dark:text-green-400');
            $('epv-total-delayed').classList.remove('text-green-600', 'dark:text-green-400');
        }
    }

    // 4. Chart
    renderChart(data.breakeven_age_economic, data.probability_of_winning);
}

function renderChart(breakevenAge, probability) {
    const ctx = document.getElementById('resultChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    // Assumptions for Chart Construction
    const ageStart = 60;
    const ageEnd = 95;
    const labels = [];
    const dataEarly = [];
    const dataDelayed = [];

    // Inputs
    const monthlyEarly_raw = parseInt($('cpp').value.replace(/,/g, '')) || 1000;
    const monthlyDelayed_text = $('epv-monthly-delayed').innerText.replace('$', '').replace(/,/g, '');
    let monthlyDelayed = parseFloat(monthlyDelayed_text);

    // Fallback if the calculation hasn't run yet (e.g. initial load before API returns)
    if (isNaN(monthlyDelayed)) {
        monthlyDelayed = monthlyEarly_raw * 1.42 * Math.pow(1.011, 5);
    }

    const ror = parseFloat($('ror').value);
    const monthlyRate = Math.pow(1 + ror, 1.0 / 12.0) - 1.0;

    let balEarly = 0;
    let balDelayed = 0;

    for (let age = ageStart; age <= ageEnd; age++) {
        labels.push(age);

        // Simulate 12 months for this year to capture monthly compounding and payments
        for (let m = 0; m < 12; m++) {
            // Early Stream Logic (Annuity Due: Payment at start of month earns interest for the month)
            // Balance_End = (Balance_Start + Payment) * (1 + r)
            let pmtEarly = 0;
            if (age >= 65) {
                pmtEarly = monthlyEarly_raw;
            }
            balEarly = (balEarly + pmtEarly) * (1 + monthlyRate);

            // Delayed Stream Logic
            let pmtDelayed = 0;
            if (age >= 70) {
                pmtDelayed = monthlyDelayed;
            }
            balDelayed = (balDelayed + pmtDelayed) * (1 + monthlyRate);
        }

        dataEarly.push(balEarly);
        dataDelayed.push(balDelayed);
    }

    // Determine Theme Colors
    const isDark = document.documentElement.classList.contains('dark');
    const colorEarly = isDark ? '#FCA5A5' : '#EF4444'; // Red-300 / Red-500
    const colorDelayed = isDark ? '#86EFAC' : '#10B981'; // Green-300 / Green-500
    const gridColor = isDark ? '#334155' : '#E2E8F0'; // Slate-700 / Slate-200
    const textColor = isDark ? '#94A3B8' : '#64748B'; // Slate-400 / Slate-500

    const annotationPlugin = {
        id: 'annotationLine',
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;

            const index = labels.indexOf(parseInt(breakevenAge));
            if (index === -1) return;

            const x = xAxis.getPixelForValue(index);
            const topY = yAxis.top;
            const bottomY = yAxis.bottom;

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 2;
            ctx.strokeStyle = textColor;
            ctx.stroke();

            ctx.fillStyle = textColor;
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Breakeven: Age ${breakevenAge}`, x, topY - 10);
            ctx.restore();
        }
    };

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Take Early (65)',
                    data: dataEarly,
                    borderColor: colorEarly,
                    backgroundColor: colorEarly,
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.1
                },
                {
                    label: 'Delay Strategy (70)',
                    data: dataDelayed,
                    borderColor: colorDelayed,
                    backgroundColor: colorDelayed,
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.1
                }
            ]
        },
        plugins: [annotationPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 0,
                    left: 10
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 20,
                        usePointStyle: true,
                        font: { family: 'Inter, sans-serif', size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: isDark ? '#f1f5f9' : '#1e293b',
                    bodyColor: isDark ? '#cbd5e1' : '#475569',
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    displayColors: true,
                    titleFont: { family: 'Inter, sans-serif', size: 13, weight: 'bold' },
                    bodyFont: { family: 'Inter, sans-serif', size: 12 },
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor, drawBorder: false },
                    ticks: {
                        color: textColor,
                        font: { family: 'Inter, sans-serif', size: 11 },
                        padding: 8,
                        callback: (val) => '$' + val / 1000 + 'k'
                    },
                    border: { display: false }
                },
                x: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: {
                        color: textColor,
                        font: { family: 'Inter, sans-serif', size: 11 },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10
                    },
                    border: { display: false }
                }
            }
        }
    });
}

