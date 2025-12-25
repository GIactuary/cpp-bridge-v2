from typing import Dict, Any

# Quiz question configuration (must match frontend)
QUIZ_CONFIG = {
    "q1": {"category": "income", "type": "boolean", "weight": 10, "yes_score": 10, "no_score": 0},
    "q2": {"category": "income", "type": "slider", "weight": 10, "min": 0, "max": 100},
    "q3": {"category": "income", "type": "boolean", "weight": 5, "yes_score": 5, "no_score": 0},
    "q4": {"category": "assets", "type": "multiple_choice", "options": [10, 5, 0]},
    "q5": {"category": "assets", "type": "multiple_choice", "options": [5, 3, 0]},
    "q6": {"category": "assets", "type": "boolean", "weight": 5, "yes_score": 5, "no_score": 0},
    "q7": {"category": "tax", "type": "multiple_choice", "options": [7, 3, 0]},
    "q8": {"category": "tax", "type": "boolean", "weight": 4, "yes_score": 4, "no_score": 0},
    "q9": {"category": "tax", "type": "multiple_choice", "options": [4, 2, 0]},
    "q10": {"category": "psychology", "type": "slider", "weight": 4, "min": 1, "max": 10},
    "q11": {"category": "psychology", "type": "boolean", "weight": 3, "yes_score": 3, "no_score": 0},
    "q12": {"category": "psychology", "type": "multiple_choice", "options": [3, 1, 0]},
}

CATEGORY_MAX = {
    "income": 25,
    "assets": 20,
    "tax": 15,
    "psychology": 10
}


def calculate_score(calculator_data: Dict[str, Any], quiz_answers: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the complete retirement readiness score."""

    # Calculator points (30 max)
    calc_points = 0
    affordable_points = 15 if calculator_data.get('is_affordable', False) else 0
    probability_points = 15 if calculator_data.get('win_probability', 0) >= 0.5 else 0
    calc_points = affordable_points + probability_points

    # Quiz points by category
    category_scores = {"income": 0, "assets": 0, "tax": 0, "psychology": 0}

    for q_id, config in QUIZ_CONFIG.items():
        answer = quiz_answers.get(q_id)
        if answer is None:
            continue

        points = 0

        if config["type"] == "boolean":
            points = config["yes_score"] if answer else config["no_score"]

        elif config["type"] == "slider":
            range_val = config["max"] - config["min"]
            normalized = (answer - config["min"]) / range_val if range_val > 0 else 0
            points = round(normalized * config["weight"])

        elif config["type"] == "multiple_choice":
            if isinstance(answer, int) and 0 <= answer < len(config["options"]):
                points = config["options"][answer]

        category_scores[config["category"]] += points

    quiz_points = sum(category_scores.values())
    total = calc_points + quiz_points

    # Determine category
    if total < 50:
        category = "red"
        label = "Critical Gaps Detected"
    elif total < 75:
        category = "amber"
        label = "Optimizable"
    else:
        category = "green"
        label = "Retirement Ready"

    # Build response
    return {
        "total": total,
        "category": category,
        "label": label,
        "breakdown": {
            "calculator": {
                "points": calc_points,
                "affordable_points": affordable_points,
                "probability_points": probability_points
            },
            "quiz": {
                "points": quiz_points,
                "income": {
                    "points": category_scores["income"],
                    "max": CATEGORY_MAX["income"],
                    "rating": get_rating(category_scores["income"], CATEGORY_MAX["income"])
                },
                "assets": {
                    "points": category_scores["assets"],
                    "max": CATEGORY_MAX["assets"],
                    "rating": get_rating(category_scores["assets"], CATEGORY_MAX["assets"])
                },
                "tax": {
                    "points": category_scores["tax"],
                    "max": CATEGORY_MAX["tax"],
                    "rating": get_rating(category_scores["tax"], CATEGORY_MAX["tax"])
                },
                "psychology": {
                    "points": category_scores["psychology"],
                    "max": CATEGORY_MAX["psychology"],
                    "rating": get_rating(category_scores["psychology"], CATEGORY_MAX["psychology"])
                }
            }
        }
    }


def get_rating(points: int, max_points: int) -> str:
    """Convert score to rating label."""
    ratio = points / max_points if max_points > 0 else 0
    if ratio >= 0.7:
        return "high"
    elif ratio >= 0.4:
        return "medium"
    return "low"


def generate_insights(score: Dict[str, Any], calculator_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate personalized insights based on scores."""

    quiz_breakdown = score["breakdown"]["quiz"]

    # Find weakest category
    categories = ["income", "assets", "tax", "psychology"]
    weakest = min(categories, key=lambda c: quiz_breakdown[c]["points"] / quiz_breakdown[c]["max"])

    # Generate verdict
    verdicts = {
        "income": "Your Income Security score suggests exploring additional guaranteed income sources. Consider whether an annuity or pension buyback could strengthen your retirement foundation.",
        "assets": "Your Asset Longevity score indicates room for improvement in your withdrawal strategy. A formal drawdown plan could help ensure your savings last throughout retirement.",
        "tax": "Your Tax Efficiency score suggests significant optimization opportunities. The sequence of withdrawals from RRSP, TFSA, and non-registered accounts can dramatically impact your lifetime tax burden.",
        "psychology": "Your Psychological Readiness score suggests spending more time envisioning your retirement lifestyle. Having clear plans for activities and purpose can significantly impact retirement satisfaction."
    }

    # Generate recommendations
    base_recommendations = [
        "Review your CPP timing strategy with a qualified financial advisor",
        "Consider the tax implications of your account withdrawal sequence",
        "Ensure your investment portfolio matches your risk tolerance and timeline"
    ]

    category_recommendations = {
        "income": "Explore options for increasing guaranteed income (annuities, pension maximization)",
        "assets": "Develop a formal written withdrawal strategy with professional guidance",
        "tax": "Consult with a tax professional about RRSP meltdown strategies and income splitting",
        "psychology": "Create a retirement lifestyle plan including activities, social connections, and purpose"
    }

    recommendations = [category_recommendations[weakest]] + base_recommendations[:2]

    return {
        "verdict": verdicts[weakest],
        "weakest_category": weakest,
        "recommendations": recommendations
    }


def get_partner_config(partner_id: str) -> Dict[str, str]:
    """Get CTA configuration for a partner."""
    partners = {
        "optiml": {
            "id": "optiml",
            "cta_text": "Get Your Free Tax Analysis",
            "cta_url": "https://optiml.ca/book-demo"
        },
        "adviice": {
            "id": "adviice",
            "cta_text": "Start Your Financial Plan",
            "cta_url": "https://adviice.ca/signup"
        }
    }

    return partners.get(partner_id, {
        "id": "default",
        "cta_text": "Book a Strategy Call",
        "cta_url": "#contact"
    })
