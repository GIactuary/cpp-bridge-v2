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
// LOCAL SCORE CALCULATION
// ============================================
function calculateLocalScore(payload) {
    let calcPoints = 0;
    let quizPoints = 0;

    // Calculator points (30 max)
    // 15 points for affordability
    if (payload.calculator_data.is_affordable) {
        calcPoints += 15;
    }
    // 15 points for win probability >= 50%
    if (payload.calculator_data.win_probability >= 0.5) {
        calcPoints += 15;
    }

    // Quiz points calculation
    const answers = payload.quiz_answers;
    let categoryScores = { income: 0, assets: 0, tax: 0, psychology: 0 };
    const categoryMax = { income: 25, assets: 20, tax: 15, psychology: 10 };

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
        quizPoints += points;
    });

    const total = calcPoints + quizPoints;

    // Determine category and label
    let category, label;
    if (total < 50) {
        category = 'red';
        label = 'Critical Gaps Detected';
    } else if (total < 75) {
        category = 'amber';
        label = 'Optimizable';
    } else {
        category = 'green';
        label = 'Retirement Ready';
    }

    return {
        total: total,
        category: category,
        label: label,
        breakdown: {
            calculator: {
                points: calcPoints,
                affordable_points: payload.calculator_data.is_affordable ? 15 : 0,
                probability_points: payload.calculator_data.win_probability >= 0.5 ? 15 : 0
            },
            quiz: {
                points: quizPoints,
                income: {
                    points: categoryScores.income,
                    max: categoryMax.income,
                    rating: getRating(categoryScores.income, categoryMax.income)
                },
                assets: {
                    points: categoryScores.assets,
                    max: categoryMax.assets,
                    rating: getRating(categoryScores.assets, categoryMax.assets)
                },
                tax: {
                    points: categoryScores.tax,
                    max: categoryMax.tax,
                    rating: getRating(categoryScores.tax, categoryMax.tax)
                },
                psychology: {
                    points: categoryScores.psychology,
                    max: categoryMax.psychology,
                    rating: getRating(categoryScores.psychology, categoryMax.psychology)
                }
            }
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

    const verdicts = {
        income: "Your Income Security score suggests exploring additional guaranteed income sources like annuities or considering whether delaying CPP benefits could strengthen your foundation.",
        assets: "Your Asset Longevity score indicates room for improvement in your withdrawal strategy. A formal drawdown plan could help ensure your savings last.",
        tax: "Your Tax Efficiency score suggests potential optimization opportunities. Proper RRSP/TFSA drawdown sequencing could save significant taxes over your retirement.",
        psychology: "Your Psychological Readiness score suggests spending more time planning for your retirement lifestyle and discussing plans with family."
    };

    const recommendations = generateRecommendations(score, payload, weakest);

    return {
        verdict: verdicts[weakest],
        weakest_category: weakest,
        recommendations: recommendations
    };
}

function findWeakestCategory(quizBreakdown) {
    const categories = ['income', 'assets', 'tax', 'psychology'];
    let weakest = 'tax';
    let lowestRatio = 1;

    categories.forEach(cat => {
        const data = quizBreakdown[cat];
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

    // CPP-specific recommendation
    if (payload.calculator_data.win_probability > 0.5) {
        recommendations.push(`Consider delaying CPP to age 70 given your ${(payload.calculator_data.win_probability * 100).toFixed(0)}% probability of benefiting`);
    } else {
        recommendations.push("Review your CPP timing strategy - taking at 65 may be optimal for your situation");
    }

    // Category-specific recommendations
    const categoryRecs = {
        income: [
            "Explore annuity options to increase guaranteed income",
            "Review whether your employer offers any bridge benefits"
        ],
        assets: [
            "Create a formal written withdrawal strategy",
            "Ensure you have 2-5 years of expenses in liquid assets"
        ],
        tax: [
            "Consult with a tax professional about drawdown sequencing",
            "Consider RRSP meltdown strategies before age 72"
        ],
        psychology: [
            "Define specific goals and activities for your retirement",
            "Have a detailed financial discussion with your spouse/family"
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

// Fallback quiz data if QUIZ_DATA not available
function getQuizDataFallback() {
    return [
        { id: "q1", category: "income", type: "boolean", yes_score: 10, no_score: 0 },
        { id: "q2", category: "income", type: "slider", min: 0, max: 100, weight: 10 },
        { id: "q3", category: "income", type: "boolean", yes_score: 5, no_score: 0 },
        { id: "q4", category: "assets", type: "multiple_choice", options: [{ score: 10 }, { score: 5 }, { score: 0 }] },
        { id: "q5", category: "assets", type: "multiple_choice", options: [{ score: 5 }, { score: 3 }, { score: 0 }] },
        { id: "q6", category: "assets", type: "boolean", yes_score: 5, no_score: 0 },
        { id: "q7", category: "tax", type: "multiple_choice", options: [{ score: 7 }, { score: 3 }, { score: 0 }] },
        { id: "q8", category: "tax", type: "boolean", yes_score: 4, no_score: 0 },
        { id: "q9", category: "tax", type: "multiple_choice", options: [{ score: 4 }, { score: 2 }, { score: 0 }] },
        { id: "q10", category: "psychology", type: "slider", min: 1, max: 10, weight: 4 },
        { id: "q11", category: "psychology", type: "boolean", yes_score: 3, no_score: 0 },
        { id: "q12", category: "psychology", type: "multiple_choice", options: [{ score: 3 }, { score: 1 }, { score: 0 }] }
    ];
}
