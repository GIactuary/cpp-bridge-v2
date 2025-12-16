import math
from app.models import Gender, HealthStatus

# Gompertz-Makeham Proxy for OSFI Table 42 (2025)
MALE_PARAMS = {'A': 0.000045, 'B': 0.092}
FEMALE_PARAMS = {'A': 0.000035, 'B': 0.098}


def get_base_qx(age: int, gender: Gender) -> float:
    """Returns probability of death within 1 year."""
    if age >= 115:
        return 1.0
    params = MALE_PARAMS if gender == Gender.MALE else FEMALE_PARAMS
    qx = params['A'] * math.exp(params['B'] * age)
    return min(qx, 1.0)


def get_effective_age(age: int, health: HealthStatus) -> int:
    """Applies Hybrid Age Ratings."""
    if health == HealthStatus.EXCELLENT:
        return max(0, age - 3)
    elif health == HealthStatus.POOR:
        return min(115, age + 5)
    return age


def get_survival_probability(current_age: int, target_age: int, gender: Gender, health: HealthStatus) -> float:
    """Cumulative probability P(Survival > target_age)."""
    if target_age <= current_age:
        return 1.0

    prob = 1.0
    eff_age = get_effective_age(current_age, health)
    years = target_age - current_age

    for i in range(years):
        qx = get_base_qx(eff_age + i, gender)
        prob *= (1.0 - qx)


    return prob

def get_life_expectancy(current_age: int, gender: Gender, health: HealthStatus) -> float:
    """Calculates "curtate" life expectancy (whole years)."""
    # e_x = sum of p_x for t=1 to infinity
    # We sum probabilities of surviving to age t
    
    le_sum = 0.0
    for age in range(current_age + 1, 116):
        le_sum += get_survival_probability(current_age, age, gender, health)
        
    # Standard approximation: Add 0.5 years for mid-year death
    return round(current_age + le_sum + 0.5, 1)
