# Retirement Scorecard Lead Generation Funnel
## Project Requirements Document (PRD) v1.0

**Last Updated:** December 2025  
**Document Type:** Technical Specification for LLM Coder  
**Project Codename:** CPP Bridge Funnel

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [File Structure](#3-file-structure)
4. [Data Schemas](#4-data-schemas)
5. [Phase 1: Calculator Modifications](#phase-1-calculator-modifications)
6. [Phase 2: Quiz Page](#phase-2-quiz-page)
7. [Phase 3: Report Page](#phase-3-report-page)
8. [Phase 4: White-Label System](#phase-4-white-label-system)
9. [Phase 5: Backend API](#phase-5-backend-api)
10. [Phase 6: Email Service](#phase-6-email-service)
11. [Deployment Guide](#phase-7-deployment)
12. [Testing Checklist](#testing-checklist)

---

## 1. EXECUTIVE SUMMARY

### What We're Building
A 3-step lead generation funnel that wraps an existing CPP Bridge Calculator:

```
[Calculator] → [12-Question Quiz] → [Email Gate] → [Report Dashboard]
```

### Current State
- Fully functional static calculator (HTML/JS/Tailwind)
- Runs entirely in the browser
- NO backend currently exists

### Future State
- Multi-page static frontend (GitHub Pages/Netlify)
- Lightweight FastAPI backend (Render/Cloud Run)
- Lead capture and scoring system
- White-label partner support

### Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | HTML5, Tailwind CSS, Vanilla JavaScript |
| Charts | Chart.js (existing) |
| Backend | Python FastAPI |
| Database | SQLite |
| Email | SendGrid API |
| Hosting (Frontend) | GitHub Pages or Netlify |
| Hosting (Backend) | Render or Cloud Run |

---

## 2. ARCHITECTURE OVERVIEW

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Static)                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │ index.html  │───▶│  quiz.html  │───▶│ report.html │            │
│  │ Calculator  │    │  12 Qs      │    │  Dashboard  │            │
│  └─────────────┘    └──────┬──────┘    └─────────────┘            │
│         │                   │                  ▲                   │
│         ▼                   ▼                  │                   │
│  ┌─────────────────────────────────────────────┐                  │
│  │           sessionStorage                     │                  │
│  │  - retire_config (calculator data)          │                  │
│  │  - quiz_answers (quiz responses)            │                  │
│  │  - partner_id (white-label tracking)        │                  │
│  │  - lead_result (score + analysis)           │                  │
│  └─────────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ POST /v1/leads
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ POST /v1/leads                                               │  │
│  │ - Validates quiz + calculator data                          │  │
│  │ - Calculates Readiness Score (0-100)                        │  │
│  │ - Saves lead to SQLite                                      │  │
│  │ - Triggers SendGrid email                                   │  │
│  │ - Returns { score, category, uuid, breakdown }              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ GET /admin/leads?key=SECRET                                 │  │
│  │ - Returns CSV download of all leads                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Summary

| Step | Page | Action | Storage |
|------|------|--------|---------|
| 1 | index.html | User enters calculator inputs | `sessionStorage.retire_config` |
| 2 | index.html | Clicks "Get Full Score" | Redirect to quiz.html |
| 3 | quiz.html | Loads, reads config | Pre-fill Q1 summary |
| 4 | quiz.html | Answers 12 questions | `sessionStorage.quiz_answers` |
| 5 | quiz.html | Enters email (Gate) | POST to /v1/leads |
| 6 | Backend | Calculates score | SQLite + SendGrid |
| 7 | report.html | Displays dashboard | Read from sessionStorage |

---

## 3. FILE STRUCTURE

```
/project-root
│
├── /frontend                    # GitHub Pages Repository
│   │
│   ├── index.html               # [MODIFY] Existing Calculator
│   ├── quiz.html                # [NEW] 12-Question Wizard
│   ├── report.html              # [NEW] Score Dashboard
│   │
│   ├── /css
│   │   └── styles.css           # [NEW] Custom styles (optional)
│   │
│   ├── /js
│   │   ├── calculator.js        # [MODIFY] Renamed from widget.js
│   │   ├── quiz.js              # [NEW] Quiz state machine
│   │   ├── report.js            # [NEW] Dashboard renderer
│   │   ├── whitelabel.js        # [NEW] Partner config loader
│   │   └── api.js               # [NEW] API communication layer
│   │
│   ├── /config
│   │   └── partners.json        # [NEW] White-label configs
│   │
│   └── /assets
│       └── /logos               # [NEW] Partner logo images
│           ├── default.svg
│           ├── optiml.png
│           └── adviice.png
│
└── /backend                     # Render Repository
    │
    ├── main.py                  # [NEW] FastAPI application
    ├── database.py              # [NEW] SQLite models & queries
    ├── email_service.py         # [NEW] SendGrid integration
    ├── scoring.py               # [NEW] Score calculation logic
    ├── schemas.py               # [NEW] Pydantic models
    ├── requirements.txt         # [NEW] Python dependencies
    ├── .env.example             # [NEW] Environment template
    └── /templates
        └── email_report.html    # [NEW] HTML email template
```

---

## 4. DATA SCHEMAS

### 4.1 Calculator Data (sessionStorage: `retire_config`)

```javascript
// Saved when user clicks "Get Full Score" on calculator
{
  "gender": "male",                    // "male" | "female"
  "current_age": 55,                   // 30-69
  "cpp_estimate_at_65": 1000,          // Monthly $ amount
  "rrsp_savings": 150000,              // Total savings $
  "health_status": "average",          // "excellent" | "average" | "poor"
  "real_rate_of_return": 0.035,        // Decimal (3.5%)
  "wage_growth": 0.011,                // Decimal (1.1%)
  
  // Calculated outputs from calculator
  "bridge_cost": 79507,                // $ required to bridge
  "is_affordable": true,               // savings >= bridge_cost
  "win_probability": 0.65,             // 0-1 decimal
  "breakeven_age": 81,                 // Age when delay beats early
  "life_expectancy": 83.8,             // Calculated LE
  "epv_early": 156000,                 // Expected PV if take at 65
  "epv_delayed": 189000,               // Expected PV if delay to 70
  "recommendation": "Delay to 70"      // Text recommendation
}
```

### 4.2 Quiz Questions Schema (quiz.js: `QUIZ_DATA`)

```javascript
const QUIZ_DATA = [
  // ========== INCOME SECURITY (3 questions, 25 pts max) ==========
  {
    "id": "q1",
    "category": "income",
    "question": "Beyond CPP and OAS, do you have a company pension plan (Defined Benefit)?",
    "type": "boolean",
    "weight": 10,
    "yes_score": 10,
    "no_score": 0
  },
  {
    "id": "q2",
    "category": "income",
    "question": "What percentage of your monthly retirement expenses will be covered by GUARANTEED income (pensions, annuities)?",
    "type": "slider",
    "min": 0,
    "max": 100,
    "step": 5,
    "weight": 10,
    "scoring": "proportional"  // score = (value/100) * weight
  },
  {
    "id": "q3",
    "category": "income",
    "question": "Do you have other sources of passive income (rental properties, dividends, royalties)?",
    "type": "boolean",
    "weight": 5,
    "yes_score": 5,
    "no_score": 0
  },

  // ========== ASSET LONGEVITY (3 questions, 20 pts max) ==========
  {
    "id": "q4",
    "category": "assets",
    "question": "Which best describes your withdrawal strategy?",
    "type": "multiple_choice",
    "options": [
      {"text": "I have a specific written plan reviewed by a professional", "score": 10},
      {"text": "I follow the 4% rule or similar guideline", "score": 5},
      {"text": "I withdraw as needed / no specific plan", "score": 0}
    ],
    "weight": 10
  },
  {
    "id": "q5",
    "category": "assets",
    "question": "How many years of retirement expenses do you have in liquid savings (cash, GICs, bonds)?",
    "type": "multiple_choice",
    "options": [
      {"text": "5+ years", "score": 5},
      {"text": "2-5 years", "score": 3},
      {"text": "Less than 2 years", "score": 0}
    ],
    "weight": 5
  },
  {
    "id": "q6",
    "category": "assets",
    "question": "Is your investment portfolio diversified across asset classes (stocks, bonds, real estate)?",
    "type": "boolean",
    "weight": 5,
    "yes_score": 5,
    "no_score": 0
  },

  // ========== TAX EFFICIENCY (3 questions, 15 pts max) ==========
  {
    "id": "q7",
    "category": "tax",
    "question": "Have you planned the optimal order for drawing from RRSP, TFSA, and non-registered accounts?",
    "type": "multiple_choice",
    "options": [
      {"text": "Yes, I have a tax-optimized drawdown plan", "score": 7},
      {"text": "I have a general idea but no formal plan", "score": 3},
      {"text": "No, I haven't considered this", "score": 0}
    ],
    "weight": 7
  },
  {
    "id": "q8",
    "category": "tax",
    "question": "Are you aware of the tax implications of RRIF minimum withdrawals starting at age 72?",
    "type": "boolean",
    "weight": 4,
    "yes_score": 4,
    "no_score": 0
  },
  {
    "id": "q9",
    "category": "tax",
    "question": "Have you considered income splitting strategies with a spouse/partner?",
    "type": "multiple_choice",
    "options": [
      {"text": "Yes, actively using pension splitting or spousal RRSP", "score": 4},
      {"text": "Aware but not implemented", "score": 2},
      {"text": "Not applicable or not considered", "score": 0}
    ],
    "weight": 4
  },

  // ========== PSYCHOLOGICAL READINESS (3 questions, 10 pts max) ==========
  {
    "id": "q10",
    "category": "psychology",
    "question": "How confident do you feel about managing your finances in retirement?",
    "type": "slider",
    "min": 1,
    "max": 10,
    "step": 1,
    "weight": 4,
    "scoring": "proportional"  // score = (value/10) * weight
  },
  {
    "id": "q11",
    "category": "psychology",
    "question": "Do you have a plan for meaningful activities (work, volunteering, hobbies) in retirement?",
    "type": "boolean",
    "weight": 3,
    "yes_score": 3,
    "no_score": 0
  },
  {
    "id": "q12",
    "category": "psychology",
    "question": "Have you discussed your retirement plans with your spouse/partner or family?",
    "type": "multiple_choice",
    "options": [
      {"text": "Yes, we have aligned expectations", "score": 3},
      {"text": "Somewhat, but not in detail", "score": 1},
      {"text": "No / Not applicable", "score": 0}
    ],
    "weight": 3
  }
];

// Point totals by category:
// Income:     25 pts max
// Assets:     20 pts max
// Tax:        15 pts max
// Psychology: 10 pts max
// Quiz Total: 70 pts max
// Calculator: 30 pts max (15 affordable + 15 win probability)
// GRAND TOTAL: 100 pts max
```

### 4.3 Quiz Answers (sessionStorage: `quiz_answers`)

```javascript
// Saved incrementally as user progresses through quiz
{
  "q1": true,           // boolean
  "q2": 65,             // slider value
  "q3": false,          // boolean
  "q4": 1,              // option index (0-based)
  "q5": 0,              // option index
  "q6": true,           // boolean
  "q7": 2,              // option index
  "q8": true,           // boolean
  "q9": 0,              // option index
  "q10": 7,             // slider value
  "q11": true,          // boolean
  "q12": 1              // option index
}
```

### 4.4 Lead Submission (POST /v1/leads)

```javascript
// Request body sent to backend
{
  "name": "John Smith",
  "email": "john@example.com",
  "partner_id": "optiml",           // or null if no partner
  
  // Calculator data
  "calculator_data": {
    "gender": "male",
    "current_age": 55,
    "cpp_estimate_at_65": 1000,
    "rrsp_savings": 150000,
    "health_status": "average",
    "bridge_cost": 79507,
    "is_affordable": true,
    "win_probability": 0.65,
    "breakeven_age": 81
  },
  
  // Quiz answers (raw)
  "quiz_answers": {
    "q1": true,
    "q2": 65,
    "q3": false,
    "q4": 1,
    "q5": 0,
    "q6": true,
    "q7": 2,
    "q8": true,
    "q9": 0,
    "q10": 7,
    "q11": true,
    "q12": 1
  }
}
```

### 4.5 Lead Response (Backend → Frontend)

```javascript
// Response from POST /v1/leads
{
  "success": true,
  "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  
  "score": {
    "total": 64,                    // 0-100
    "category": "amber",            // "red" | "amber" | "green"
    "label": "Optimizable",         // Human-readable label
    
    "breakdown": {
      "calculator": {
        "points": 15,               // out of 30
        "affordable_points": 15,    // out of 15
        "probability_points": 0     // out of 15 (win_prob was < 50%)
      },
      "quiz": {
        "points": 49,               // out of 70
        "income": {
          "points": 15,             // out of 25
          "max": 25,
          "rating": "high"          // "low" | "medium" | "high"
        },
        "assets": {
          "points": 13,
          "max": 20,
          "rating": "medium"
        },
        "tax": {
          "points": 11,
          "max": 15,
          "rating": "medium"
        },
        "psychology": {
          "points": 10,
          "max": 10,
          "rating": "high"
        }
      }
    }
  },
  
  "insights": {
    "verdict": "You have strong Income Security thanks to your pension, but your Tax Efficiency score suggests potential optimization opportunities. Consider consulting with a tax professional about RRSP/TFSA drawdown sequencing.",
    "weakest_category": "tax",
    "recommendations": [
      "Review your account drawdown sequence with a financial planner",
      "Consider delaying CPP to age 70 given your 65% probability of benefiting",
      "Explore income splitting strategies if you have a spouse"
    ]
  },
  
  "partner": {
    "id": "optiml",
    "cta_text": "Get Your Free Tax Analysis",
    "cta_url": "https://optiml.ca/book-demo"
  }
}
```

### 4.6 Database Schema (SQLite)

```sql
CREATE TABLE leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contact Info
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    partner_id TEXT,
    
    -- Calculator Inputs
    gender TEXT,
    current_age INTEGER,
    cpp_estimate_at_65 REAL,
    rrsp_savings REAL,
    health_status TEXT,
    bridge_cost REAL,
    is_affordable BOOLEAN,
    win_probability REAL,
    breakeven_age INTEGER,
    
    -- Quiz Answers (JSON blob)
    quiz_answers_json TEXT,
    
    -- Calculated Scores
    total_score INTEGER,
    score_category TEXT,
    income_score INTEGER,
    assets_score INTEGER,
    tax_score INTEGER,
    psychology_score INTEGER,
    
    -- Tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_partner ON leads(partner_id);
CREATE INDEX idx_leads_created ON leads(created_at);
```

---

## PHASE 1: CALCULATOR MODIFICATIONS

### Goal
Modify the existing calculator to save data and redirect to quiz.

### Files to Modify
- `index.html` → Add new CTA button
- `widget.js` → Rename to `calculator.js`, add handoff logic

### Step-by-Step Instructions

#### Step 1.1: Rename widget.js to calculator.js

```bash
mv widget.js js/calculator.js
```

#### Step 1.2: Update index.html script reference

Change line 332 from:
```html
<script src="widget.js"></script>
```
To:
```html
<script src="js/calculator.js"></script>
<script src="js/whitelabel.js"></script>
```

#### Step 1.3: Add "Get Full Score" Button

In `index.html`, find the "Calculate Strategy" button (around line 200) and ADD a new button BELOW it:

```html
<!-- Existing Calculate Button -->
<button onclick="runCalculation()"
    class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
    Calculate Strategy
</button>

<!-- NEW: Get Full Score Button (initially hidden) -->
<button id="get-full-score-btn"
    onclick="goToQuiz()"
    class="hidden w-full mt-3 py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:from-emerald-700 hover:to-emerald-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
    🎯 Get Your Full Retirement Score →
</button>
```

#### Step 1.4: Add Handoff Logic to calculator.js

Add this code at the END of `calculator.js`:

```javascript
// ============================================
// FUNNEL HANDOFF: Save data and redirect to quiz
// ============================================

let lastCalculationResult = null;

// Modify the existing runCalculation function to store results
// Find where renderResults(result) is called and add this line BEFORE it:
// lastCalculationResult = result;

function showGetScoreButton() {
    const btn = document.getElementById('get-full-score-btn');
    if (btn) {
        btn.classList.remove('hidden');
    }
}

function goToQuiz() {
    // Gather all calculator inputs
    const calculatorData = {
        // User inputs
        gender: document.querySelector('input[name="gender"]:checked').value,
        current_age: parseInt(document.getElementById('age').value),
        cpp_estimate_at_65: parseFloat(document.getElementById('cpp').value) || 1000,
        rrsp_savings: parseFloat(document.getElementById('savings').value) || 0,
        health_status: document.getElementById('health').value,
        real_rate_of_return: parseFloat(document.getElementById('ror').value) || 0.035,
        wage_growth: parseFloat(document.getElementById('wage').value) || 0.011,
        
        // Calculated outputs (from last calculation)
        bridge_cost: lastCalculationResult?.bridge_cost_lump_sum || 0,
        is_affordable: lastCalculationResult?.is_affordable || false,
        win_probability: lastCalculationResult?.probability_of_winning || 0,
        breakeven_age: lastCalculationResult?.breakeven_age_economic || 0,
        life_expectancy: lastCalculationResult?.life_expectancy || 0,
        epv_early: lastCalculationResult?.epv_early || 0,
        epv_delayed: lastCalculationResult?.epv_delayed || 0,
        recommendation: lastCalculationResult?.recommendation || ''
    };
    
    // Save to sessionStorage
    sessionStorage.setItem('retire_config', JSON.stringify(calculatorData));
    
    // Preserve partner ID if exists
    const partnerId = sessionStorage.getItem('partner_id');
    
    // Redirect to quiz (preserve partner param if exists)
    const quizUrl = partnerId ? `quiz.html?partner=${partnerId}` : 'quiz.html';
    window.location.href = quizUrl;
}

// Modify renderResults to show the Get Score button
// Find the renderResults function and add at the END:
// showGetScoreButton();
```

#### Step 1.5: Update renderResults Function

Find the `renderResults` function in calculator.js and modify it:

```javascript
function renderResults(data) {
    // EXISTING CODE...
    $('empty-state').classList.add('hidden');
    $('results').classList.remove('hidden');
    // ... rest of existing code ...
    
    // ADD THESE LINES AT THE END:
    lastCalculationResult = data;  // Store for handoff
    showGetScoreButton();          // Show the quiz button
}
```

### Verification Checklist for Phase 1
- [ ] Calculator still calculates correctly
- [ ] "Get Full Score" button appears after calculation
- [ ] Clicking button saves data to sessionStorage
- [ ] Browser redirects to quiz.html
- [ ] sessionStorage contains correct `retire_config` data

---

## PHASE 2: QUIZ PAGE

### Goal
Create a 12-question wizard with email gate.

### Files to Create
- `quiz.html` - Page structure
- `js/quiz.js` - State machine and logic

### Step 2.1: Create quiz.html

```html
<!DOCTYPE html>
<html lang="en" class="antialiased">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retirement Readiness Quiz | CPP Bridge</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] }
                }
            }
        }
    </script>
    <style>
        .fade-enter { opacity: 0; transform: translateX(20px); }
        .fade-enter-active { opacity: 1; transform: translateX(0); transition: all 0.3s ease-out; }
        .fade-exit { opacity: 1; transform: translateX(0); }
        .fade-exit-active { opacity: 0; transform: translateX(-20px); transition: all 0.3s ease-out; }
        
        .progress-bar { transition: width 0.5s ease-out; }
        
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #4F46E5;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(79, 70, 229, 0.4);
        }
    </style>
</head>
<body class="bg-gray-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex items-center justify-center p-4">

    <div id="quiz-container" class="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800">
        
        <!-- Header -->
        <div class="p-6 bg-gradient-to-r from-indigo-600 to-indigo-500">
            <div class="flex items-center justify-between">
                <div>
                    <h1 id="quiz-logo" class="text-xl font-bold text-white">CPP Bridge</h1>
                    <p class="text-indigo-200 text-sm">Retirement Readiness Assessment</p>
                </div>
                <div class="text-right">
                    <p class="text-indigo-200 text-sm">Question</p>
                    <p class="text-white font-bold text-xl"><span id="current-q">1</span> / <span id="total-q">12</span></p>
                </div>
            </div>
            <!-- Progress Bar -->
            <div class="mt-4 h-2 bg-indigo-400/30 rounded-full overflow-hidden">
                <div id="progress-bar" class="progress-bar h-full bg-white rounded-full" style="width: 8.33%"></div>
            </div>
        </div>

        <!-- Context Card (Pre-filled from Calculator) -->
        <div id="context-card" class="mx-6 mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <p class="text-sm text-indigo-900 dark:text-indigo-200">
                <span class="font-semibold">Your Profile:</span>
                <span id="context-text">Loading...</span>
            </p>
        </div>

        <!-- Question Container -->
        <div id="question-container" class="p-6 min-h-[300px]">
            <!-- Dynamically populated -->
        </div>

        <!-- Navigation -->
        <div class="p-6 pt-0 flex justify-between items-center">
            <button id="btn-back" onclick="previousQuestion()" 
                class="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-30"
                disabled>
                ← Back
            </button>
            <button id="btn-next" onclick="nextQuestion()"
                class="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                Next →
            </button>
        </div>

        <!-- Email Gate (Hidden initially) -->
        <div id="email-gate" class="hidden p-6">
            <div class="text-center mb-6">
                <div class="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Your Scorecard is Ready!</h2>
                <p class="text-slate-600 dark:text-slate-400 mt-2">Enter your details to view your personalized Retirement Readiness Report</p>
            </div>
            
            <div class="space-y-4 max-w-sm mx-auto">
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                    <input type="text" id="lead-name" placeholder="John Smith"
                        class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input type="email" id="lead-email" placeholder="john@example.com"
                        class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow">
                </div>
                <p id="email-error" class="hidden text-red-500 text-sm"></p>
                <button onclick="submitLead()"
                    class="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:from-emerald-700 hover:to-emerald-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    View My Report →
                </button>
                <p class="text-xs text-center text-slate-400">We respect your privacy. No spam, ever.</p>
            </div>
        </div>

        <!-- Loading State -->
        <div id="loading-state" class="hidden p-12 text-center">
            <div class="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
            <p class="text-slate-600 dark:text-slate-400">Calculating your Retirement Readiness Score...</p>
        </div>

    </div>

    <script src="js/quiz.js"></script>
    <script src="js/whitelabel.js"></script>
    <script src="js/api.js"></script>
</body>
</html>
```

### Step 2.2: Create js/quiz.js

```javascript
// ============================================
// QUIZ STATE MACHINE
// ============================================

const QUIZ_DATA = [
    // ========== INCOME SECURITY (25 pts) ==========
    {
        id: "q1",
        category: "income",
        question: "Beyond CPP and OAS, do you have a company pension plan (Defined Benefit)?",
        type: "boolean",
        weight: 10,
        yes_score: 10,
        no_score: 0
    },
    {
        id: "q2",
        category: "income",
        question: "What percentage of your monthly retirement expenses will be covered by GUARANTEED income?",
        type: "slider",
        min: 0,
        max: 100,
        step: 5,
        unit: "%",
        weight: 10,
        scoring: "proportional"
    },
    {
        id: "q3",
        category: "income",
        question: "Do you have other sources of passive income (rental properties, dividends, royalties)?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },

    // ========== ASSET LONGEVITY (20 pts) ==========
    {
        id: "q4",
        category: "assets",
        question: "Which best describes your withdrawal strategy?",
        type: "multiple_choice",
        options: [
            { text: "I have a specific written plan reviewed by a professional", score: 10 },
            { text: "I follow the 4% rule or similar guideline", score: 5 },
            { text: "I withdraw as needed / no specific plan", score: 0 }
        ],
        weight: 10
    },
    {
        id: "q5",
        category: "assets",
        question: "How many years of retirement expenses do you have in liquid savings?",
        type: "multiple_choice",
        options: [
            { text: "5+ years", score: 5 },
            { text: "2-5 years", score: 3 },
            { text: "Less than 2 years", score: 0 }
        ],
        weight: 5
    },
    {
        id: "q6",
        category: "assets",
        question: "Is your investment portfolio diversified across asset classes?",
        type: "boolean",
        weight: 5,
        yes_score: 5,
        no_score: 0
    },

    // ========== TAX EFFICIENCY (15 pts) ==========
    {
        id: "q7",
        category: "tax",
        question: "Have you planned the optimal order for drawing from RRSP, TFSA, and non-registered accounts?",
        type: "multiple_choice",
        options: [
            { text: "Yes, I have a tax-optimized drawdown plan", score: 7 },
            { text: "I have a general idea but no formal plan", score: 3 },
            { text: "No, I haven't considered this", score: 0 }
        ],
        weight: 7
    },
    {
        id: "q8",
        category: "tax",
        question: "Are you aware of the tax implications of RRIF minimum withdrawals starting at age 72?",
        type: "boolean",
        weight: 4,
        yes_score: 4,
        no_score: 0
    },
    {
        id: "q9",
        category: "tax",
        question: "Have you considered income splitting strategies with a spouse/partner?",
        type: "multiple_choice",
        options: [
            { text: "Yes, actively using pension splitting or spousal RRSP", score: 4 },
            { text: "Aware but not implemented", score: 2 },
            { text: "Not applicable or not considered", score: 0 }
        ],
        weight: 4
    },

    // ========== PSYCHOLOGICAL READINESS (10 pts) ==========
    {
        id: "q10",
        category: "psychology",
        question: "How confident do you feel about managing your finances in retirement?",
        type: "slider",
        min: 1,
        max: 10,
        step: 1,
        unit: "/10",
        weight: 4,
        scoring: "proportional"
    },
    {
        id: "q11",
        category: "psychology",
        question: "Do you have a plan for meaningful activities in retirement?",
        type: "boolean",
        weight: 3,
        yes_score: 3,
        no_score: 0
    },
    {
        id: "q12",
        category: "psychology",
        question: "Have you discussed your retirement plans with your spouse/partner or family?",
        type: "multiple_choice",
        options: [
            { text: "Yes, we have aligned expectations", score: 3 },
            { text: "Somewhat, but not in detail", score: 1 },
            { text: "No / Not applicable", score: 0 }
        ],
        weight: 3
    }
];

// ============================================
// STATE
// ============================================
let currentQuestion = 0;
let answers = {};
let calculatorData = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Check for calculator data
    const configStr = sessionStorage.getItem('retire_config');
    if (!configStr) {
        // No calculator data, redirect back
        alert('Please complete the calculator first.');
        window.location.href = 'index.html';
        return;
    }
    
    calculatorData = JSON.parse(configStr);
    
    // Load any saved answers
    const savedAnswers = sessionStorage.getItem('quiz_answers');
    if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
    }
    
    // Update context card
    updateContextCard();
    
    // Render first question
    renderQuestion();
    
    // Update progress
    updateProgress();
});

function updateContextCard() {
    const ctx = document.getElementById('context-text');
    const age = calculatorData.current_age;
    const savings = calculatorData.rrsp_savings.toLocaleString();
    const affordable = calculatorData.is_affordable ? 'can' : 'cannot';
    const prob = (calculatorData.win_probability * 100).toFixed(0);
    
    ctx.textContent = `You are ${age} years old with $${savings} in savings. You ${affordable} afford the CPP bridge strategy. Your probability of benefiting from delay is ${prob}%.`;
}

// ============================================
// QUESTION RENDERING
// ============================================
function renderQuestion() {
    const q = QUIZ_DATA[currentQuestion];
    const container = document.getElementById('question-container');
    
    let html = `
        <div class="fade-enter-active">
            <p class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                ${getCategoryLabel(q.category)}
            </p>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">
                ${q.question}
            </h2>
            <div class="space-y-3">
    `;
    
    switch (q.type) {
        case 'boolean':
            html += renderBooleanQuestion(q);
            break;
        case 'slider':
            html += renderSliderQuestion(q);
            break;
        case 'multiple_choice':
            html += renderMultipleChoiceQuestion(q);
            break;
    }
    
    html += '</div></div>';
    container.innerHTML = html;
    
    // Restore saved answer if exists
    if (answers[q.id] !== undefined) {
        restoreAnswer(q);
    }
    
    updateNavigationButtons();
}

function renderBooleanQuestion(q) {
    return `
        <button onclick="selectBoolean(true)" id="btn-yes"
            class="w-full p-4 text-left bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
            <span class="font-medium">Yes</span>
        </button>
        <button onclick="selectBoolean(false)" id="btn-no"
            class="w-full p-4 text-left bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
            <span class="font-medium">No</span>
        </button>
    `;
}

function renderSliderQuestion(q) {
    const mid = Math.round((q.max - q.min) / 2) + q.min;
    return `
        <div class="px-4">
            <div class="flex justify-between text-sm text-slate-500 mb-2">
                <span>${q.min}${q.unit || ''}</span>
                <span id="slider-value" class="font-bold text-indigo-600">${mid}${q.unit || ''}</span>
                <span>${q.max}${q.unit || ''}</span>
            </div>
            <input type="range" id="slider-input" 
                min="${q.min}" max="${q.max}" step="${q.step}" value="${mid}"
                oninput="updateSlider(this.value)"
                class="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer">
        </div>
    `;
}

function renderMultipleChoiceQuestion(q) {
    return q.options.map((opt, idx) => `
        <button onclick="selectOption(${idx})" id="opt-${idx}"
            class="w-full p-4 text-left bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
            <span class="font-medium">${opt.text}</span>
        </button>
    `).join('');
}

function restoreAnswer(q) {
    const value = answers[q.id];
    
    switch (q.type) {
        case 'boolean':
            highlightSelection(value ? 'btn-yes' : 'btn-no');
            break;
        case 'slider':
            document.getElementById('slider-input').value = value;
            updateSlider(value);
            break;
        case 'multiple_choice':
            highlightSelection(`opt-${value}`);
            break;
    }
}

// ============================================
// ANSWER HANDLERS
// ============================================
function selectBoolean(value) {
    const q = QUIZ_DATA[currentQuestion];
    answers[q.id] = value;
    saveAnswers();
    
    // Visual feedback
    clearSelections();
    highlightSelection(value ? 'btn-yes' : 'btn-no');
    
    // Auto-advance after short delay
    setTimeout(() => nextQuestion(), 300);
}

function selectOption(index) {
    const q = QUIZ_DATA[currentQuestion];
    answers[q.id] = index;
    saveAnswers();
    
    // Visual feedback
    clearSelections();
    highlightSelection(`opt-${index}`);
    
    // Auto-advance
    setTimeout(() => nextQuestion(), 300);
}

function updateSlider(value) {
    const q = QUIZ_DATA[currentQuestion];
    answers[q.id] = parseInt(value);
    saveAnswers();
    
    document.getElementById('slider-value').textContent = value + (q.unit || '');
}

function clearSelections() {
    document.querySelectorAll('[id^="btn-"], [id^="opt-"]').forEach(el => {
        el.classList.remove('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
        el.classList.add('border-gray-200', 'dark:border-slate-700');
    });
}

function highlightSelection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('border-gray-200', 'dark:border-slate-700');
        el.classList.add('border-indigo-600', 'bg-indigo-50', 'dark:bg-indigo-900/30');
    }
}

function saveAnswers() {
    sessionStorage.setItem('quiz_answers', JSON.stringify(answers));
}

// ============================================
// NAVIGATION
// ============================================
function nextQuestion() {
    const q = QUIZ_DATA[currentQuestion];
    
    // Validate answer exists (except slider which always has a value)
    if (q.type !== 'slider' && answers[q.id] === undefined) {
        return; // Don't advance without answer
    }
    
    if (currentQuestion < QUIZ_DATA.length - 1) {
        currentQuestion++;
        renderQuestion();
        updateProgress();
    } else {
        // Quiz complete - show email gate
        showEmailGate();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
        updateProgress();
    }
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / QUIZ_DATA.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('current-q').textContent = currentQuestion + 1;
    document.getElementById('total-q').textContent = QUIZ_DATA.length;
}

function updateNavigationButtons() {
    document.getElementById('btn-back').disabled = currentQuestion === 0;
    
    const q = QUIZ_DATA[currentQuestion];
    const nextBtn = document.getElementById('btn-next');
    
    if (currentQuestion === QUIZ_DATA.length - 1) {
        nextBtn.textContent = 'Finish →';
    } else {
        nextBtn.textContent = 'Next →';
    }
    
    // For sliders, always enabled. For others, only if answered
    if (q.type === 'slider') {
        nextBtn.disabled = false;
    } else {
        nextBtn.disabled = answers[q.id] === undefined;
    }
}

// ============================================
// EMAIL GATE
// ============================================
function showEmailGate() {
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('btn-back').classList.add('hidden');
    document.getElementById('btn-next').classList.add('hidden');
    document.getElementById('context-card').classList.add('hidden');
    document.getElementById('email-gate').classList.remove('hidden');
    
    // Update progress to 100%
    document.getElementById('progress-bar').style.width = '100%';
    document.getElementById('current-q').textContent = '✓';
}

async function submitLead() {
    const name = document.getElementById('lead-name').value.trim();
    const email = document.getElementById('lead-email').value.trim();
    const errorEl = document.getElementById('email-error');
    
    // Validation
    if (!name) {
        errorEl.textContent = 'Please enter your name';
        errorEl.classList.remove('hidden');
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        errorEl.textContent = 'Please enter a valid email address';
        errorEl.classList.remove('hidden');
        return;
    }
    
    errorEl.classList.add('hidden');
    
    // Show loading
    document.getElementById('email-gate').classList.add('hidden');
    document.getElementById('loading-state').classList.remove('hidden');
    
    // Prepare payload
    const payload = {
        name: name,
        email: email,
        partner_id: sessionStorage.getItem('partner_id') || null,
        calculator_data: calculatorData,
        quiz_answers: answers
    };
    
    try {
        // Submit to API
        const result = await submitLeadToAPI(payload);
        
        // Save result for report page
        sessionStorage.setItem('lead_result', JSON.stringify(result));
        
        // Redirect to report
        const partnerId = sessionStorage.getItem('partner_id');
        const reportUrl = partnerId ? `report.html?partner=${partnerId}` : 'report.html';
        window.location.href = reportUrl;
        
    } catch (error) {
        console.error('Submission error:', error);
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('email-gate').classList.remove('hidden');
        errorEl.textContent = 'Something went wrong. Please try again.';
        errorEl.classList.remove('hidden');
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// HELPERS
// ============================================
function getCategoryLabel(category) {
    const labels = {
        income: '💰 Income Security',
        assets: '📊 Asset Longevity',
        tax: '📋 Tax Efficiency',
        psychology: '🧠 Psychological Readiness'
    };
    return labels[category] || category;
}
```

### Step 2.3: Create js/api.js

```javascript
// ============================================
// API COMMUNICATION LAYER
// ============================================

const API_BASE_URL = 'https://your-backend-url.onrender.com'; // UPDATE THIS

async function submitLeadToAPI(payload) {
    const response = await fetch(`${API_BASE_URL}/v1/leads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'API Error');
    }
    
    return await response.json();
}

// For local development/testing without backend
async function submitLeadMock(payload) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calculate score locally (simplified)
    const score = calculateLocalScore(payload);
    
    return {
        success: true,
        uuid: crypto.randomUUID(),
        score: score,
        insights: generateLocalInsights(score, payload),
        partner: getPartnerConfig(payload.partner_id)
    };
}

function calculateLocalScore(payload) {
    let calcPoints = 0;
    let quizPoints = 0;
    
    // Calculator points (30 max)
    if (payload.calculator_data.is_affordable) calcPoints += 15;
    if (payload.calculator_data.win_probability >= 0.5) calcPoints += 15;
    
    // Quiz points - simplified calculation
    const answers = payload.quiz_answers;
    const QUIZ_DATA = window.QUIZ_DATA || [];
    
    let categoryScores = { income: 0, assets: 0, tax: 0, psychology: 0 };
    let categoryMax = { income: 25, assets: 20, tax: 15, psychology: 10 };
    
    QUIZ_DATA.forEach(q => {
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
    
    return {
        total: total,
        category: total < 50 ? 'red' : (total < 75 ? 'amber' : 'green'),
        label: total < 50 ? 'Critical Gaps Detected' : (total < 75 ? 'Optimizable' : 'Retirement Ready'),
        breakdown: {
            calculator: { points: calcPoints },
            quiz: {
                points: quizPoints,
                income: { points: categoryScores.income, max: categoryMax.income },
                assets: { points: categoryScores.assets, max: categoryMax.assets },
                tax: { points: categoryScores.tax, max: categoryMax.tax },
                psychology: { points: categoryScores.psychology, max: categoryMax.psychology }
            }
        }
    };
}

function generateLocalInsights(score, payload) {
    const weakest = findWeakestCategory(score.breakdown.quiz);
    
    const verdicts = {
        income: "Your Income Security score suggests exploring additional guaranteed income sources like annuities.",
        assets: "Your Asset Longevity score indicates room for improvement in your withdrawal strategy.",
        tax: "Your Tax Efficiency score suggests potential tax optimization opportunities with proper drawdown sequencing.",
        psychology: "Your Psychological Readiness score suggests spending more time planning for retirement lifestyle."
    };
    
    return {
        verdict: verdicts[weakest],
        weakest_category: weakest,
        recommendations: [
            "Review your CPP timing strategy with a financial advisor",
            "Consider tax implications of your withdrawal sequence",
            "Ensure diversification across asset classes"
        ]
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

function getPartnerConfig(partnerId) {
    // This would normally come from partners.json
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

// Use mock API for development, real API for production
// Change this flag when deploying
const USE_MOCK_API = true;

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
        throw new Error('API Error');
    }
    
    return response.json();
}
```

### Verification Checklist for Phase 2
- [ ] quiz.html loads without errors
- [ ] Redirects to calculator if no sessionStorage data
- [ ] Context card shows calculator data
- [ ] All 12 questions render correctly
- [ ] Progress bar updates with each question
- [ ] Answers are saved to sessionStorage
- [ ] Back/Next navigation works
- [ ] Email gate appears after Q12
- [ ] Form validation works
- [ ] Submit shows loading state
- [ ] Redirects to report.html on success

---

## PHASE 3: REPORT PAGE

### Goal
Create a dashboard that displays the score and recommendations.

### Files to Create
- `report.html` - Page structure
- `js/report.js` - Dashboard renderer

### Step 3.1: Create report.html

```html
<!DOCTYPE html>
<html lang="en" class="antialiased">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Retirement Scorecard | CPP Bridge</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] }
                }
            }
        }
    </script>
    <style>
        .score-ring {
            transform: rotate(-90deg);
        }
        .score-ring circle {
            transition: stroke-dashoffset 1s ease-out;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
    </style>
</head>
<body class="bg-gray-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen p-4 md:p-8">

    <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-8">
            <h1 id="report-logo" class="text-2xl font-bold text-slate-900 dark:text-white">CPP Bridge</h1>
            <p class="text-slate-500">Retirement Readiness Report</p>
        </div>

        <!-- Score Card -->
        <div id="score-card" class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 mb-6 opacity-0 animate-fade-in-up">
            <div class="flex flex-col md:flex-row items-center justify-between">
                <!-- Score Ring -->
                <div class="relative w-48 h-48 mb-6 md:mb-0">
                    <svg class="score-ring w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" stroke-width="8"/>
                        <circle id="score-circle" cx="50" cy="50" r="45" fill="none" 
                            stroke="#10B981" stroke-width="8" stroke-linecap="round"
                            stroke-dasharray="283" stroke-dashoffset="283"/>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span id="score-number" class="text-5xl font-bold text-slate-900 dark:text-white">0</span>
                        <span class="text-slate-500 text-sm">/100</span>
                    </div>
                </div>
                
                <!-- Score Label -->
                <div class="text-center md:text-left md:ml-8 flex-1">
                    <div id="score-badge" class="inline-block px-4 py-1 rounded-full text-sm font-bold mb-3">
                        Loading...
                    </div>
                    <h2 id="score-label" class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Calculating...
                    </h2>
                    <p id="score-summary" class="text-slate-600 dark:text-slate-400">
                        Please wait while we analyze your results.
                    </p>
                </div>
            </div>
        </div>

        <!-- Breakdown Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            <!-- Category Cards -->
            <div id="income-card" class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 opacity-0 animate-fade-in-up delay-100">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-2xl">💰</span>
                    <span id="income-rating" class="px-2 py-0.5 rounded text-xs font-bold">--</span>
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Income Security</h3>
                <div class="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div id="income-bar" class="h-full bg-emerald-500 rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
                <p class="text-xs text-slate-500 mt-2"><span id="income-points">0</span> / 25 points</p>
            </div>

            <div id="assets-card" class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 opacity-0 animate-fade-in-up delay-200">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-2xl">📊</span>
                    <span id="assets-rating" class="px-2 py-0.5 rounded text-xs font-bold">--</span>
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Asset Longevity</h3>
                <div class="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div id="assets-bar" class="h-full bg-blue-500 rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
                <p class="text-xs text-slate-500 mt-2"><span id="assets-points">0</span> / 20 points</p>
            </div>

            <div id="tax-card" class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 opacity-0 animate-fade-in-up delay-300">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-2xl">📋</span>
                    <span id="tax-rating" class="px-2 py-0.5 rounded text-xs font-bold">--</span>
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Tax Efficiency</h3>
                <div class="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div id="tax-bar" class="h-full bg-amber-500 rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
                <p class="text-xs text-slate-500 mt-2"><span id="tax-points">0</span> / 15 points</p>
            </div>

            <div id="psychology-card" class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 opacity-0 animate-fade-in-up delay-400">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-2xl">🧠</span>
                    <span id="psychology-rating" class="px-2 py-0.5 rounded text-xs font-bold">--</span>
                </div>
                <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Psychological Readiness</h3>
                <div class="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div id="psychology-bar" class="h-full bg-purple-500 rounded-full transition-all duration-1000" style="width: 0%"></div>
                </div>
                <p class="text-xs text-slate-500 mt-2"><span id="psychology-points">0</span> / 10 points</p>
            </div>
        </div>

        <!-- Insights Panel -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 mb-6">
            <h3 class="font-bold text-slate-900 dark:text-white mb-4">📝 Your Personalized Insights</h3>
            <div id="verdict-text" class="text-slate-600 dark:text-slate-400 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                Loading insights...
            </div>
            <h4 class="font-semibold text-slate-900 dark:text-white mb-3">Recommended Next Steps:</h4>
            <ul id="recommendations-list" class="space-y-2">
                <!-- Populated by JS -->
            </ul>
        </div>

        <!-- Calculator Recap -->
        <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 mb-6 border border-indigo-100 dark:border-indigo-800/30">
            <h3 class="font-bold text-indigo-900 dark:text-indigo-200 mb-3">🧮 Your CPP Bridge Analysis</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <p class="text-indigo-600 dark:text-indigo-400 text-xs uppercase">Bridge Cost</p>
                    <p id="recap-cost" class="font-bold text-indigo-900 dark:text-indigo-100">$0</p>
                </div>
                <div>
                    <p class="text-indigo-600 dark:text-indigo-400 text-xs uppercase">Win Probability</p>
                    <p id="recap-prob" class="font-bold text-indigo-900 dark:text-indigo-100">0%</p>
                </div>
                <div>
                    <p class="text-indigo-600 dark:text-indigo-400 text-xs uppercase">Breakeven Age</p>
                    <p id="recap-breakeven" class="font-bold text-indigo-900 dark:text-indigo-100">--</p>
                </div>
                <div>
                    <p class="text-indigo-600 dark:text-indigo-400 text-xs uppercase">Recommendation</p>
                    <p id="recap-rec" class="font-bold text-indigo-900 dark:text-indigo-100">--</p>
                </div>
            </div>
        </div>

        <!-- CTA -->
        <div id="cta-section" class="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-8 text-center text-white">
            <h3 class="text-2xl font-bold mb-2">Ready to Optimize Your Retirement?</h3>
            <p class="text-emerald-100 mb-6">Get personalized guidance from our expert advisors</p>
            <a id="cta-button" href="#" 
                class="inline-block px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:bg-emerald-50 transition-all transform hover:scale-[1.02]">
                Book a Strategy Call →
            </a>
        </div>

        <!-- Footer -->
        <div class="text-center mt-8 text-sm text-slate-400">
            <p>© 2024 CPP Bridge Calculator. For educational purposes only.</p>
            <p class="mt-1">
                <a href="index.html" class="text-indigo-500 hover:underline">Recalculate</a> · 
                <a href="#" class="text-indigo-500 hover:underline">Privacy Policy</a>
            </p>
        </div>
    </div>

    <script src="js/report.js"></script>
    <script src="js/whitelabel.js"></script>
</body>
</html>
```

### Step 3.2: Create js/report.js

```javascript
// ============================================
// REPORT DASHBOARD RENDERER
// ============================================

let reportData = null;
let calculatorData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Load result data
    const resultStr = sessionStorage.getItem('lead_result');
    const configStr = sessionStorage.getItem('retire_config');
    
    if (!resultStr) {
        alert('No results found. Please complete the quiz first.');
        window.location.href = 'quiz.html';
        return;
    }
    
    reportData = JSON.parse(resultStr);
    calculatorData = configStr ? JSON.parse(configStr) : null;
    
    // Render the dashboard
    renderScoreCard();
    renderCategoryCards();
    renderInsights();
    renderCalculatorRecap();
    renderCTA();
});

function renderScoreCard() {
    const score = reportData.score;
    
    // Animate score number
    animateNumber('score-number', 0, score.total, 1500);
    
    // Animate ring
    setTimeout(() => {
        const circle = document.getElementById('score-circle');
        const circumference = 283; // 2 * PI * 45
        const offset = circumference - (score.total / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        
        // Set color based on category
        const colors = {
            red: '#EF4444',
            amber: '#F59E0B',
            green: '#10B981'
        };
        circle.style.stroke = colors[score.category];
    }, 100);
    
    // Set badge
    const badge = document.getElementById('score-badge');
    const badgeClasses = {
        red: 'bg-red-100 text-red-800',
        amber: 'bg-amber-100 text-amber-800',
        green: 'bg-green-100 text-green-800'
    };
    badge.className = `inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 ${badgeClasses[score.category]}`;
    badge.textContent = score.category.toUpperCase();
    
    // Set label
    document.getElementById('score-label').textContent = score.label;
    
    // Set summary
    const summaries = {
        red: "Your retirement plan has critical gaps that need immediate attention. Let's work on improving your score.",
        amber: "You have a good foundation, but there are optimization opportunities to strengthen your position.",
        green: "Excellent! You're well-prepared for retirement. Focus on maintaining and fine-tuning your strategy."
    };
    document.getElementById('score-summary').textContent = summaries[score.category];
    
    // Show the card
    document.getElementById('score-card').style.opacity = '1';
}

function renderCategoryCards() {
    const breakdown = reportData.score.breakdown.quiz;
    const categories = ['income', 'assets', 'tax', 'psychology'];
    const maxPoints = { income: 25, assets: 20, tax: 15, psychology: 10 };
    
    categories.forEach((cat, index) => {
        const data = breakdown[cat];
        const percentage = (data.points / data.max) * 100;
        
        // Animate bar
        setTimeout(() => {
            document.getElementById(`${cat}-bar`).style.width = `${percentage}%`;
        }, 300 + (index * 200));
        
        // Set points
        document.getElementById(`${cat}-points`).textContent = data.points;
        
        // Set rating badge
        const rating = getRating(data.points, data.max);
        const ratingBadge = document.getElementById(`${cat}-rating`);
        const ratingClasses = {
            low: 'bg-red-100 text-red-800',
            medium: 'bg-amber-100 text-amber-800',
            high: 'bg-green-100 text-green-800'
        };
        ratingBadge.className = `px-2 py-0.5 rounded text-xs font-bold ${ratingClasses[rating]}`;
        ratingBadge.textContent = rating.toUpperCase();
        
        // Show card
        document.getElementById(`${cat}-card`).style.opacity = '1';
    });
}

function getRating(points, max) {
    const ratio = points / max;
    if (ratio >= 0.7) return 'high';
    if (ratio >= 0.4) return 'medium';
    return 'low';
}

function renderInsights() {
    const insights = reportData.insights;
    
    document.getElementById('verdict-text').textContent = insights.verdict;
    
    const recList = document.getElementById('recommendations-list');
    recList.innerHTML = insights.recommendations.map(rec => `
        <li class="flex items-start">
            <span class="text-emerald-500 mr-2">✓</span>
            <span class="text-slate-600 dark:text-slate-400">${rec}</span>
        </li>
    `).join('');
}

function renderCalculatorRecap() {
    if (!calculatorData) return;
    
    document.getElementById('recap-cost').textContent = '$' + calculatorData.bridge_cost.toLocaleString();
    document.getElementById('recap-prob').textContent = (calculatorData.win_probability * 100).toFixed(0) + '%';
    document.getElementById('recap-breakeven').textContent = 'Age ' + calculatorData.breakeven_age;
    document.getElementById('recap-rec').textContent = calculatorData.recommendation;
}

function renderCTA() {
    const partner = reportData.partner;
    
    if (partner && partner.cta_url) {
        document.getElementById('cta-button').textContent = partner.cta_text + ' →';
        document.getElementById('cta-button').href = partner.cta_url;
    }
}

function animateNumber(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        
        const current = Math.round(start + (end - start) * eased);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}
```

### Verification Checklist for Phase 3
- [ ] report.html loads without errors
- [ ] Redirects to quiz if no result data
- [ ] Score ring animates correctly
- [ ] Score badge shows correct color
- [ ] All 4 category cards render with correct data
- [ ] Progress bars animate
- [ ] Insights section shows verdict and recommendations
- [ ] Calculator recap shows original inputs
- [ ] CTA button has correct partner link

---

## PHASE 4: WHITE-LABEL SYSTEM

### Goal
Support multiple partners with custom branding.

### Files to Create
- `js/whitelabel.js` - Partner configuration loader
- `config/partners.json` - Partner definitions

### Step 4.1: Create config/partners.json

```json
{
    "default": {
        "name": "CPP Bridge",
        "logo_type": "text",
        "logo_text": "CPP Bridge",
        "brand_color": "#4F46E5",
        "brand_color_dark": "#6366F1",
        "cta_text": "Book a Strategy Call",
        "cta_url": "#contact"
    },
    "optiml": {
        "name": "Optiml",
        "logo_type": "image",
        "logo_url": "/assets/logos/optiml.png",
        "brand_color": "#3B82F6",
        "brand_color_dark": "#60A5FA",
        "cta_text": "Get Your Free Tax Analysis",
        "cta_url": "https://optiml.ca/book-demo"
    },
    "adviice": {
        "name": "Adviice",
        "logo_type": "image",
        "logo_url": "/assets/logos/adviice.png",
        "brand_color": "#10B981",
        "brand_color_dark": "#34D399",
        "cta_text": "Start Your Financial Plan",
        "cta_url": "https://adviice.ca/signup"
    }
}
```

### Step 4.2: Create js/whitelabel.js

```javascript
// ============================================
// WHITE-LABEL CONFIGURATION SYSTEM
// ============================================

const DEFAULT_CONFIG = {
    name: "CPP Bridge",
    logo_type: "text",
    logo_text: "CPP Bridge",
    brand_color: "#4F46E5",
    brand_color_dark: "#6366F1",
    cta_text: "Book a Strategy Call",
    cta_url: "#contact"
};

let partnersConfig = null;
let currentPartner = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initWhiteLabel);

async function initWhiteLabel() {
    // Check URL for partner param
    const urlParams = new URLSearchParams(window.location.search);
    let partnerId = urlParams.get('partner');
    
    // If not in URL, check sessionStorage
    if (!partnerId) {
        partnerId = sessionStorage.getItem('partner_id');
    }
    
    // If found in URL, save to sessionStorage for persistence
    if (partnerId && urlParams.get('partner')) {
        sessionStorage.setItem('partner_id', partnerId);
    }
    
    // Load partner configs
    try {
        const response = await fetch('/config/partners.json');
        partnersConfig = await response.json();
    } catch (e) {
        console.warn('Could not load partners.json, using defaults');
        partnersConfig = { default: DEFAULT_CONFIG };
    }
    
    // Get config for current partner
    currentPartner = partnersConfig[partnerId] || partnersConfig['default'] || DEFAULT_CONFIG;
    
    // Apply branding
    applyBranding(currentPartner);
}

function applyBranding(config) {
    // Set CSS custom properties for colors
    document.documentElement.style.setProperty('--brand-color', config.brand_color);
    document.documentElement.style.setProperty('--brand-color-dark', config.brand_color_dark);
    
    // Update logo elements
    const logoElements = document.querySelectorAll('#quiz-logo, #report-logo, .brand-logo');
    logoElements.forEach(el => {
        if (config.logo_type === 'image' && config.logo_url) {
            el.innerHTML = `<img src="${config.logo_url}" alt="${config.name}" class="h-8">`;
        } else {
            el.textContent = config.logo_text || config.name;
        }
    });
    
    // Update CTA buttons if on report page
    const ctaButton = document.getElementById('cta-button');
    if (ctaButton) {
        ctaButton.textContent = config.cta_text + ' →';
        ctaButton.href = config.cta_url;
    }
    
    // Add partner class to body for CSS overrides
    const partnerId = sessionStorage.getItem('partner_id');
    if (partnerId) {
        document.body.classList.add(`partner-${partnerId}`);
    }
}

// Utility function to get current partner config
function getPartnerConfig() {
    return currentPartner || DEFAULT_CONFIG;
}

// Utility function to get partner ID
function getPartnerId() {
    return sessionStorage.getItem('partner_id') || 'default';
}
```

### Step 4.3: Add CSS Variables Support

Add this to each HTML file's `<style>` section:

```css
:root {
    --brand-color: #4F46E5;
    --brand-color-dark: #6366F1;
}

.bg-brand { background-color: var(--brand-color); }
.text-brand { color: var(--brand-color); }
.border-brand { border-color: var(--brand-color); }

/* Partner-specific overrides */
.partner-optiml .bg-gradient-to-r { 
    background: linear-gradient(to right, #3B82F6, #2563EB); 
}
.partner-adviice .bg-gradient-to-r { 
    background: linear-gradient(to right, #10B981, #059669); 
}
```

### Verification Checklist for Phase 4
- [ ] Default branding loads when no partner param
- [ ] `?partner=optiml` changes branding
- [ ] Partner ID persists across pages via sessionStorage
- [ ] Logos swap correctly
- [ ] CTA buttons update with partner config
- [ ] Colors change based on partner

---

## PHASE 5: BACKEND API

### Goal
Create FastAPI backend for lead storage and scoring.

### Files to Create
- `main.py` - FastAPI application
- `schemas.py` - Pydantic models
- `database.py` - SQLite setup
- `scoring.py` - Score calculation
- `requirements.txt` - Dependencies

### Step 5.1: Create requirements.txt

```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.2
python-dotenv==1.0.0
sendgrid==6.11.0
python-multipart==0.0.6
```

### Step 5.2: Create schemas.py

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class CalculatorData(BaseModel):
    gender: str
    current_age: int = Field(ge=30, le=69)
    cpp_estimate_at_65: float
    rrsp_savings: float
    health_status: str
    bridge_cost: float
    is_affordable: bool
    win_probability: float = Field(ge=0, le=1)
    breakeven_age: int

class LeadSubmission(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    partner_id: Optional[str] = None
    calculator_data: CalculatorData
    quiz_answers: Dict[str, Any]

class CategoryScore(BaseModel):
    points: int
    max: int
    rating: str  # "low", "medium", "high"

class QuizBreakdown(BaseModel):
    points: int
    income: CategoryScore
    assets: CategoryScore
    tax: CategoryScore
    psychology: CategoryScore

class CalculatorBreakdown(BaseModel):
    points: int
    affordable_points: int
    probability_points: int

class ScoreBreakdown(BaseModel):
    calculator: CalculatorBreakdown
    quiz: QuizBreakdown

class Score(BaseModel):
    total: int
    category: str  # "red", "amber", "green"
    label: str
    breakdown: ScoreBreakdown

class Insights(BaseModel):
    verdict: str
    weakest_category: str
    recommendations: list[str]

class PartnerInfo(BaseModel):
    id: str
    cta_text: str
    cta_url: str

class LeadResponse(BaseModel):
    success: bool
    uuid: str
    score: Score
    insights: Insights
    partner: PartnerInfo
```

### Step 5.3: Create database.py

```python
import sqlite3
import json
from datetime import datetime
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path("leads.db")

def init_db():
    """Initialize the database with required tables."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                uuid TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Contact Info
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                partner_id TEXT,
                
                -- Calculator Inputs
                gender TEXT,
                current_age INTEGER,
                cpp_estimate_at_65 REAL,
                rrsp_savings REAL,
                health_status TEXT,
                bridge_cost REAL,
                is_affordable BOOLEAN,
                win_probability REAL,
                breakeven_age INTEGER,
                
                -- Quiz Answers (JSON blob)
                quiz_answers_json TEXT,
                
                -- Calculated Scores
                total_score INTEGER,
                score_category TEXT,
                income_score INTEGER,
                assets_score INTEGER,
                tax_score INTEGER,
                psychology_score INTEGER,
                
                -- Tracking
                email_sent BOOLEAN DEFAULT FALSE,
                email_sent_at TIMESTAMP
            )
        """)
        
        conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_partner ON leads(partner_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at)")

@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def save_lead(lead_data: dict, score_data: dict) -> str:
    """Save a lead to the database and return the UUID."""
    lead_uuid = str(uuid.uuid4())
    
    with get_db() as conn:
        conn.execute("""
            INSERT INTO leads (
                uuid, name, email, partner_id,
                gender, current_age, cpp_estimate_at_65, rrsp_savings,
                health_status, bridge_cost, is_affordable, win_probability, breakeven_age,
                quiz_answers_json,
                total_score, score_category, income_score, assets_score, tax_score, psychology_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            lead_uuid,
            lead_data['name'],
            lead_data['email'],
            lead_data.get('partner_id'),
            lead_data['calculator_data']['gender'],
            lead_data['calculator_data']['current_age'],
            lead_data['calculator_data']['cpp_estimate_at_65'],
            lead_data['calculator_data']['rrsp_savings'],
            lead_data['calculator_data']['health_status'],
            lead_data['calculator_data']['bridge_cost'],
            lead_data['calculator_data']['is_affordable'],
            lead_data['calculator_data']['win_probability'],
            lead_data['calculator_data']['breakeven_age'],
            json.dumps(lead_data['quiz_answers']),
            score_data['total'],
            score_data['category'],
            score_data['breakdown']['quiz']['income']['points'],
            score_data['breakdown']['quiz']['assets']['points'],
            score_data['breakdown']['quiz']['tax']['points'],
            score_data['breakdown']['quiz']['psychology']['points'],
        ))
    
    return lead_uuid

def mark_email_sent(lead_uuid: str):
    """Mark a lead's email as sent."""
    with get_db() as conn:
        conn.execute(
            "UPDATE leads SET email_sent = TRUE, email_sent_at = ? WHERE uuid = ?",
            (datetime.now(), lead_uuid)
        )

def get_all_leads():
    """Get all leads for CSV export."""
    with get_db() as conn:
        cursor = conn.execute("SELECT * FROM leads ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]

def get_leads_by_partner(partner_id: str):
    """Get leads for a specific partner."""
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT * FROM leads WHERE partner_id = ? ORDER BY created_at DESC",
            (partner_id,)
        )
        return [dict(row) for row in cursor.fetchall()]

# Initialize DB on import
init_db()
```

### Step 5.4: Create scoring.py

```python
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
```

### Step 5.5: Create main.py

```python
import os
import csv
import io
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from schemas import LeadSubmission, LeadResponse
from database import save_lead, mark_email_sent, get_all_leads, get_leads_by_partner
from scoring import calculate_score, generate_insights, get_partner_config
from email_service import send_report_email

load_dotenv()

app = FastAPI(
    title="Retirement Scorecard API",
    description="Backend API for CPP Bridge Lead Generation Funnel",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://yourusername.github.io",  # UPDATE THIS
        "https://your-netlify-site.netlify.app",  # UPDATE THIS
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/v1/leads", response_model=LeadResponse)
async def submit_lead(lead: LeadSubmission):
    """
    Submit a lead with calculator and quiz data.
    Returns the calculated score and personalized insights.
    """
    try:
        # Calculate score
        score = calculate_score(
            lead.calculator_data.model_dump(),
            lead.quiz_answers
        )
        
        # Generate insights
        insights = generate_insights(score, lead.calculator_data.model_dump())
        
        # Get partner config
        partner = get_partner_config(lead.partner_id)
        
        # Save to database
        lead_uuid = save_lead(lead.model_dump(), score)
        
        # Send email (async in background ideally, but sync for MVP)
        try:
            send_report_email(
                name=lead.name,
                email=lead.email,
                score=score,
                insights=insights,
                partner=partner
            )
            mark_email_sent(lead_uuid)
        except Exception as e:
            print(f"Email send failed: {e}")
            # Don't fail the request if email fails
        
        return LeadResponse(
            success=True,
            uuid=lead_uuid,
            score=score,
            insights=insights,
            partner=partner
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/leads")
async def export_leads(
    key: str = Query(..., description="Admin secret key"),
    partner: str = Query(None, description="Filter by partner ID"),
    format: str = Query("json", description="Export format: json or csv")
):
    """
    Export leads for admin purposes.
    Requires secret key for authentication.
    """
    admin_key = os.getenv("ADMIN_SECRET_KEY", "change-me-in-production")
    
    if key != admin_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")
    
    if partner:
        leads = get_leads_by_partner(partner)
    else:
        leads = get_all_leads()
    
    if format == "csv":
        return export_csv(leads)
    
    return {"leads": leads, "count": len(leads)}

def export_csv(leads: list) -> StreamingResponse:
    """Generate CSV file from leads."""
    if not leads:
        return StreamingResponse(
            iter(["No leads found"]),
            media_type="text/csv"
        )
    
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=leads[0].keys())
    writer.writeheader()
    writer.writerows(leads)
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads.csv"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Verification Checklist for Phase 5
- [ ] FastAPI server starts without errors
- [ ] POST /v1/leads accepts valid payload
- [ ] Score calculation matches frontend logic
- [ ] Leads are saved to SQLite database
- [ ] GET /admin/leads returns leads (with correct key)
- [ ] CSV export works
- [ ] CORS allows frontend origins

---

## PHASE 6: EMAIL SERVICE

### Goal
Send HTML email reports via SendGrid.

### Files to Create
- `email_service.py` - SendGrid integration
- `templates/email_report.html` - Email template
- `.env.example` - Environment template

### Step 6.1: Create .env.example

```
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-api-key-here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=CPP Bridge

# Admin Configuration
ADMIN_SECRET_KEY=change-this-to-a-secure-random-string

# Database
DATABASE_URL=sqlite:///leads.db
```

### Step 6.2: Create email_service.py

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from typing import Dict, Any

def send_report_email(
    name: str,
    email: str,
    score: Dict[str, Any],
    insights: Dict[str, Any],
    partner: Dict[str, str]
) -> bool:
    """Send the retirement scorecard report email."""
    
    api_key = os.getenv("SENDGRID_API_KEY")
    if not api_key:
        print("SendGrid API key not configured")
        return False
    
    from_email = os.getenv("FROM_EMAIL", "noreply@cppbridge.com")
    from_name = os.getenv("FROM_NAME", "CPP Bridge")
    
    # Generate email HTML
    html_content = generate_email_html(name, score, insights, partner)
    
    message = Mail(
        from_email=Email(from_email, from_name),
        to_emails=To(email),
        subject=f"Your Retirement Readiness Score: {score['total']}/100",
        html_content=Content("text/html", html_content)
    )
    
    try:
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        print(f"Email sent: {response.status_code}")
        return response.status_code == 202
    except Exception as e:
        print(f"SendGrid error: {e}")
        return False

def generate_email_html(
    name: str,
    score: Dict[str, Any],
    insights: Dict[str, Any],
    partner: Dict[str, str]
) -> str:
    """Generate the HTML email content."""
    
    # Score color
    colors = {
        "red": "#EF4444",
        "amber": "#F59E0B",
        "green": "#10B981"
    }
    score_color = colors.get(score["category"], "#4F46E5")
    
    # Generate recommendations HTML
    recommendations_html = "".join([
        f'<li style="margin-bottom: 8px;">✓ {rec}</li>'
        for rec in insights["recommendations"]
    ])
    
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4F46E5, #6366F1); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Your Retirement Scorecard</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Personalized Analysis for {name}</p>
        </div>
        
        <!-- Score -->
        <div style="padding: 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; border: 8px solid {score_color}; line-height: 104px;">
                <span style="font-size: 48px; font-weight: bold; color: #1f2937;">{score['total']}</span>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin: 8px 0 0;">/100</p>
            <div style="margin-top: 16px;">
                <span style="display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; background-color: {score_color}20; color: {score_color};">
                    {score['label']}
                </span>
            </div>
        </div>
        
        <!-- Breakdown -->
        <div style="padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="font-size: 18px; color: #1f2937; margin: 0 0 16px;">Score Breakdown</h2>
            
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: #6b7280;">💰 Income Security</span>
                    <span style="font-weight: 600;">{score['breakdown']['quiz']['income']['points']}/{score['breakdown']['quiz']['income']['max']}</span>
                </div>
                <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: {int(score['breakdown']['quiz']['income']['points']/score['breakdown']['quiz']['income']['max']*100)}%; background-color: #10B981; border-radius: 4px;"></div>
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: #6b7280;">📊 Asset Longevity</span>
                    <span style="font-weight: 600;">{score['breakdown']['quiz']['assets']['points']}/{score['breakdown']['quiz']['assets']['max']}</span>
                </div>
                <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: {int(score['breakdown']['quiz']['assets']['points']/score['breakdown']['quiz']['assets']['max']*100)}%; background-color: #3B82F6; border-radius: 4px;"></div>
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: #6b7280;">📋 Tax Efficiency</span>
                    <span style="font-weight: 600;">{score['breakdown']['quiz']['tax']['points']}/{score['breakdown']['quiz']['tax']['max']}</span>
                </div>
                <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: {int(score['breakdown']['quiz']['tax']['points']/score['breakdown']['quiz']['tax']['max']*100)}%; background-color: #F59E0B; border-radius: 4px;"></div>
                </div>
            </div>
            
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="color: #6b7280;">🧠 Psychological Readiness</span>
                    <span style="font-weight: 600;">{score['breakdown']['quiz']['psychology']['points']}/{score['breakdown']['quiz']['psychology']['max']}</span>
                </div>
                <div style="height: 8px; background-color: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: {int(score['breakdown']['quiz']['psychology']['points']/score['breakdown']['quiz']['psychology']['max']*100)}%; background-color: #8B5CF6; border-radius: 4px;"></div>
                </div>
            </div>
        </div>
        
        <!-- Insights -->
        <div style="padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
            <h2 style="font-size: 18px; color: #1f2937; margin: 0 0 12px;">📝 Your Personalized Insights</h2>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                {insights['verdict']}
            </p>
            <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 12px;">Recommended Next Steps:</h3>
            <ul style="color: #4b5563; line-height: 1.6; margin: 0; padding-left: 0; list-style: none;">
                {recommendations_html}
            </ul>
        </div>
        
        <!-- CTA -->
        <div style="padding: 32px; text-align: center; background-color: #f9fafb;">
            <h3 style="font-size: 18px; color: #1f2937; margin: 0 0 8px;">Ready to Optimize Your Retirement?</h3>
            <p style="color: #6b7280; margin: 0 0 20px;">Get personalized guidance from our expert advisors</p>
            <a href="{partner['cta_url']}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10B981, #059669); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                {partner['cta_text']} →
            </a>
        </div>
        
        <!-- Footer -->
        <div style="padding: 20px 32px; text-align: center; background-color: #1f2937;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2024 CPP Bridge Calculator. For educational purposes only.
            </p>
        </div>
        
    </div>
</body>
</html>
"""
```

### Verification Checklist for Phase 6
- [ ] SendGrid API key is configured in .env
- [ ] Test email sends successfully
- [ ] Email contains correct score and insights
- [ ] CTA button links to correct partner URL
- [ ] Email renders correctly in Gmail/Outlook

---

## PHASE 7: DEPLOYMENT

### Frontend Deployment (GitHub Pages)

1. Create a GitHub repository for the frontend
2. Push all files from `/frontend` folder
3. Go to Settings → Pages → Deploy from branch (main)
4. Update `API_BASE_URL` in `js/api.js` to point to your backend

### Backend Deployment (Render)

1. Create a GitHub repository for the backend
2. Push all files from `/backend` folder
3. Create a new Web Service on Render
4. Connect to GitHub repository
5. Set environment variables:
   - `SENDGRID_API_KEY`
   - `FROM_EMAIL`
   - `FROM_NAME`
   - `ADMIN_SECRET_KEY`
6. Build command: `pip install -r requirements.txt`
7. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Post-Deployment

1. Update frontend CORS origins in `main.py`
2. Update `API_BASE_URL` in frontend
3. Set `USE_MOCK_API = false` in `api.js`
4. Test the full flow end-to-end

---

## TESTING CHECKLIST

### Calculator Page
- [ ] All inputs work (sliders, dropdowns, number fields)
- [ ] "Calculate Strategy" shows results
- [ ] "Get Full Score" button appears after calculation
- [ ] Data saves to sessionStorage correctly
- [ ] Redirect to quiz works

### Quiz Page
- [ ] Redirects to calculator if no sessionStorage
- [ ] Context card shows calculator data
- [ ] All 12 questions render correctly
- [ ] Boolean questions auto-advance
- [ ] Multiple choice questions auto-advance
- [ ] Slider questions require manual Next
- [ ] Progress bar updates correctly
- [ ] Back button works
- [ ] Email gate appears after Q12
- [ ] Form validation works (name, email)
- [ ] Loading state shows during submission
- [ ] API submission succeeds
- [ ] Redirect to report works

### Report Page
- [ ] Redirects to quiz if no result data
- [ ] Score ring animates
- [ ] Score number counts up
- [ ] Badge shows correct color (red/amber/green)
- [ ] All 4 category cards render
- [ ] Progress bars animate
- [ ] Insights section populated
- [ ] Calculator recap shows data
- [ ] CTA button has correct link

### White-Label
- [ ] Default branding works (no partner param)
- [ ] `?partner=optiml` changes branding
- [ ] Partner ID persists across all pages
- [ ] CTA changes per partner

### Backend
- [ ] Health check endpoint works
- [ ] POST /v1/leads accepts valid data
- [ ] Returns correct score calculation
- [ ] Saves lead to database
- [ ] Sends email successfully
- [ ] Admin export works with key
- [ ] CSV download works
- [ ] Invalid admin key rejected

### Mobile Responsiveness
- [ ] Calculator works on mobile
- [ ] Quiz works on mobile
- [ ] Report works on mobile
- [ ] Touch interactions work

---

## APPENDIX: QUICK REFERENCE

### sessionStorage Keys
| Key | Content | Set By | Read By |
|-----|---------|--------|---------|
| `retire_config` | Calculator inputs + outputs | calculator.js | quiz.js, report.js |
| `quiz_answers` | Quiz responses | quiz.js | quiz.js, api.js |
| `partner_id` | White-label partner | whitelabel.js | All pages |
| `lead_result` | API response | quiz.js | report.js |

### API Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Health check |
| POST | `/v1/leads` | Submit lead + get score |
| GET | `/admin/leads?key=X` | Export leads |

### Score Calculation
| Component | Points | Criteria |
|-----------|--------|----------|
| Calculator - Affordable | 15 | savings >= bridge_cost |
| Calculator - Probability | 15 | win_probability >= 50% |
| Quiz - Income | 25 max | Q1 + Q2 + Q3 |
| Quiz - Assets | 20 max | Q4 + Q5 + Q6 |
| Quiz - Tax | 15 max | Q7 + Q8 + Q9 |
| Quiz - Psychology | 10 max | Q10 + Q11 + Q12 |
| **TOTAL** | **100** | |

### Score Categories
| Range | Category | Label |
|-------|----------|-------|
| 0-49 | red | Critical Gaps Detected |
| 50-74 | amber | Optimizable |
| 75-100 | green | Retirement Ready |

---

**END OF DOCUMENT**

*This PRD is designed to be followed sequentially. Complete each phase before moving to the next. Each phase builds on the previous one.*