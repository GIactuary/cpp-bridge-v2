// ============================================
// QUIZ STATE MACHINE WITH BRANCHING LOGIC
// ============================================

// Gate questions (unscored, determine which questions to show)
const GATE_QUESTIONS = [
    {
        id: "gate_spouse",
        category: "situation",
        question: "Do you have a spouse or partner?",
        type: "boolean",
        isGate: true
    },
    {
        id: "gate_corporation",
        category: "situation",
        question: "Do you own a corporation or have significant business retained earnings?",
        type: "boolean",
        isGate: true
    },
    {
        id: "gate_children",
        category: "situation",
        question: "Do you have children or grandchildren you may financially support?",
        type: "boolean",
        isGate: true
    },
    {
        id: "gate_homeowner",
        category: "situation",
        question: "Do you own your primary residence?",
        type: "boolean",
        isGate: true
    }
];

// Scored questions with optional 'requires' field for conditional display
const QUIZ_DATA = [
    // ========== FOUNDATION & CLARITY (13 pts) ==========
    {
        id: "q1",
        category: "foundation",
        question: "Do you have a documented, written financial plan that projects your cash flow year-by-year up to age 95?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },
    {
        id: "q2",
        category: "foundation",
        question: "Have you consolidated all your financial data (RRSPs, TFSAs, Pensions, Debts) into a single dashboard?",
        type: "boolean",
        weight: 2,
        yes_score: 2,
        no_score: 0
    },
    {
        id: "q3",
        category: "foundation",
        question: "On a scale of 1-10, how confident are you that you will not outlive your money if you live to age 100?",
        type: "slider",
        min: 1,
        max: 10,
        step: 1,
        unit: "/10",
        weight: 2,
        scoring: "proportional"
    },
    {
        id: "q4",
        category: "foundation",
        question: "Do you have a clear vision of your \"Go-Go\" (active) years versus your \"Slow-Go\" (passive) years in retirement?",
        type: "boolean",
        weight: 2,
        yes_score: 2,
        no_score: 0
    },
    {
        id: "q5",
        category: "foundation",
        question: "Are you working with a fee-only planner or using professional software to validate your assumptions?",
        type: "boolean",
        weight: 2,
        yes_score: 2,
        no_score: 0
    },

    // ========== INCOME SECURITY (22-27 pts depending on gates) ==========
    {
        id: "q6",
        category: "income",
        question: "Have you calculated the precise mathematical impact of deferring your CPP and OAS benefits to age 70?",
        type: "boolean",
        weight: 10,
        yes_score: 10,
        no_score: 0
    },
    {
        id: "q7",
        category: "income",
        question: "Do you have a Defined Benefit pension plan from an employer?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },
    {
        id: "q8",
        category: "income",
        question: "Are you aware of how your Child Rearing Drop-Out (CRDO) provisions affect your CPP calculation?",
        type: "boolean",
        weight: 2,
        yes_score: 2,
        no_score: 0
    },
    {
        id: "q9",
        category: "income",
        question: "Do you have a strategy to \"bridge\" your income from retirement age until your government benefits begin?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0,
        requires: "nearRetirement" // Auto-inferred from age >= 55
    },
    {
        id: "q10",
        category: "income",
        question: "Is your retirement income diversified between taxable, tax-deferred, and tax-free sources?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },

    // ========== TAX STRATEGY (30-40 pts depending on gates) ==========
    {
        id: "q11",
        category: "tax",
        question: "Do you have a specific algorithm for which account to withdraw from each year (e.g., RRSP first vs. TFSA first)?",
        type: "boolean",
        weight: 10,
        yes_score: 10,
        no_score: 0
    },
    {
        id: "q12",
        category: "tax",
        question: "Are you concerned about the Old Age Security (OAS) recovery tax (clawback) reducing your benefits?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },
    {
        id: "q13",
        category: "tax",
        question: "Have you explored an \"RRSP Meltdown\" strategy to lower your future tax liability before age 72?",
        type: "boolean",
        weight: 10,
        yes_score: 10,
        no_score: 0
    },
    {
        id: "q14",
        category: "tax",
        question: "Do you have a tax-efficient plan for extracting retained earnings from your corporation?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0,
        requires: "corporation"
    },
    {
        id: "q15",
        category: "tax",
        question: "Have you estimated the \"Terminal Tax\" liability of your estate (the tax bill when you pass away)?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },
    {
        id: "q16",
        category: "tax",
        question: "Are you utilizing \"Income Splitting\" opportunities with your spouse to lower your combined household tax bracket?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0,
        requires: "spouse"
    },

    // ========== LIFESTYLE REALITY (9-13 pts depending on gates) ==========
    {
        id: "q17",
        category: "lifestyle",
        question: "Have you accounted for a personal inflation rate that may be higher than the CPI (Consumer Price Index)?",
        type: "boolean",
        weight: 2,
        yes_score: 2,
        no_score: 0
    },
    {
        id: "q18",
        category: "lifestyle",
        question: "Does your plan include a specific buffer for long-term care or assisted living costs in your later years?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },
    {
        id: "q19",
        category: "lifestyle",
        question: "Have you modeled the financial impact of helping a child buy a home or funding a grandchild's education?",
        type: "boolean",
        weight: 2,
        yes_score: 2,
        no_score: 0,
        requires: "children"
    },
    {
        id: "q20",
        category: "lifestyle",
        question: "Are you planning to downsize your primary residence, and have you modeled the equity release?",
        type: "boolean",
        weight: 2,
        yes_score: 2,
        no_score: 0,
        requires: "homeowner"
    },
    {
        id: "q21",
        category: "lifestyle",
        question: "How accurately have you tracked your current monthly spending?",
        type: "slider",
        min: 1,
        max: 10,
        step: 1,
        unit: "/10",
        weight: 2,
        scoring: "proportional"
    },

    // ========== RISK & RESILIENCE (20-25 pts depending on gates) ==========
    {
        id: "q22",
        category: "risk",
        question: "If the stock market dropped 30% in the first two years of your retirement, would your plan survive?",
        type: "boolean",
        weight: 10,
        yes_score: 10,
        no_score: 0
    },
    {
        id: "q23",
        category: "risk",
        question: "Do you maintain a \"Cash Wedge\" (1-2 years of spending in liquid cash) to avoid selling assets in a downturn?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },
    {
        id: "q24",
        category: "risk",
        question: "Have you stress-tested your plan against high inflation (e.g., 5-6% for a decade)?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },
    {
        id: "q25",
        category: "risk",
        question: "Does your plan account for the financial impact of the death of a spouse (loss of one CPP/OAS, lower tax brackets)?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0,
        requires: "spouse"
    }
];

// ============================================
// STATE
// ============================================
let phase = 'intro'; // 'intro', 'gates', 'questions', 'email'
let currentGateIndex = 0;
let currentQuestionIndex = 0;
let answers = {};
let userSituation = {
    spouse: null,
    corporation: null,
    children: null,
    homeowner: null,
    nearRetirement: null
};
let calculatorData = null;
let activeQuestions = [];

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
        alert('Please complete the calculator first.');
        window.location.href = 'index.html';
        return;
    }

    calculatorData = JSON.parse(configStr);

    // Auto-infer near retirement from age
    userSituation.nearRetirement = calculatorData.current_age >= 55;

    // Load any saved answers and situation
    const savedAnswers = sessionStorage.getItem('quiz_answers');
    const savedSituation = sessionStorage.getItem('user_situation');
    if (savedAnswers) answers = JSON.parse(savedAnswers);
    if (savedSituation) {
        userSituation = JSON.parse(savedSituation);
        // Recalculate active questions and skip to questions phase
        activeQuestions = getActiveQuestions();
        phase = 'questions';
        showQuestionsPhase();
        renderQuestion();
        updateProgress();
        return;
    }

    // Show personalization intro
    showPersonalizationIntro();
});

// ============================================
// PERSONALIZATION INTRO
// ============================================
function showPersonalizationIntro() {
    phase = 'intro';
    document.getElementById('personalization-intro').classList.remove('hidden');
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('nav-buttons').classList.add('hidden');
    document.getElementById('context-card').classList.add('hidden');

    // Update header
    document.getElementById('header-subtitle').textContent = 'Personalizing Your Quiz';
    document.getElementById('current-q').textContent = '';
    document.getElementById('total-q-wrapper').classList.add('hidden');
    document.getElementById('progress-bar').style.width = '0%';
}

function startPersonalization() {
    phase = 'gates';
    currentGateIndex = 0;
    document.getElementById('personalization-intro').classList.add('hidden');
    document.getElementById('question-container').classList.remove('hidden');
    document.getElementById('nav-buttons').classList.remove('hidden');
    document.getElementById('context-card').classList.add('hidden');

    renderGateQuestion();
    updateGateProgress();
}

// ============================================
// GATE QUESTIONS
// ============================================
function renderGateQuestion() {
    const q = GATE_QUESTIONS[currentGateIndex];
    const container = document.getElementById('question-container');

    let html = `
        <div class="fade-enter-active">
            <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                Personalizing Your Quiz
            </p>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">
                ${q.question}
            </h2>
            <div class="space-y-3">
                <button onclick="selectGate(true)" id="btn-yes"
                    class="w-full p-4 text-left bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
                    <span class="font-medium">Yes</span>
                </button>
                <button onclick="selectGate(false)" id="btn-no"
                    class="w-full p-4 text-left bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
                    <span class="font-medium">No</span>
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
    updateGateNavigationButtons();
}

function selectGate(value) {
    const q = GATE_QUESTIONS[currentGateIndex];
    const situationKey = q.id.replace('gate_', '');
    userSituation[situationKey] = value;

    // Visual feedback
    clearSelections();
    highlightSelection(value ? 'btn-yes' : 'btn-no');

    // Save situation
    sessionStorage.setItem('user_situation', JSON.stringify(userSituation));

    // Auto-advance after short delay
    setTimeout(() => nextGate(), 300);
}

function nextGate() {
    if (currentGateIndex < GATE_QUESTIONS.length - 1) {
        currentGateIndex++;
        renderGateQuestion();
        updateGateProgress();
    } else {
        // Gates complete, move to scored questions
        finishGates();
    }
}

function previousGate() {
    if (currentGateIndex > 0) {
        currentGateIndex--;
        renderGateQuestion();
        updateGateProgress();
    } else {
        // Go back to intro
        showPersonalizationIntro();
    }
}

function updateGateProgress() {
    const progress = ((currentGateIndex + 1) / GATE_QUESTIONS.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('header-subtitle').textContent = 'Personalizing Your Quiz';
    document.getElementById('current-q').textContent = currentGateIndex + 1;
    document.getElementById('total-q-wrapper').classList.remove('hidden');
    document.getElementById('total-q').textContent = GATE_QUESTIONS.length;
}

function updateGateNavigationButtons() {
    const backBtn = document.getElementById('btn-back');
    const nextBtn = document.getElementById('btn-next');

    backBtn.disabled = false; // Can always go back in gates
    nextBtn.classList.add('hidden'); // Hide next button during gates (auto-advance)
}

function finishGates() {
    // Calculate active questions based on gates
    activeQuestions = getActiveQuestions();

    // Save situation
    sessionStorage.setItem('user_situation', JSON.stringify(userSituation));

    // Transition to questions phase
    phase = 'questions';
    currentQuestionIndex = 0;
    showQuestionsPhase();
    renderQuestion();
    updateProgress();
}

// ============================================
// QUESTIONS PHASE
// ============================================
function showQuestionsPhase() {
    document.getElementById('personalization-intro').classList.add('hidden');
    document.getElementById('question-container').classList.remove('hidden');
    document.getElementById('nav-buttons').classList.remove('hidden');
    document.getElementById('context-card').classList.remove('hidden');

    // Update context card
    updateContextCard();

    // Show next button again
    document.getElementById('btn-next').classList.remove('hidden');
}

function getActiveQuestions() {
    return QUIZ_DATA.filter(q => {
        if (!q.requires) return true;
        return userSituation[q.requires] === true;
    });
}

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
    const q = activeQuestions[currentQuestionIndex];
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
    const q = activeQuestions[currentQuestionIndex];
    answers[q.id] = value;
    saveAnswers();

    // Visual feedback
    clearSelections();
    highlightSelection(value ? 'btn-yes' : 'btn-no');

    // Auto-advance after short delay
    setTimeout(() => nextQuestion(), 300);
}

function selectOption(index) {
    const q = activeQuestions[currentQuestionIndex];
    answers[q.id] = index;
    saveAnswers();

    // Visual feedback
    clearSelections();
    highlightSelection(`opt-${index}`);

    // Auto-advance
    setTimeout(() => nextQuestion(), 300);
}

function updateSlider(value) {
    const q = activeQuestions[currentQuestionIndex];
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
    if (phase === 'gates') {
        nextGate();
        return;
    }

    const q = activeQuestions[currentQuestionIndex];

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

    if (currentQuestionIndex < activeQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
        updateProgress();
    } else {
        // Quiz complete - show email gate
        showEmailGate();
    }
}

function previousQuestion() {
    if (phase === 'gates') {
        previousGate();
        return;
    }

    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
        updateProgress();
    } else {
        // Go back to gates (reset to last gate)
        phase = 'gates';
        currentGateIndex = GATE_QUESTIONS.length - 1;
        document.getElementById('context-card').classList.add('hidden');
        renderGateQuestion();
        updateGateProgress();
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / activeQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('header-subtitle').textContent = 'Retirement Readiness Assessment';
    document.getElementById('current-q').textContent = currentQuestionIndex + 1;
    document.getElementById('total-q-wrapper').classList.remove('hidden');
    document.getElementById('total-q').textContent = activeQuestions.length;
}

function updateNavigationButtons() {
    document.getElementById('btn-back').disabled = false;

    const q = activeQuestions[currentQuestionIndex];
    const nextBtn = document.getElementById('btn-next');

    nextBtn.classList.remove('hidden');

    if (currentQuestionIndex === activeQuestions.length - 1) {
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
    phase = 'email';
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

    // Prepare payload with user situation
    const payload = {
        name: name,
        email: email,
        partner_id: sessionStorage.getItem('partner_id') || null,
        calculator_data: calculatorData,
        quiz_answers: answers,
        user_situation: userSituation
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
        situation: 'About You',
        foundation: 'Foundation & Clarity',
        income: 'Income Security',
        tax: 'Tax Strategy',
        lifestyle: 'Lifestyle Reality',
        risk: 'Risk & Resilience'
    };
    return labels[category] || category;
}
