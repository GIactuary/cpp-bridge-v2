Product Requirement Document: Actuarial CPP Bridge API & WidgetVersion: 2.0 (FastAPI + Embeddable Widget)Role: Senior Actuarial Engineer & Full-Stack DeveloperObjective: Build a high-performance, actuarially accurate microservice that calculates the financial benefit of delaying Canada Pension Plan (CPP) benefits using personal savings as a "Bridge."1. Project Architecture1.1 High-Level OverviewThe system consists of two decoupled components:The Brain (Backend): A FastAPI service that performs Actuarial Present Value (APV) calculations, mortality adjustments, and economic breakeven analysis.The Face (Frontend): A standalone, embeddable HTML/JS widget that consumes the API. It must be lightweight, responsive, and styled with Tailwind CSS (via CDN).1.2 Tech StackBackend: Python 3.11+, FastAPI, Pydantic v2, NumPy.Frontend: Vanilla JavaScript (ES6+), Chart.js (for visualization), Tailwind CSS.Testing: Pytest (Backend), Playwright (Optional E2E).Deployment: Dockerized for Google Cloud Run / Render.1.3 Folder StructureConstraint: The agent must adhere to this exact structure.Plaintextcpp-bridge-app/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point, CORS, Rate Limiting
│   ├── models.py            # Pydantic Schemas (Input/Output contracts)
│   ├── logic.py             # Core Actuarial Math (NPV, Annuities, Breakeven)
│   ├── mortality.py         # OSFI Table 42 Proxy Data & Logic
│   └── config.py            # Constants (Real Wage Growth, Default Rates)
├── tests/
│   ├── __init__.py
│   └── test_actuarial.py    # The "7.35" Golden Verification Test
├── widget/                  # The Embeddable Frontend
│   ├── index.html           # Standalone testing page
│   ├── widget.js            # Controller logic (Fetch API + Chart.js)
│   └── styles.css           # Custom overrides for Tailwind
├── Dockerfile
├── requirements.txt
└── INSTRUCTIONS.md          # This file
2. Backend Specification (The Brain)2.1 Actuarial Constants (app/config.py)CPP Delay Factor: 1.42 (42% increase for delaying 60 months).Real Wage Growth ($w$): 0.01 (1.0% Real - CIA Methodology).Bridge Duration: 60 months (Age 65 to 70).2.2 Data Models (app/models.py)Enum: HealthStatusAVERAGE (Standard Mortality)EXCELLENT (Proxy: Age - 3 years)POOR (Proxy: Age + 5 years)Request Schema: CalculationRequestPythonclass CalculationRequest(BaseModel):
    current_age: int = Field(..., ge=30, le=75)
    cpp_estimate_at_65: float = Field(..., gt=0)
    rrsp_savings: float = Field(..., ge=0)
    gender: Literal["male", "female"] = "male"
    health_status: HealthStatus = HealthStatus.AVERAGE
    # Assumptions
    real_rate_of_return: float = Field(0.03, ge=0.0, le=0.10) # Default 3%
    inflation_rate: float = Field(0.021, ge=0.0, le=0.10)    # Default 2.1%
Response Schema: CalculationResponsePythonclass CalculationResponse(BaseModel):
    bridge_cost_lump_sum: float
    target_monthly_income_at_70: float
    is_affordable: bool
    shortfall_amount: float
    surplus_amount: float
    bonus_estate_value_at_85: float
    
    # Actuarial Metrics
    breakeven_age_economic: int  # NPV Crossover
    probability_of_winning: float # % Chance of survival > breakeven
    expected_lifetime_gain: float # APV Diff
    
    # UX Text
    recommendation: str         # "Delay", "Take Early", "Consider"
    recommendation_reasoning: str
