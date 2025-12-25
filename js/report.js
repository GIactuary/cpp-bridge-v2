// ============================================
// REPORT DASHBOARD RENDERER
// ============================================

let reportData = null;
let calculatorData = null;

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
    badge.textContent = score.category.toUpperCase();

    // Set label
    document.getElementById('score-label').textContent = score.label;

    // Set summary
    const summaries = {
        red: "Your retirement plan has critical gaps that need immediate attention. Let's work on improving your score.",
        amber: "You have a good foundation, but there are optimization opportunities to strengthen your position.",
        green: "Excellent! You're well-prepared for retirement. Focus on maintaining and fine-tuning your strategy."
    };
    document.getElementById('score-summary').textContent = summaries[score.category];
}

// ============================================
// CATEGORY CARDS RENDERING
// ============================================
function renderCategoryCards() {
    const breakdown = reportData.score.breakdown.quiz;
    const categories = ['income', 'assets', 'tax', 'psychology'];
    const barColors = {
        income: 'bg-emerald-500',
        assets: 'bg-blue-500',
        tax: 'bg-amber-500',
        psychology: 'bg-purple-500'
    };

    categories.forEach((cat, index) => {
        const data = breakdown[cat];
        const percentage = (data.points / data.max) * 100;

        // Show card
        document.getElementById(`${cat}-card`).style.opacity = '1';

        // Animate bar
        setTimeout(() => {
            document.getElementById(`${cat}-bar`).style.width = `${percentage}%`;
        }, 300 + (index * 200));

        // Set points
        document.getElementById(`${cat}-points`).textContent = data.points;

        // Set rating badge
        const rating = data.rating || getRating(data.points, data.max);
        const ratingBadge = document.getElementById(`${cat}-rating`);
        const ratingClasses = {
            low: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
            high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        };
        ratingBadge.className = `px-2 py-0.5 rounded text-xs font-bold ${ratingClasses[rating]}`;
        ratingBadge.textContent = rating.toUpperCase();
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
    if (!calculatorData) return;

    document.getElementById('recap-cost').textContent = '$' + (calculatorData.bridge_cost || 0).toLocaleString();
    document.getElementById('recap-prob').textContent = ((calculatorData.win_probability || 0) * 100).toFixed(0) + '%';
    document.getElementById('recap-breakeven').textContent = 'Age ' + (calculatorData.breakeven_age || '--');
    document.getElementById('recap-rec').textContent = calculatorData.recommendation || '--';
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
