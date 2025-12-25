# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CPP Bridge Calculator V2 - A static site that helps Canadians determine whether to delay CPP (Canada Pension Plan) benefits from age 65 to 70 using personal savings as a "bridge." All actuarial calculations run client-side in the browser (no backend required).

## Development

**Open in browser:** Simply open `index.html` in a browser. No build step or server required.

**Run tests (legacy):** The tests in `tests/` reference a FastAPI backend from V1 that is no longer used. The current V2 is a static site.

## Architecture

### Static Site Structure
- `index.html` - Complete UI with Tailwind CSS (via CDN), Chart.js, dark mode support
- `widget.js` - All actuarial logic and UI controller code

### Key Actuarial Logic (widget.js)

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

### Calculation Outputs
- Bridge cost (lump sum needed at 65)
- Breakeven age (when delay strategy wins)
- Win probability (chance of living past breakeven)
- EPV comparison (actuarial present value for each strategy)

## CIA Paper Validation

The calculator implements methodology from the CIA (Canadian Institute of Actuaries) 2020 paper. Key benchmark: at 1.0% real return and 1.1% wage growth, bridge cost should be ~7.35x annual CPP amount.