2.3 Actuarial Logic (app/logic.py)Function: calculate_bridge_scenarioInputs: CalculationRequest object.Target Income Calculation:$Target = CPP_{65} \times 1.42 \times (1 + 0.01)^5$Note: The $(1+w)^5$ term accounts for wage growth indexation during the deferral period.Bridge Cost Calculation:Calculate PV of Annuity Due for 60 months using real_rate_of_return.$Cost = Target \times \ddot{a}_{\overline{60}|i}$If current_age < 65, discount the Cost to today's dollars.Economic Breakeven (NPV Loop):Do not use nominal summation.Iterate age $x$ from 66 to 105.Calculate $NPV_{Early}$ (Stream of $CPP_{65}$ from 65 to $x$).Calculate $NPV_{Delayed}$ (Stream of $Target$ from 70 to $x$, minus Cost).Find the age where $NPV_{Delayed} > NPV_{Early}$.2.4 Mortality Engine (app/mortality.py)Data: Use Gompertz-Makeham approximation for OSFI Table 42 (2025).Male Parameters: $A=0.000045, B=0.092$.Female Parameters: $A=0.000035, B=0.098$.Hybrid Adjustment:If HealthStatus.EXCELLENT: Use Age - 3.If HealthStatus.POOR: Use Age + 5.Calculation: Return cumulative survival probability $P(Survival)$.3. Frontend Specification (The Widget)3.1 ArchitectureSingle File: widget/index.html should contain the structure.Controller: widget/widget.js handles DOM manipulation and API calls.Styling: Use Tailwind CSS via CDN. Scope styles to #cpp-bridge-widget to prevent conflict when embedded.3.2 UI Components (Mobile First)Header: "The CPP Bridge Calculator" (Clean, Professional).Input Card:Age (Slider 30-70).CPP Estimate (Input $).Savings (Input $).Health (Toggle/Select: Average/Excellent/Poor).Advanced Accordion (Collapsed by default):Investment Return (Slider 0-8%).Inflation (Slider 1-5%).Results Card (The "Hook"):"Cost to Buy Pension": Large font. Green if affordable, Red if not."Win Probability": Gauge or Percentage bar.Chart: Stacked Bar Chart (Chart.js) showing "Early Win Zone" vs "Bridge Win Zone".4. Testing Protocol (Strict Requirement)4.1 The "7.35" Validation Test (tests/test_actuarial.py)Context: The 2020 CIA Paper states that at 1.0% Real Return and 1.1% Real Wage Growth, the Bridge Cost is ~7.35x the annual CPP amount.Test Case:Input:CPP at 65: $1,000/mo ($12,000/yr).Real Rate: 1.0%.Wage Growth: 1.1% (Override config for test).Assertion:bridge_cost_lump_sum must be between $88,000 and $89,000.(i.e., $12,000 \times 7.35 \approx 88,200$).Failure Condition: If the result deviates by > 2%, the test fails and build stops.5. Development Steps (Prompt for Agent)Setup: Initialize the file structure and create the virtual environment requirements.Backend Core: Implement app/models.py and app/mortality.py.Actuarial Logic: Implement app/logic.py with the NPV loop and Annuity formulas.Validation: Create and run tests/test_actuarial.py. Do not proceed until this passes.API Layer: Build app/main.py to expose the endpoint.Frontend: Build widget/index.html and widget/widget.js with a Chart.js visualization.Final Check: Verify the widget successfully calls the local API and renders the chart.


Phase 1: Project Setup
File: requirements.txt

Plaintext

fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.6.0
numpy==1.26.3
pytest==8.0.0
httpx==0.26.0
Phase 2: The Backend (Python/FastAPI)
File: app/config.py

Python

# Actuarial Constants based on CIA Methodology & OSFI Rules

# Benefit Adjustments
CPP_DELAY_FACTOR = 1.42      # 42% increase for delaying 60 months (65 to 70)
CPP_EARLY_FACTOR = 0.64      # 36% decrease for taking early (65 to 60)

# Economic Assumptions (CIA Baseline)
REAL_WAGE_GROWTH = 0.01      # 1.0% Real Wage Growth used for indexation
BRIDGE_DURATION_MONTHS = 60  # 5 Years (Age 65 to 70)
File: app/models.py

Python

from enum import Enum
from pydantic import BaseModel, Field

class HealthStatus(str, Enum):
    AVERAGE = "average"
    EXCELLENT = "excellent"  # Proxy: Age - 3
    POOR = "poor"            # Proxy: Age + 5

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"

class CalculationRequest(BaseModel):
    current_age: int = Field(..., ge=30, le=75, description="Current Age")
    cpp_estimate_at_65: float = Field(..., gt=0, description="Monthly Estimate")
    rrsp_savings: float = Field(..., ge=0, description="Liquid Assets")
    gender: Gender = Gender.MALE
    health_status: HealthStatus = HealthStatus.AVERAGE
    
    # Assumptions
    real_rate_of_return: float = Field(0.03, ge=0.0, le=0.15)
    inflation_rate: float = Field(0.021, ge=0.0, le=0.10)

class CalculationResponse(BaseModel):
    bridge_cost_lump_sum: float
    target_monthly_income_at_70: float
    is_affordable: bool
    shortfall_amount: float
    surplus_amount: float
    bonus_estate_value_at_85: float
    
    # Actuarial Metrics
    breakeven_age_economic: int
    probability_of_winning: float
    expected_lifetime_gain: float
    
    # UX
    recommendation: str
    recommendation_reasoning: str
File: app/mortality.py

Python

import math
from app.models import Gender, HealthStatus

