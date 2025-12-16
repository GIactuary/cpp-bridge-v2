import numpy as np
from app.models import CalculationRequest, CalculationResponse
from app.mortality import get_survival_probability, get_life_expectancy
from app.config import CPP_DELAY_FACTOR, BRIDGE_DURATION_MONTHS


def calculate_annuity_due_pv(pmt: float, monthly_rate: float, months: int) -> float:
    """PV of Annuity Due (Payments at start of month)."""
    if monthly_rate == 0:
        return pmt * months
    v = 1 / (1 + monthly_rate)
    return pmt * ((1 - v**months) / monthly_rate) * (1 + monthly_rate)


def calculate_bridge_scenario(req: CalculationRequest) -> CalculationResponse:
    # 1. Setup Rates
    monthly_real_rate = (1 + req.real_rate_of_return)**(1/12) - 1

    # 2. Target Income at 70 (Indexed by Wage Growth during delay)
    wage_index = (1 + req.wage_growth)**5
    target_monthly = req.cpp_estimate_at_65 * CPP_DELAY_FACTOR * wage_index

    # 3. Bridge Cost (PV at Age 65)
    cost_at_65 = calculate_annuity_due_pv(target_monthly, monthly_real_rate, BRIDGE_DURATION_MONTHS)

    # Discount to Today (if user < 65)
    years_to_65 = max(0, 65 - req.current_age)
    cost_today = cost_at_65 / ((1 + req.real_rate_of_return)**years_to_65)

    # 4. Affordability
    is_affordable = req.rrsp_savings >= cost_today
    shortfall = max(0, cost_today - req.rrsp_savings)
    surplus = max(0, req.rrsp_savings - cost_today)

    # 5. Bonus Estate (Surplus invested to 85)
    bonus_estate = 0.0
    if surplus > 0:
        years_to_85 = max(0, 85 - req.current_age)
        bonus_estate = surplus * ((1 + req.real_rate_of_return)**years_to_85)

    # 6. Economic Breakeven (NPV Crossover Loop)
    # FIX: Compare the Income Streams directly. 
    # Do NOT subtract the Bridge Cost (Liquidity) from the value.
    breakeven_age = 100
    
    for age in range(66, 106):
        # STREAM A: Take at 65 ($1,000/mo forever)
        months_early = (age - 65) * 12
        pv_early_stream = calculate_annuity_due_pv(req.cpp_estimate_at_65, monthly_real_rate, months_early)
        
        # STREAM B: Delay to 70 ($0 for 5 yrs, then $1,500/mo)
        if age < 70:
            pv_delayed_stream = 0 # You have received nothing from CPP yet
        else:
            months_delayed = (age - 70) * 12
            # PV at age 70
            pv_at_70 = calculate_annuity_due_pv(target_monthly, monthly_real_rate, months_delayed)
            # Discount back to age 65
            pv_delayed_stream = pv_at_70 / ((1 + monthly_real_rate)**60)
            
        # The Comparison
        if pv_delayed_stream > pv_early_stream:
            breakeven_age = age
            break

    # 7. Probability & Gain
    prob_win = get_survival_probability(req.current_age, breakeven_age, req.gender, req.health_status)

    # Simplified Expected Gain
    expected_gain = 0.0  # Placeholder for complex calc, MVP uses Prob Win priority

    # 8. Recommendation
    rec = "Take at 65"
    reason = "Savings insufficient."
    if is_affordable:
        if prob_win > 0.60:
            rec = "Delay to 70"
            reason = f"You have a {prob_win:.1%} chance of winning. Breakeven: {breakeven_age}."
        elif prob_win > 0.50:
            rec = "Consider Delaying"
            reason = f"It's a coin toss ({prob_win:.1%}). Delaying is insurance against living too long."
        else:
            reason = f"Odds favor taking early ({prob_win:.1%} chance of win)."

    return CalculationResponse(
        bridge_cost_lump_sum=round(cost_today, 2),
        target_monthly_income_at_70=round(target_monthly, 2),
        is_affordable=is_affordable,
        shortfall_amount=round(shortfall, 2),
        surplus_amount=round(surplus, 2),
        bonus_estate_value_at_85=round(bonus_estate, 2),
        breakeven_age_economic=breakeven_age,
        probability_of_winning=round(prob_win, 4),
        expected_lifetime_gain=round(expected_gain, 2),
        life_expectancy=get_life_expectancy(req.current_age, req.gender, req.health_status),
        recommendation=rec,
        recommendation_reasoning=reason
    )
