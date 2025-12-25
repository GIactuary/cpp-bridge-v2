// ============================================
// QUIZ STATE MACHINE
// ============================================

const QUIZ_DATA = [
    // ========== INCOME SECURITY (25 pts) ==========
    {
        id: "q1",
        category: "income",
        question: "Beyond CPP and OAS, do you have a company pension plan (Defined Benefit)?",
        type: "boolean",
        weight: 10,
        yes_score: 10,
        no_score: 0
    },
    {
        id: "q2",
        category: "income",
        question: "What percentage of your monthly retirement expenses will be covered by GUARANTEED income?",
        type: "slider",
        min: 0,
        max: 100,
        step: 5,
        unit: "%",
        weight: 10,
        scoring: "proportional"
    },
    {
        id: "q3",
        category: "income",
        question: "Do you have other sources of passive income (rental properties, dividends, royalties)?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },

    // ========== ASSET LONGEVITY (20 pts) ==========
    {
        id: "q4",
        category: "assets",
        question: "Which best describes your withdrawal strategy?",
        type: "multiple_choice",
        options: [
            { text: "I have a specific written plan reviewed by a professional", score: 10 },
            { text: "I follow the 4% rule or similar guideline", score: 5 },
            { text: "I withdraw as needed / no specific plan", score: 0 }
        ],
        weight: 10
    },
    {
        id: "q5",
        category: "assets",
        question: "How many years of retirement expenses do you have in liquid savings?",
        type: "multiple_choice",
        options: [
            { text: "5+ years", score: 5 },
            { text: "2-5 years", score: 3 },
            { text: "Less than 2 years", score: 0 }
        ],
        weight: 5
    },
    {
        id: "q6",
        category: "assets",
        question: "Is your investment portfolio diversified across asset classes?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },

    // ========== TAX EFFICIENCY (15 pts) ==========
    {
        id: "q7",
        category: "tax",
        question: "Have you planned the optimal order for drawing from RRSP, TFSA, and non-registered accounts?",
        type: "multiple_choice",
        options: [
            { text: "Yes, I have a tax-optimized drawdown plan", score: 7 },
            { text: "I have a general idea but no formal plan", score: 3 },
            { text: "No, I haven't considered this", score: 0 }
        ],
        weight: 7
    },
    {
        id: "q8",
        category: "tax",
        question: "Are you aware of the tax implications of RRIF minimum withdrawals starting at age 72?",
        type: "boolean",
        weight: 4,
        yes_score: 4,
        no_score: 0
    },
    {
        id: "q9",
        category: "tax",
        question: "Have you considered income splitting strategies with a spouse/partner?",
        type: "multiple_choice",
        options: [
            { text: "Yes, actively using pension splitting or spousal RRSP", score: 4 },
            { text: "Aware but not implemented", score: 2 },
            { text: "Not applicable or not considered", score: 0 }
        ],
        weight: 4
    },

    // ========== PSYCHOLOGICAL READINESS (10 pts) ==========
    {
        id: "q10",
        category: "psychology",
        question: "How confident do you feel about managing your finances in retirement?",
        type: "slider",
        min: 1,
        max: 10,
        step: 1,
        unit: "/10",
        weight: 4,
        scoring: "proportional"
    },
    {
        id: "q11",
        category: "psychology",
        question: "Do you have a plan for meaningful activities in retirement?",
        type: "boolean",
        weight: 3,
        yes_score: 3,
        no_score: 0
    },
    {
        id: "q12",
        category: "psychology",
        question: "Have you discussed your retirement plans with your spouse/partner or family?",
        type: "multiple_choice",
        options: [
            { text: "Yes, we have aligned expectations", score: 3 },
            { text: "Somewhat, but not in detail", score: 1 },
            { text: "No / Not applicable", score: 0 }
        ],
        weight: 3
    }
];

// ============================================
// STATE
// ============================================
let currentQuestion = 0;
let answers = {};
let calculatorData = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }

    // Check for calculator data
    const configStr = sessionStorage.getItem('retire_config');
    if (!configStr) {
        // No calculator data, redirect back
        alert('Please complete the calculator first.');
        window.location.href = 'index.html';
        return;
    }

    calculatorData = JSON.parse(configStr);

    // Load any saved answers
    const savedAnswers = sessionStorage.getItem('quiz_answers');
    if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
    }

    // Update context card
    updateContextCard();

    // Render first question
    renderQuestion();

    // Update progress
    updateProgress();
});