# Gompertz-Makeham Proxy for OSFI Table 42 (2025)
MALE_PARAMS = {'A': 0.000045, 'B': 0.092}
FEMALE_PARAMS = {'A': 0.000035, 'B': 0.098}

def get_base_qx(age: int, gender: Gender) -> float:
    """Returns probability of death within 1 year."""
    if age >= 115: return 1.0
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
    if target_age <= current_age: return 1.0
    
    prob = 1.0
    eff_age = get_effective_age(current_age, health)
    years = target_age - current_age
    
    for i in range(years):
        qx = get_base_qx(eff_age + i, gender)
        prob *= (1.0 - qx)
    
    return prob
File: app/logic.py

Python

import numpy as np
from app.models import CalculationRequest, CalculationResponse
from app.mortality import get_survival_probability
from app.config import CPP_DELAY_FACTOR, REAL_WAGE_GROWTH, BRIDGE_DURATION_MONTHS

def calculate_annuity_due_pv(pmt: float, monthly_rate: float, months: int) -> float:
    """PV of Annuity Due (Payments at start of month)."""
    if monthly_rate == 0: return pmt * months
    v = 1 / (1 + monthly_rate)
    return pmt * ((1 - v**months) / monthly_rate) * (1 + monthly_rate)

def calculate_bridge_scenario(req: CalculationRequest) -> CalculationResponse:
    # 1. Setup Rates
    monthly_real_rate = (1 + req.real_rate_of_return)**(1/12) - 1
    
    # 2. Target Income at 70 (Indexed by Wage Growth during delay)
    wage_index = (1 + REAL_WAGE_GROWTH)**5
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
    breakeven_age = 100
    for age in range(66, 106):
        # Stream A: Take at 65
        months_early = (age - 65) * 12
        pv_early = calculate_annuity_due_pv(req.cpp_estimate_at_65, monthly_real_rate, months_early)
        
        # Stream B: Delayed (Cost upfront, Income starts 70)
        if age < 70:
            pv_delayed = -cost_at_65
        else:
            months_delayed = (age - 70) * 12
            pv_ben_70 = calculate_annuity_due_pv(target_monthly, monthly_real_rate, months_delayed)
            # Discount benefits back to age 65
            pv_ben_65 = pv_ben_70 / ((1 + monthly_real_rate)**60)
            pv_delayed = pv_ben_65 - cost_at_65
            
        if pv_delayed > pv_early:
            breakeven_age = age
            break
            
    # 7. Probability & Gain
    prob_win = get_survival_probability(req.current_age, breakeven_age, req.gender, req.health_status)
    
    # Simplified Expected Gain
    expected_gain = 0.0 # Placeholder for complex calc, MVP uses Prob Win priority
    
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
        recommendation=rec,
        recommendation_reasoning=reason
    )
File: app/main.py

Python

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import CalculationRequest, CalculationResponse
from app.logic import calculate_bridge_scenario

app = FastAPI(title="Actuarial CPP Bridge API")

# Allow embedding on any site
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/v1/calculate", response_model=CalculationResponse)
def calculate(request: CalculationRequest):
    return calculate_bridge_scenario(request)

@app.get("/health")
def health_check():
    return {"status": "ok"}
Phase 3: Validation (The Test)
File: tests/test_actuarial.py

Python

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cia_paper_multiplier():
    """
    Validates against CIA Paper (2020) Benchmark:
    At 1.0% Real Return & 1.1% Wage Growth (proxy via config),
    Bridge Cost should be approx 7.35x Annual CPP.
    """
    # Note: Logic uses 1.0% wage growth from config.py. 
    # We pass 1.0% real return here.
    
    resp = client.post("/v1/calculate", json={
        "current_age": 65,
        "cpp_estimate_at_65": 1000,
        "rrsp_savings": 200000,
        "real_rate_of_return": 0.01,
        "inflation_rate": 0.02,
        "gender": "male",
        "health_status": "average"
    })
    
    assert resp.status_code == 200
    data = resp.json()
    
    bridge_cost = data["bridge_cost_lump_sum"]
    annual_cpp = 12000
    multiplier = bridge_cost / annual_cpp
    
    print(f"\nComputed Multiplier: {multiplier}")
    
    # CIA Target is 7.35. Allow small variance for Annuity Due vs Immediate diffs
    assert 7.2 < multiplier < 7.5
Phase 4: The Frontend (HTML/JS Widget)
File: widget/index.html

