# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CPP Bridge Calculator V2 - A static site that helps Canadians determine whether to delay CPP (Canada Pension Plan) benefits from age 65 to 70 using personal savings as a "bridge." All actuarial calculations run client-side in the browser (no backend required). Includes a lead generation funnel with quiz and report.

## Development

**Open in browser:** Simply open `index.html` or `calculator.html` in a browser. No build step or server required.

**Run tests (legacy):** The tests in `tests/` reference a FastAPI backend from V1 that is no longer used. The current V2 is a static site with no backend.

## Architecture

### Static Site Structure
```
index.html          - Landing page with hero, tools overview, insights
calculator.html     - CPP Bridge Calculator (actuarial tool)
quiz.html           - Retirement readiness quiz (12 questions)
report.html         - Personalized scorecard dashboard

js/
├── calculator.js   - Actuarial logic + calculator UI
├── quiz.js         - Quiz logic with QUIZ_DATA definitions
├── api.js          - API layer (mock mode by default, USE_MOCK_API=true)
├── report.js       - Report dashboard rendering
└── whitelabel.js   - Partner branding system (loads config/partners.json)

config/
└── partners.json   - White-label partner configurations
```

### User Flow
1. **Landing** (`index.html`): Marketing page with CTAs to calculator and quiz
2. **Calculator** (`calculator.html`): User inputs age, CPP, savings, health → sees bridge cost, breakeven age, win probability
3. **Quiz** (`quiz.html`): 12 questions across 4 categories (income, assets, tax, psychology) → email gate
4. **Report** (`report.html`): Personalized scorecard with category breakdowns and recommendations

Data passes between pages via `sessionStorage`:
- `retire_config`: Calculator inputs/outputs passed to quiz
- `lead_result`: Quiz results + score passed to report
- `partner_id`: White-label partner identifier

### Key Actuarial Logic (js/calculator.js)

**Core calculation flow:**
1. `calculateBridgeScenario(req)` - Main entry point, orchestrates all calculations
2. `calculateAnnuityDuePv()` - Present value of annuity due for bridge cost
3. `getSurvivalProbability()` - Cumulative survival probability using mortality table
4. `calculateActuarialEpv()` - Expected present value weighted by survival probability

**Embedded data:**
- `MORTALITY_TABLE` - OSFI mortality data (ages 0-110, male/female qx values)
- `CPP_DELAY_FACTOR = 1.42` - 42% increase for delaying 60 months
- `BRIDGE_DURATION_MONTHS = 60` - 5-year bridge period

**Health status adjustments:**
- Excellent: effective age = age - 3
- Poor: effective age = age + 5
- Average: no adjustment

### Scoring System (js/api.js)
- **Calculator points** (30 max): 15 for affordability, 15 for win probability ≥50%
- **Quiz points** (70 max): income (25), assets (20), tax (15), psychology (10)
- **Score categories**: <50 red, 50-74 amber, ≥75 green

### Quiz Structure (js/quiz.js)
12 questions across 4 categories defined in `QUIZ_DATA`:
- **Income Security** (q1-q3): pension, guaranteed income %, passive income
- **Asset Longevity** (q4-q6): withdrawal strategy, liquid savings, diversification
- **Tax Efficiency** (q7-q9): drawdown order, RRIF awareness, income splitting
- **Psychological Readiness** (q10-q12): confidence, retirement activities, family discussions

Question types: `boolean`, `slider`, `multiple_choice`

### White-Label System (js/whitelabel.js)
Partners access via `?partner=<id>` URL param. Config stored in `config/partners.json`. Supports custom branding (logo, colors, CTA). Partner ID persists in `sessionStorage` across page navigation.

## CIA Paper Validation

The calculator implements methodology from the CIA (Canadian Institute of Actuaries) 2020 paper. Key benchmark: at 1.0% real return and 1.1% wage growth, bridge cost should be ~7.35x annual CPP amount.

## Frontend Stack
- Tailwind CSS (via CDN)
- GSAP for animations (ScrollTrigger)
- Chart.js for breakeven visualization
- No build process - vanilla JS
