import sys
import os

# Ensure we can import from app
sys.path.append(os.getcwd())

'''
Verification Script for Breakeven Discrepancy
checks Nominal Crossover vs PV Crossover
'''

from app.logic import calculate_annuity_due_pv
from app.config import CPP_DELAY_FACTOR

# Configuration
CPP_AT_65 = 1000.0
WAGE_GROWTH = 0.011
REAL_RATE = 0.03
MONTHLY_RATE = (1 + REAL_RATE)**(1/12) - 1
TARGET_AT_70 = CPP_AT_65 * CPP_DELAY_FACTOR * ((1 + WAGE_GROWTH)**5) # ~1499.84

print(f"CPP @ 65: {CPP_AT_65}")
print(f"CPP @ 70: {TARGET_AT_70:.2f}")
print(f"Real Rate: {REAL_RATE}")

print("\n--- Nominal (Cashflow Sum) ---")
# Check Nominal Crossover
nominal_early = 0
nominal_delayed = 0
for age in range(65, 90):
    # Add year's worth
    if age >= 65:
        nominal_early += CPP_AT_65 * 12
    if age >= 70:
        nominal_delayed += TARGET_AT_70 * 12
        
    diff = nominal_delayed - nominal_early
    print(f"Age {age}: Early=${nominal_early:,.0f}, Delayed=${nominal_delayed:,.0f}, Diff=${diff:,.0f}")
    
    if nominal_delayed > nominal_early:
        print(f"NOMINAL BREAKEVEN DETECTED AT AGE {age}")
        break

print("\n--- Economic (PV at 65) ---")
# Check PV Crossover (Logic from app/logic.py)
for age in range(66, 90):
    # STREAM A: Take at 65
    months_early = (age - 65) * 12
    pv_early_stream = calculate_annuity_due_pv(CPP_AT_65, MONTHLY_RATE, months_early)
    
    # STREAM B: Delay to 70
    if age < 70:
        pv_delayed_stream = 0
    else:
        months_delayed = (age - 70) * 12
        pv_at_70 = calculate_annuity_due_pv(TARGET_AT_70, MONTHLY_RATE, months_delayed)
        pv_delayed_stream = pv_at_70 / ((1 + MONTHLY_RATE)**60) # Discount back to 65
        
    diff = pv_delayed_stream - pv_early_stream
    # print(f"Age {age}: PV_Early=${pv_early_stream:,.0f}, PV_Delayed=${pv_delayed_stream:,.0f}, Diff=${diff:,.0f}")

    if pv_delayed_stream > pv_early_stream:
        print(f"ECONOMIC BREAKEVEN DETECTED AT AGE {age}")
        break