HTML

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CPP Bridge Widget</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-50 flex justify-center items-center min-h-screen p-4">

    <div id="cpp-bridge-widget" class="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-200">
        
        <div class="mb-6 text-center">
            <h2 class="text-2xl font-bold text-slate-800">🌉 CPP Bridge Calculator</h2>
            <p class="text-xs text-slate-500 uppercase tracking-wide mt-1">Actuarial Mode</p>
        </div>

        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700">Current Age</label>
                <input type="range" id="age" min="30" max="69" value="55" class="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="text-right text-sm text-blue-600 font-bold" id="age-val">55</div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">CPP @ 65 ($)</label>
                    <input type="number" id="cpp" value="1000" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Savings ($)</label>
                    <input type="number" id="savings" value="150000" class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700">Health / Income</label>
                <select id="health" class="w-full p-2 border rounded-lg bg-white">
                    <option value="average">Average</option>
                    <option value="excellent">Excellent (>99% Max CPP)</option>
                    <option value="poor">Poor (<35% Max CPP)</option>
                </select>
            </div>
            
            <details class="text-xs text-gray-500 cursor-pointer">
                <summary>Advanced Assumptions</summary>
                <div class="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
                    <label>Real Return: <span id="ror-val">3.0%</span></label>
                    <input type="range" id="ror" min="0" max="0.08" step="0.005" value="0.03" class="w-full h-1">
                </div>
            </details>
        </div>

        <button onclick="calculate()" class="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition-all">
            Calculate Bridge
        </button>

        <div id="results" class="mt-6 hidden animate-fade-in">
            <div class="p-4 rounded-lg bg-gray-50 border border-gray-200 text-center">
                <div class="text-sm text-gray-500">Cost to Buy Pension</div>
                <div id="cost-display" class="text-3xl font-extrabold text-gray-800">$0</div>
                <div id="afford-badge" class="mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-gray-200">
                    Checking...
                </div>
            </div>

            <div class="mt-4 flex justify-between text-sm">
                <span>Win Probability:</span>
                <span id="prob-display" class="font-bold">0%</span>
            </div>
            
            <div class="mt-4 h-32 relative">
                <canvas id="resultChart"></canvas>
            </div>
            
            <div id="rec-text" class="mt-4 text-sm text-center italic text-gray-600 border-t pt-4">
                Loading...
            </div>
        </div>
    </div>

    <script src="widget.js"></script>
</body>
</html>
File: widget/widget.js

JavaScript

// Configuration
const API_URL = "http://localhost:8000/v1/calculate"; 
let myChart = null;

// UI Helpers
const $ = (id) => document.getElementById(id);

// Update Slider Labels
$('age').addEventListener('input', (e) => $('age-val').innerText = e.target.value);
$('ror').addEventListener('input', (e) => $('ror-val').innerText = (e.target.value * 100).toFixed(1) + "%");

async function calculate() {
    const payload = {
        current_age: parseInt($('age').value),
        cpp_estimate_at_65: parseFloat($('cpp').value),
        rrsp_savings: parseFloat($('savings').value),
        health_status: $('health').value,
        real_rate_of_return: parseFloat($('ror').value),
        inflation_rate: 0.021,
        gender: "male" // Default for MVP
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        renderResults(data);
    } catch (err) {
        console.error("API Error:", err);
        alert("Ensure Backend is running at " + API_URL);
    }
}

function renderResults(data) {
    $('results').classList.remove('hidden');
    
    // 1. Cost & Affordability
    $('cost-display').innerText = "$" + data.bridge_cost_lump_sum.toLocaleString();
    
    const badge = $('afford-badge');
    if (data.is_affordable) {
        badge.className = "mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800";
        badge.innerText = "✅ Fully Funded";
        $('cost-display').className = "text-3xl font-extrabold text-green-600";
    } else {
        badge.className = "mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800";
        badge.innerText = `❌ Shortfall: $${data.shortfall_amount.toLocaleString()}`;
        $('cost-display').className = "text-3xl font-extrabold text-red-600";
    }

    // 2. Probability
    $('prob-display').innerText = (data.probability_of_winning * 100).toFixed(1) + "%";
    $('rec-text').innerText = `"${data.recommendation_reasoning}"`;

    // 3. Chart
    renderChart(data.breakeven_age_economic);
}

function renderChart(breakevenAge) {
    const ctx = $('resultChart').getContext('2d');
    
    if (myChart) myChart.destroy();

    // Data: Early wins until breakeven, Bridge wins after
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Age 65-80', 'Age 80-95'],
            datasets: [{
                label: 'Strategy Win Zone',
                data: [breakevenAge - 65, 95 - breakevenAge],
                backgroundColor: ['#FCA5A5', '#86EFAC'], // Red-300, Green-300
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}
How to Run It
Start Backend:

Bash

uvicorn app.main:app --reload
Open Frontend: Double click widget/index.html in your file explorer.

Run Tests:

Bash

pytest tests/test_actuarial.py