// ============================================
// API COMMUNICATION LAYER
// ============================================

// Configuration - Update this when deploying backend
const API_BASE_URL = 'https://your-backend-url.onrender.com';
const USE_MOCK_API = true; // Set to false when backend is ready

// ============================================
// MAIN API FUNCTION
// ============================================
async function submitLeadToAPI(payload) {
    if (USE_MOCK_API) {
        return submitLeadMock(payload);
    }

    const response = await fetch(`${API_BASE_URL}/v1/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API Error');
    }

    return response.json();
}

// ============================================
// MOCK API (For Development/Testing)
// ============================================
async function submitLeadMock(payload) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate score locally
    const score = calculateLocalScore(payload);

    return {
        success: true,
        uuid: generateUUID(),
        score: score,
        insights: generateLocalInsights(score, payload),
        partner: getPartnerConfig(payload.partner_id)
    };
}

// ============================================
// LOCAL SCORE CALCULATION (Quiz-only, 100 pts normalized)
// ============================================

// Base category max points (when all questions apply)
const BASE_CATEGORY_MAX = {
    foundation: 13,  // Q1-Q5: 5+2+2+2+2
    income: 27,      // Q6-Q10: 10+5+2+5+5
    tax: 40,         // Q11-Q16: 10+5+10+5+5+5
    lifestyle: 13,   // Q17-Q21: 2+5+2+2+2
    risk: 25         // Q22-Q25: 10+5+5+5
};
const BASE_TOTAL_RAW_POINTS = 118; // Sum of all weights

// Calculate dynamic max based on user situation (skip points for inapplicable questions)
function calculateDynamicMax(userSituation) {
    let total = BASE_TOTAL_RAW_POINTS;
    let categoryMax = { ...BASE_CATEGORY_MAX };

    if (!userSituation) return { total, categoryMax };

    // Q9: Bridge strategy (income, 5 pts) - requires nearRetirement
    if (!userSituation.nearRetirement) {
        total -= 5;
        categoryMax.income -= 5;
    }

    // Q14: Corporate retained earnings (tax, 5 pts) - requires corporation
    if (!userSituation.corporation) {
        total -= 5;
        categoryMax.tax -= 5;
    }

    // Q16: Income splitting with spouse (tax, 5 pts) - requires spouse
    if (!userSituation.spouse) {
        total -= 5;
        categoryMax.tax -= 5;
    }

    // Q19: Helping child buy home (lifestyle, 2 pts) - requires children
    if (!userSituation.children) {
        total -= 2;
        categoryMax.lifestyle -= 2;
    }

    // Q20: Downsizing residence (lifestyle, 2 pts) - requires homeowner
    if (!userSituation.homeowner) {
        total -= 2;
        categoryMax.lifestyle -= 2;
    }

    // Q25: Spouse death impact (risk, 5 pts) - requires spouse
    if (!userSituation.spouse) {
        total -= 5;
        categoryMax.risk -= 5;
    }

    return { total, categoryMax };
}

function calculateLocalScore(payload) {
    const answers = payload.quiz_answers;
    const userSituation = payload.user_situation || {};
    let categoryScores = { foundation: 0, income: 0, tax: 0, lifestyle: 0, risk: 0 };
    let rawPoints = 0;

    // Calculate dynamic max based on user situation
    const { total: dynamicMax, categoryMax } = calculateDynamicMax(userSituation);

    // Reference QUIZ_DATA from quiz.js
    const quizData = typeof QUIZ_DATA !== 'undefined' ? QUIZ_DATA : getQuizDataFallback();

    quizData.forEach(q => {
        const answer = answers[q.id];
        if (answer === undefined) return;

        let points = 0;
        switch (q.type) {
            case 'boolean':
                points = answer ? q.yes_score : q.no_score;
                break;
            case 'slider':
                const range = q.max - q.min;
                const normalized = (answer - q.min) / range;
                points = Math.round(normalized * q.weight);
                break;
            case 'multiple_choice':
                points = q.options[answer]?.score || 0;
                break;
        }

        categoryScores[q.category] += points;
        rawPoints += points;
    });

    // Normalize to 100-point scale using dynamic max
    const normalizedTotal = Math.round((rawPoints / dynamicMax) * 100);

    // Determine archetype and label based on normalized score
    let archetype, label;
    if (normalizedTotal <= 45) {
        archetype = 'red';
        label = 'Vulnerable Saver';
    } else if (normalizedTotal <= 75) {
        archetype = 'amber';
        label = 'Unoptimized Accumulator';
    } else {
        archetype = 'green';
        label = 'Resilient Strategist';
    }

    return {
        total: normalizedTotal,
        rawPoints: rawPoints,
        dynamicMax: dynamicMax,
        category: archetype,
        label: label,
        userSituation: userSituation,
        breakdown: {
            quiz: {
                points: rawPoints,
                maxPoints: dynamicMax,
                foundation: {
                    points: categoryScores.foundation,
                    max: categoryMax.foundation,
                    rating: getRating(categoryScores.foundation, categoryMax.foundation)
                },
                income: {
                    points: categoryScores.income,
                    max: categoryMax.income,
                    rating: getRating(categoryScores.income, categoryMax.income)
                },
                tax: {
                    points: categoryScores.tax,
                    max: categoryMax.tax,
                    rating: getRating(categoryScores.tax, categoryMax.tax)
                },
                lifestyle: {
                    points: categoryScores.lifestyle,
                    max: categoryMax.lifestyle,
                    rating: getRating(categoryScores.lifestyle, categoryMax.lifestyle)
                },
                risk: {
                    points: categoryScores.risk,
                    max: categoryMax.risk,
                    rating: getRating(categoryScores.risk, categoryMax.risk)
                }
            },
            // Calculator data preserved as separate insight (not scored)
            calculator: payload.calculator_data ? {
                bridge_cost: payload.calculator_data.bridge_cost,
                is_affordable: payload.calculator_data.is_affordable,
                win_probability: payload.calculator_data.win_probability,
                breakeven_age: payload.calculator_data.breakeven_age,
                recommendation: payload.calculator_data.recommendation
            } : null
        }
    };
}

function getRating(points, max) {
    const ratio = points / max;
    if (ratio >= 0.7) return 'high';
    if (ratio >= 0.4) return 'medium';
    return 'low';
}

// ============================================
// INSIGHTS GENERATION
// ============================================
function generateLocalInsights(score, payload) {
    const weakest = findWeakestCategory(score.breakdown.quiz);

    // Category-specific verdicts based on score thresholds
    const verdicts = {
        foundation: {
            low: "You lack a documented plan. Without year-by-year projections, you're flying blind into retirement.",
            high: "Strong foundation. You have clarity on your financial trajectory."
        },
        income: {
            low: "Your income strategy has gaps. Consider CPP/OAS optimization and income diversification.",
            high: "Your income sources are well-diversified and optimized."
        },
        tax: {
            low: "⚠️ Critical: No withdrawal algorithm detected. You could be overpaying taxes by tens of thousands of dollars.",
            high: "Strong tax efficiency. You understand decumulation sequencing."
        },
        lifestyle: {
            low: "Your plan may not account for real-world expenses like long-term care or family support.",
            high: "You've realistically modeled your retirement lifestyle phases."
        },
        risk: {
            low: "⚠️ Warning: Your plan hasn't been stress-tested. A market crash could derail your retirement.",
            high: "You've built resilience against market volatility and longevity risk."
        }
    };

    const weakestData = score.breakdown.quiz[weakest];
    const isLow = weakestData.rating === 'low' || weakestData.rating === 'medium';
    const verdict = isLow ? verdicts[weakest].low : verdicts[weakest].high;

    const recommendations = generateRecommendations(score, payload, weakest);

    return {
        verdict: verdict,
        weakest_category: weakest,
        recommendations: recommendations
    };
}

function findWeakestCategory(quizBreakdown) {
    const categories = ['foundation', 'income', 'tax', 'lifestyle', 'risk'];
    let weakest = 'tax';
    let lowestRatio = 1;

    categories.forEach(cat => {
        const data = quizBreakdown[cat];
        if (!data) return;
        const ratio = data.points / data.max;
        if (ratio < lowestRatio) {
            lowestRatio = ratio;
            weakest = cat;
        }
    });

    return weakest;
}

function generateRecommendations(score, payload, weakest) {
    const recommendations = [];

    // CPP-specific recommendation based on calculator data
    if (payload.calculator_data && payload.calculator_data.win_probability) {
        if (payload.calculator_data.win_probability > 0.5) {
            recommendations.push(`Consider delaying CPP to age 70 given your ${(payload.calculator_data.win_probability * 100).toFixed(0)}% probability of benefiting`);
        } else {
            recommendations.push("Review your CPP timing strategy - taking at 65 may be optimal for your situation");
        }
    }

    // Category-specific recommendations
    const categoryRecs = {
        foundation: [
            "Create a documented, year-by-year cash flow projection to age 95",
            "Consolidate all your financial data into a single planning tool"
        ],
        income: [
            "Calculate the exact benefit of deferring CPP/OAS to age 70",
            "Explore whether a bridge strategy makes sense for your situation"
        ],
        tax: [
            "Develop a specific algorithm for which accounts to withdraw from each year",
            "Explore RRSP meltdown strategies before mandatory RRIF conversions at 72"
        ],
        lifestyle: [
            "Build a specific buffer for long-term care costs in your later years",
            "Track your current spending accurately to project realistic retirement needs"
        ],
        risk: [
            "Stress-test your plan against a 30% market drop in early retirement",
            "Build a Cash Wedge of 1-2 years expenses in liquid savings"
        ]
    };

    // Add 2 recommendations for weakest category
    if (categoryRecs[weakest]) {
        recommendations.push(...categoryRecs[weakest]);
    }

    return recommendations.slice(0, 4); // Max 4 recommendations
}

// ============================================
// PARTNER CONFIGURATION
// ============================================
function getPartnerConfig(partnerId) {
    const partners = {
        optiml: {
            id: 'optiml',
            cta_text: 'Get Your Free Tax Analysis',
            cta_url: 'https://optiml.ca/book-demo'
        },
        adviice: {
            id: 'adviice',
            cta_text: 'Start Your Financial Plan',
            cta_url: 'https://adviice.ca/signup'
        }
    };

    return partners[partnerId] || {
        id: 'default',
        cta_text: 'Book a Strategy Call',
        cta_url: '#contact'
    };
}

// ============================================
// UTILITIES
// ============================================
function generateUUID() {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Fallback quiz data if QUIZ_DATA not available (matches new 25-question structure with branching)
function getQuizDataFallback() {
    return [
        // Foundation (13 pts) - always shown
        { id: "q1", category: "foundation", type: "boolean", weight: 5, yes_score: 5, no_score: 0 },
        { id: "q2", category: "foundation", type: "boolean", weight: 2, yes_score: 2, no_score: 0 },
        { id: "q3", category: "foundation", type: "slider", min: 1, max: 10, weight: 2 },
        { id: "q4", category: "foundation", type: "boolean", weight: 2, yes_score: 2, no_score: 0 },
        { id: "q5", category: "foundation", type: "boolean", weight: 2, yes_score: 2, no_score: 0 },
        // Income (22-27 pts) - Q9 conditional
        { id: "q6", category: "income", type: "boolean", weight: 10, yes_score: 10, no_score: 0 },
        { id: "q7", category: "income", type: "boolean", weight: 5, yes_score: 5, no_score: 0 },
        { id: "q8", category: "income", type: "boolean", weight: 2, yes_score: 2, no_score: 0 },
        { id: "q9", category: "income", type: "boolean", weight: 5, yes_score: 5, no_score: 0, requires: "nearRetirement" },
        { id: "q10", category: "income", type: "boolean", weight: 5, yes_score: 5, no_score: 0 },
        // Tax (30-40 pts) - Q14 and Q16 conditional
        { id: "q11", category: "tax", type: "boolean", weight: 10, yes_score: 10, no_score: 0 },
        { id: "q12", category: "tax", type: "boolean", weight: 5, yes_score: 5, no_score: 0 },
        { id: "q13", category: "tax", type: "boolean", weight: 10, yes_score: 10, no_score: 0 },
        { id: "q14", category: "tax", type: "boolean", weight: 5, yes_score: 5, no_score: 0, requires: "corporation" },
        { id: "q15", category: "tax", type: "boolean", weight: 5, yes_score: 5, no_score: 0 },
        { id: "q16", category: "tax", type: "boolean", weight: 5, yes_score: 5, no_score: 0, requires: "spouse" },
        // Lifestyle (9-13 pts) - Q19 and Q20 conditional
        { id: "q17", category: "lifestyle", type: "boolean", weight: 2, yes_score: 2, no_score: 0 },
        { id: "q18", category: "lifestyle", type: "boolean", weight: 5, yes_score: 5, no_score: 0 },
        { id: "q19", category: "lifestyle", type: "boolean", weight: 2, yes_score: 2, no_score: 0, requires: "children" },
        { id: "q20", category: "lifestyle", type: "boolean", weight: 2, yes_score: 2, no_score: 0, requires: "homeowner" },
        { id: "q21", category: "lifestyle", type: "slider", min: 1, max: 10, weight: 2 },
        // Risk (20-25 pts) - Q25 conditional
        { id: "q22", category: "risk", type: "boolean", weight: 10, yes_score: 10, no_score: 0 },
        { id: "q23", category: "risk", type: "boolean", weight: 5, yes_score: 5, no_score: 0 },
        { id: "q24", category: "risk", type: "boolean", weight: 5, yes_score: 5, no_score: 0 },
        { id: "q25", category: "risk", type: "boolean", weight: 5, yes_score: 5, no_score: 0, requires: "spouse" }
    ];
}