function updateContextCard() {
    const ctx = document.getElementById('context-text');
    const age = calculatorData.current_age;
    const savings = calculatorData.rrsp_savings.toLocaleString();
    const affordable = calculatorData.is_affordable ? 'can' : 'cannot';
    const prob = (calculatorData.win_probability * 100).toFixed(0);

    ctx.textContent = `You are ${age} years old with $${savings} in savings. You ${affordable} afford the CPP bridge strategy. Your probability of benefiting from delay is ${prob}%.`;
}

// ============================================
// QUESTION RENDERING
// ============================================
function renderQuestion() {
    const q = QUIZ_DATA[currentQuestion];
    const container = document.getElementById('question-container');

    let html = `
        <div class="fade-enter-active">
            <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                ${getCategoryLabel(q.category)}
            </p>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">
                ${q.question}
            </h2>
            <div class="space-y-3">
    `;

    switch (q.type) {
        case 'boolean':
            html += renderBooleanQuestion(q);
            break;
        case 'slider':
            html += renderSliderQuestion(q);
            break;
        case 'multiple_choice':
            html += renderMultipleChoiceQuestion(q);
            break;
    }

    html += '</div></div>';
    container.innerHTML = html;

    // Restore saved answer if exists
    if (answers[q.id] !== undefined) {
        restoreAnswer(q);
    }

    updateNavigationButtons();
}

function renderBooleanQuestion(q) {
    return `
        <button onclick="selectBoolean(true)" id="btn-yes"
            class="w-full p-4 text-left bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
            <span class="font-medium">Yes</span>
        </button>
        <button onclick="selectBoolean(false)" id="btn-no"
            class="w-full p-4 text-left bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
            <span class="font-medium">No</span>
        </button>
    `;
}

function renderSliderQuestion(q) {
    const mid = Math.round((q.max - q.min) / 2) + q.min;
    const savedValue = answers[q.id] !== undefined ? answers[q.id] : mid;
    return `
        <div class="px-4">
            <div class="flex justify-between text-sm text-slate-500 mb-2">
                <span>${q.min}${q.unit || ''}</span>
                <span id="slider-value" class="font-bold text-indigo-600">${savedValue}${q.unit || ''}</span>
                <span>${q.max}${q.unit || ''}</span>
            </div>
            <input type="range" id="slider-input"
                min="${q.min}" max="${q.max}" step="${q.step}" value="${savedValue}"
                oninput="updateSlider(this.value)"
                class="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer">
        </div>
    `;
}

function renderMultipleChoiceQuestion(q) {
    return q.options.map((opt, idx) => `
        <button onclick="selectOption(${idx})" id="opt-${idx}"
            class="w-full p-4 text-left bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
            <span class="font-medium">${opt.text}</span>
        </button>
    `).join('');
}

function restoreAnswer(q) {
    const value = answers[q.id];

    switch (q.type) {
        case 'boolean':
            highlightSelection(value ? 'btn-yes' : 'btn-no');
            break;
        case 'slider':
            document.getElementById('slider-input').value = value;
            updateSlider(value);
            break;
        case 'multiple_choice':
            highlightSelection(`opt-${value}`);
            break;
    }
}

// ============================================
// ANSWER HANDLERS
// ============================================
function selectBoolean(value) {
    const q = QUIZ_DATA[currentQuestion];
    answers[q.id] = value;
    saveAnswers();

    // Visual feedback
    clearSelections();
    highlightSelection(value ? 'btn-yes' : 'btn-no');

    // Auto-advance after short delay
    setTimeout(() => nextQuestion(), 300);
}

function selectOption(index) {
    const q = QUIZ_DATA[currentQuestion];
    answers[q.id] = index;
    saveAnswers();

    // Visual feedback
    clearSelections();
    highlightSelection(`opt-${index}`);

    // Auto-advance
    setTimeout(() => nextQuestion(), 300);
}

