import csv
import os
from app.models import Gender, HealthStatus

# Load Mortality Table from CSV
MORTALITY_TABLE = {}

csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Mortality Table - Sheet1.csv")

try:
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            age = int(row['Age'])
            MORTALITY_TABLE[age] = {
                'male': float(row['Male-qx']),
                'female': float(row['Female-qx'])
            }
except FileNotFoundError:
    print(f"WARNING: Mortality table not found at {csv_path}. Using fallback.")

def get_base_qx(age: int, gender: Gender) -> float:
    """Returns probability of death within 1 year."""
    if age >= 115:
        return 1.0
    
    # Check table
    if age in MORTALITY_TABLE:
        key = 'male' if gender == Gender.MALE else 'female'
        return MORTALITY_TABLE[age][key]
    
    # Fallback (e.g. if table ends at 110)
    if age > 110:
        return 1.0
        
    # Should not happen if within range, but safe fallback
    return 1.0


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
