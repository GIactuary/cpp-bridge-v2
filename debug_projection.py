import csv
import sys
import os

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.mortality import get_survival_probability
from app.models import Gender, HealthStatus

# --- CONFIGURATION (Matches Default User Case) ---
CURRENT_AGE = 55
START_AGE_EARLY = 65
START_AGE_DELAYED = 70
MAX_AGE = 115

GENDER = Gender.MALE
HEALTH = HealthStatus.AVERAGE
REAL_RATE = 0.03
MONTHLY_RATE = (1 + REAL_RATE)**(1/12) - 1

CPP_AT_65 = 1000.0
# Derived from logic: 1000 * 1.42 * (1.01)^5 ? 
# Actually, let's use the exact simplified logic from the app for the specific case.
# App logic: target = estimate * 1.42 * (1 + wage_growth)**5
# Default wage growth is 1%.
WAGE_GROWTH = 0.011
CPP_DELAY_FACTOR = 1.42
TARGET_AT_70 = CPP_AT_65 * CPP_DELAY_FACTOR * ((1 + WAGE_GROWTH)**5) # ~1499.84

OUTPUT_FILE = "projection_table.csv"

def generate_table():
    print(f"Generating projection for Age {CURRENT_AGE}, {GENDER}, {HEALTH}...")
    print(f"Real Rate: {REAL_RATE*100}%")
    print(f"CPP @ 65: ${CPP_AT_65}")
    print(f"CPP @ 70: ${TARGET_AT_70:.2f}")

    with open(OUTPUT_FILE, 'w', newline='') as csvfile:
        fieldnames = [
            'Month_Index', 
            'Current_Age_Year', 
            'Current_Age_Month', 
            'Is_Alive_Year_Start', # The granularity of our mortality lookup
            'Prob_Survival_To_Year_Start',
            'Discount_Factor',
            'Stream_Early_Cashflow',
            'Stream_Early_PV',
            'Stream_Delayed_Cashflow',
            'Stream_Delayed_PV'
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        total_pv_early = 0.0
        total_pv_delayed = 0.0

        # Loop from Current Age to Max Age
        # We start at t=0 (Current Month)
        months_total = (MAX_AGE - CURRENT_AGE) * 12
        
        for t in range(months_total):
            # Age Calculation
            age_years = CURRENT_AGE + (t // 12)
            age_month = t % 12
            
            # 1. Mortality (Annual Granularity as per app logic)
            # We use the probability of surviving to the start of the current year (or current age_years)
            # logic.py: prob_survive_to_start_of_year = get_survival_probability(current_age, age, gender, health)
            # Note: In logic.py loop `for age in range(start_age, 116)`, 'age' is the year we are IN. 
            # So for t=0 (Age 55), we need Prob(Survive 55->55) = 1.0.
            # For t=12 (Age 56), we need Prob(Survive 55->56).
            
            prob_survival = get_survival_probability(CURRENT_AGE, age_years, GENDER, HEALTH)

            # 2. Discount Factor (Monthly Precision)
            # t=0 -> 1.0. t=1 -> 1/(1+r)^(1) NO. 
            # logic.py says: months_from_now = (age - current_age) * 12 + month.
            # If we are at age 65, month 0. months_from_now = (65-55)*12 = 120.
            # discount = 1 / ((1+rm)^120).
            
            discount_factor = 1 / ((1 + MONTHLY_RATE)**t)

            # 3. Cashflows
            # Early Stream: Starts at Age 65 (t corresponds to age_years >= 65)
            cf_early = CPP_AT_65 if age_years >= START_AGE_EARLY else 0.0
            
            # Delayed Stream: Starts at Age 70
            cf_delayed = TARGET_AT_70 if age_years >= START_AGE_DELAYED else 0.0

            # 4. PV
            # Logic: PV = CF * DF * Prob
            # Note: logic.py does `epv += monthly_payment * discount_factor * prob`
            
            pv_early = cf_early * discount_factor * prob_survival
            pv_delayed = cf_delayed * discount_factor * prob_survival

            total_pv_early += pv_early
            total_pv_delayed += pv_delayed

            writer.writerow({
                'Month_Index': t,
                'Current_Age_Year': age_years,
                'Current_Age_Month': age_month,
                'Is_Alive_Year_Start': age_years,
                'Prob_Survival_To_Year_Start': f"{prob_survival:.6f}",
                'Discount_Factor': f"{discount_factor:.6f}",
                'Stream_Early_Cashflow': cf_early,
                'Stream_Early_PV': f"{pv_early:.4f}",
                'Stream_Delayed_Cashflow': f"{cf_delayed:.2f}",
                'Stream_Delayed_PV': f"{pv_delayed:.4f}"
            })

    print(f"\nDone! Output written to {OUTPUT_FILE}")
    print(f"Total EPV Early: ${total_pv_early:,.2f}")
    print(f"Total EPV Delayed: ${total_pv_delayed:,.2f}")

if __name__ == "__main__":
    generate_table()