function updateSlider(value) {
    const q = QUIZ_DATA[currentQuestion];
    answers[q.id] = parseInt(value);
    saveAnswers();

    document.getElementById('slider-value').textContent = value + (q.unit || '');
}

function clearSelections() {
    document.querySelectorAll('[id^="btn-"], [id^="opt-"]').forEach(el => {
        el.classList.remove('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
        el.classList.add('border-gray-200', 'dark:border-slate-700');
    });
}

function highlightSelection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('border-gray-200', 'dark:border-slate-700');
        el.classList.add('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
    }
}

function saveAnswers() {
    sessionStorage.setItem('quiz_answers', JSON.stringify(answers));
}

// ============================================
// NAVIGATION
// ============================================
function nextQuestion() {
    const q = QUIZ_DATA[currentQuestion];

    // Validate answer exists (except slider which always has a value)
    if (q.type !== 'slider' && answers[q.id] === undefined) {
        return; // Don't advance without answer
    }

    // For sliders, ensure we have a value saved
    if (q.type === 'slider' && answers[q.id] === undefined) {
        const slider = document.getElementById('slider-input');
        if (slider) {
            answers[q.id] = parseInt(slider.value);
            saveAnswers();
        }
    }

    if (currentQuestion < QUIZ_DATA.length - 1) {
        currentQuestion++;
        renderQuestion();
        updateProgress();
    } else {
        // Quiz complete - show email gate
        showEmailGate();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
        updateProgress();
    }
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / QUIZ_DATA.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('current-q').textContent = currentQuestion + 1;
    document.getElementById('total-q').textContent = QUIZ_DATA.length;
}

function updateNavigationButtons() {
    document.getElementById('btn-back').disabled = currentQuestion === 0;

    const q = QUIZ_DATA[currentQuestion];
    const nextBtn = document.getElementById('btn-next');

    if (currentQuestion === QUIZ_DATA.length - 1) {
        nextBtn.innerHTML = 'Finish &rarr;';
    } else {
        nextBtn.innerHTML = 'Next &rarr;';
    }

    // For sliders, always enabled. For others, only if answered
    if (q.type === 'slider') {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = answers[q.id] === undefined;
    }
}

// ============================================
// EMAIL GATE
// ============================================
function showEmailGate() {
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('nav-buttons').classList.add('hidden');
    document.getElementById('context-card').classList.add('hidden');
    document.getElementById('email-gate').classList.remove('hidden');

    // Update progress to 100%
    document.getElementById('progress-bar').style.width = '100%';
    document.getElementById('current-q').textContent = '✓';
}

async function submitLead() {
    const name = document.getElementById('lead-name').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const errorEl = document.getElementById('email-error');

    // Validation
    if (!name) {
        errorEl.textContent = 'Please enter your name';
        errorEl.classList.remove('hidden');
        return;
    }

    if (!email || !isValidEmail(email)) {
        errorEl.textContent = 'Please enter a valid email address';
        errorEl.classList.remove('hidden');
        return;
    }

    errorEl.classList.add('hidden');

    // Show loading
    document.getElementById('email-gate').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');

    // Prepare payload
    const payload = {
        name: name,
        email: email,
        partner_id: sessionStorage.getItem('partner_id') || null,
        calculator_data: calculatorData,
        quiz_answers: answers
    };

    try {
        // Submit to API
        const result = await submitLeadToAPI(payload);

        // Save result for report page
        sessionStorage.setItem('lead_result', JSON.stringify(result));

        // Redirect to report
        const partnerId = sessionStorage.getItem('partner_id');
        const reportUrl = partnerId ? `report.html?partner=${partnerId}` : 'report.html';
        window.location.href = reportUrl;

    } catch (error) {
        console.error('Submission error:', error);
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('email-gate').classList.remove('hidden');
        errorEl.textContent = 'Something went wrong. Please try again.';
        errorEl.classList.remove('hidden');
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// HELPERS
// ============================================
function getCategoryLabel(category) {
    const labels = {
        income: 'Income Security',
        assets: 'Asset Longevity',
        tax: 'Tax Efficiency',
        psychology: 'Psychological Readiness'
    };
    return labels[category] || category;
}
