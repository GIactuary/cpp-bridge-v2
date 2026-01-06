// ============================================
// REPORT DASHBOARD RENDERER
// ============================================

let reportData = null;
let calculatorData = null;
let radarChart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }

    // Load result data
    const resultStr = sessionStorage.getItem('lead_result');
    const configStr = sessionStorage.getItem('retire_config');

    if (!resultStr) {
        alert('No results found. Please complete the quiz first.');
        window.location.href = 'quiz.html';
        return;
    }

    reportData = JSON.parse(resultStr);
    calculatorData = configStr ? JSON.parse(configStr) : null;

    // Render the dashboard with slight delay for animation effect
    setTimeout(() => {
        renderScoreCard();
        renderRadarChart();
        renderCategoryCards();
        renderInsights();
        renderCalculatorRecap();
        renderCTA();
    }, 100);
});

// ============================================
// SCORE CARD RENDERING
// ============================================
function renderScoreCard() {
    const score = reportData.score;

    // Show the card
    document.getElementById('score-card').style.opacity = '1';

    // Animate score number
    animateNumber('score-number', 0, score.total, 1500);

    // Animate ring
    setTimeout(() => {
        const circle = document.getElementById('score-circle');
        const circumference = 283; // 2 * PI * 45
        const offset = circumference - (score.total / 100) * circumference;
        circle.style.strokeDashoffset = offset;

        // Set color based on category
        const colors = {
            red: '#EF4444',
            amber: '#F59E0B',
            green: '#10B981'
        };
        circle.style.stroke = colors[score.category];
    }, 100);

    // Set badge
    const badge = document.getElementById('score-badge');
    const badgeClasses = {
        red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    badge.className = `inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 ${badgeClasses[score.category]}`;
    badge.textContent = score.label.toUpperCase();

    // Set label
    document.getElementById('score-label').textContent = score.label;

    // Set summary based on archetype
    const summaries = {
        red: "You have the assets but lack the architecture. Your retirement plan has critical gaps that need immediate attention to protect your financial future.",
        amber: "Your plan is good, but is it efficient? There are optimization opportunities that could save you tens of thousands in taxes and lost benefits.",
        green: "Excellent! You're a Resilient Strategist. Your plan has been thoughtfully constructed. Focus on maintaining and fine-tuning your strategy."
    };
    document.getElementById('score-summary').textContent = summaries[score.category];
}

// ============================================
// RADAR CHART RENDERING
// ============================================
function renderRadarChart() {
    const breakdown = reportData.score.breakdown.quiz;
    const isDark = document.documentElement.classList.contains('dark');

    // Calculate percentages for each category using dynamic max from API
    const categories = ['foundation', 'income', 'tax', 'lifestyle', 'risk'];
    const categoryLabels = ['Foundation', 'Income', 'Tax Strategy', 'Lifestyle', 'Risk'];

    const data = categories.map(cat => {
        const catData = breakdown[cat];
        if (!catData) return 0;
        // Use dynamic max from breakdown (adjusted for user situation)
        const max = catData.max || 0;
        if (max === 0) return 0;
        return Math.round((catData.points / max) * 100);
    });

    const ctx = document.getElementById('radar-chart').getContext('2d');

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: categoryLabels,
            datasets: [{
                label: 'Your Score',
                data: data,
                fill: true,
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                borderColor: isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                pointBackgroundColor: isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(79, 70, 229, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: isDark ? 'rgba(129, 140, 248, 1)' : 'rgba(79, 70, 229, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        color: isDark ? '#94A3B8' : '#64748B',
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: isDark ? '#334155' : '#E2E8F0'
                    },
                    angleLines: {
                        color: isDark ? '#334155' : '#E2E8F0'
                    },
                    pointLabels: {
                        color: isDark ? '#E2E8F0' : '#1E293B',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                }
            }
        }
    });
}

// ============================================
// CATEGORY CARDS RENDERING (5 categories)
// ============================================
function renderCategoryCards() {
    const breakdown = reportData.score.breakdown.quiz;
    const categories = ['foundation', 'income', 'tax', 'lifestyle', 'risk'];

    categories.forEach((cat, index) => {
        const data = breakdown[cat];
        if (!data) return;

        // Use dynamic max from breakdown (adjusted for user situation)
        const max = data.max || 0;
        const percentage = max > 0 ? (data.points / max) * 100 : 0;

        // Show card
        const card = document.getElementById(`${cat}-card`);
        if (card) card.style.opacity = '1';

        // Animate bar
        setTimeout(() => {
            const bar = document.getElementById(`${cat}-bar`);
            if (bar) bar.style.width = `${percentage}%`;
        }, 300 + (index * 150));

        // Set points with dynamic max
        const pointsEl = document.getElementById(`${cat}-points`);
        if (pointsEl) pointsEl.textContent = data.points;

        // Update max display
        const maxEl = document.getElementById(`${cat}-max`);
        if (maxEl) maxEl.textContent = max;

        // Set rating badge
        const rating = data.rating || getRating(data.points, max);
        const ratingBadge = document.getElementById(`${cat}-rating`);
        if (ratingBadge) {
            const ratingClasses = {
                low: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            };
            ratingBadge.className = `px-2 py-0.5 rounded text-xs font-bold ${ratingClasses[rating]}`;
            ratingBadge.textContent = rating.toUpperCase();
        }
    });
}

function getRating(points, max) {
    const ratio = points / max;
    if (ratio >= 0.7) return 'high';
    if (ratio >= 0.4) return 'medium';
    return 'low';
}

// ============================================
// INSIGHTS RENDERING
// ============================================
function renderInsights() {
    const insights = reportData.insights;

    document.getElementById('verdict-text').textContent = insights.verdict;

    const recList = document.getElementById('recommendations-list');
    recList.innerHTML = insights.recommendations.map(rec => `
        <li class="flex items-start">
            <span class="text-emerald-500 mr-2 mt-0.5">✓</span>
            <span class="text-slate-600 dark:text-slate-400">${rec}</span>
        </li>
    `).join('');
}

// ============================================
// CALCULATOR RECAP
// ============================================
function renderCalculatorRecap() {
    // Try to get data from calculator breakdown first, then fall back to session
    const calcData = reportData.score?.breakdown?.calculator || calculatorData;
    if (!calcData) return;

    document.getElementById('recap-cost').textContent = '$' + (calcData.bridge_cost || 0).toLocaleString();
    document.getElementById('recap-prob').textContent = ((calcData.win_probability || 0) * 100).toFixed(0) + '%';
    document.getElementById('recap-breakeven').textContent = 'Age ' + (calcData.breakeven_age || '--');
    document.getElementById('recap-rec').textContent = calcData.recommendation || '--';
}

// ============================================
// CTA RENDERING
// ============================================
function renderCTA() {
    const partner = reportData.partner;

    if (partner && partner.cta_url) {
        document.getElementById('cta-button').textContent = partner.cta_text + ' →';
        document.getElementById('cta-button').href = partner.cta_url;
    }
}

// ============================================
// ANIMATION UTILITIES
// ============================================
function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic)
        const eased = 1 - Math.pow(1 - progress, 3);

        const current = Math.round(start + (end - start) * eased);
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
