/**
 * Unit Tests for CPP Bridge Calculator
 * Run with: node tests/test_calculator.js
 */

// ============================================
// EXTRACT CORE FUNCTIONS FROM calculator.js
// (Duplicated here for Node.js testing)
// ============================================

const MORTALITY_TABLE = {"0": {"male": 0.0046, "female": 0.0036}, "1": {"male": 0.0002, "female": 0.0002}, "2": {"male": 0.0002, "female": 0.0002}, "3": {"male": 0.0001, "female": 0.0001}, "4": {"male": 0.0001, "female": 0.0001}, "5": {"male": 0.0001, "female": 0.0001}, "6": {"male": 0.0001, "female": 0.0001}, "7": {"male": 0.0001, "female": 0.0001}, "8": {"male": 0.0001, "female": 0.0001}, "9": {"male": 0.0001, "female": 0.0001}, "10": {"male": 0.0001, "female": 0.0001}, "11": {"male": 0.0001, "female": 0.0001}, "12": {"male": 0.0001, "female": 0.0001}, "13": {"male": 0.0001, "female": 0.0001}, "14": {"male": 0.0002, "female": 0.0002}, "15": {"male": 0.0002, "female": 0.0002}, "16": {"male": 0.0003, "female": 0.0003}, "17": {"male": 0.0004, "female": 0.0003}, "18": {"male": 0.0005, "female": 0.0003}, "19": {"male": 0.0006, "female": 0.0003}, "20": {"male": 0.0006, "female": 0.0004}, "21": {"male": 0.0009, "female": 0.0004}, "22": {"male": 0.0009, "female": 0.0004}, "23": {"male": 0.001, "female": 0.0004}, "24": {"male": 0.001, "female": 0.0004}, "25": {"male": 0.001, "female": 0.0005}, "26": {"male": 0.0011, "female": 0.0005}, "27": {"male": 0.0011, "female": 0.0005}, "28": {"male": 0.0011, "female": 0.0006}, "29": {"male": 0.0012, "female": 0.0006}, "30": {"male": 0.0012, "female": 0.0006}, "31": {"male": 0.0014, "female": 0.0006}, "32": {"male": 0.0014, "female": 0.0006}, "33": {"male": 0.0015, "female": 0.0007}, "34": {"male": 0.0015, "female": 0.0007}, "35": {"male": 0.0015, "female": 0.0007}, "36": {"male": 0.0015, "female": 0.0008}, "37": {"male": 0.0016, "female": 0.0008}, "38": {"male": 0.0017, "female": 0.0008}, "39": {"male": 0.0017, "female": 0.0009}, "40": {"male": 0.0019, "female": 0.001}, "41": {"male": 0.0014, "female": 0.0008}, "42": {"male": 0.0015, "female": 0.0009}, "43": {"male": 0.0016, "female": 0.001}, "44": {"male": 0.0017, "female": 0.001}, "45": {"male": 0.0018, "female": 0.0011}, "46": {"male": 0.0019, "female": 0.0012}, "47": {"male": 0.0021, "female": 0.0013}, "48": {"male": 0.0022, "female": 0.0014}, "49": {"male": 0.0024, "female": 0.0016}, "50": {"male": 0.0026, "female": 0.0017}, "51": {"male": 0.0028, "female": 0.0018}, "52": {"male": 0.003, "female": 0.002}, "53": {"male": 0.0033, "female": 0.0021}, "54": {"male": 0.0036, "female": 0.0023}, "55": {"male": 0.0039, "female": 0.0025}, "56": {"male": 0.0043, "female": 0.0027}, "57": {"male": 0.0047, "female": 0.003}, "58": {"male": 0.0051, "female": 0.0033}, "59": {"male": 0.0056, "female": 0.0036}, "60": {"male": 0.0061, "female": 0.0039}, "61": {"male": 0.0068, "female": 0.0044}, "62": {"male": 0.0074, "female": 0.0048}, "63": {"male": 0.0082, "female": 0.0053}, "64": {"male": 0.009, "female": 0.0058}, "65": {"male": 0.0098, "female": 0.0064}, "66": {"male": 0.0108, "female": 0.0071}, "67": {"male": 0.0119, "female": 0.0078}, "68": {"male": 0.013, "female": 0.0086}, "69": {"male": 0.0144, "female": 0.0095}, "70": {"male": 0.0158, "female": 0.0105}, "71": {"male": 0.0176, "female": 0.0118}, "72": {"male": 0.0194, "female": 0.0131}, "73": {"male": 0.0214, "female": 0.0145}, "74": {"male": 0.0237, "female": 0.0162}, "75": {"male": 0.0262, "female": 0.018}, "76": {"male": 0.0291, "female": 0.0201}, "77": {"male": 0.0323, "female": 0.0224}, "78": {"male": 0.0358, "female": 0.0251}, "79": {"male": 0.0397, "female": 0.028}, "80": {"male": 0.0441, "female": 0.0314}, "81": {"male": 0.0482, "female": 0.0344}, "82": {"male": 0.0536, "female": 0.0386}, "83": {"male": 0.0597, "female": 0.0433}, "84": {"male": 0.0665, "female": 0.0487}, "85": {"male": 0.0741, "female": 0.0548}, "86": {"male": 0.0848, "female": 0.0619}, "87": {"male": 0.0946, "female": 0.0698}, "88": {"male": 0.1057, "female": 0.0788}, "89": {"male": 0.1181, "female": 0.089}, "90": {"male": 0.1322, "female": 0.1007}, "91": {"male": 0.1558, "female": 0.1186}, "92": {"male": 0.1732, "female": 0.1334}, "93": {"male": 0.1916, "female": 0.1493}, "94": {"male": 0.211, "female": 0.1663}, "95": {"male": 0.2338, "female": 0.1866}, "96": {"male": 0.2547, "female": 0.206}, "97": {"male": 0.2761, "female": 0.2265}, "98": {"male": 0.298, "female": 0.2479}, "99": {"male": 0.3202, "female": 0.27}, "100": {"male": 0.3424, "female": 0.2926}, "101": {"male": 0.3745, "female": 0.3266}, "102": {"male": 0.3967, "female": 0.3504}, "103": {"male": 0.4184, "female": 0.374}, "104": {"male": 0.4393, "female": 0.3972}, "105": {"male": 0.4594, "female": 0.4197}, "106": {"male": 0.4784, "female": 0.4415}, "107": {"male": 0.4963, "female": 0.4623}, "108": {"male": 0.5131, "female": 0.4819}, "109": {"male": 0.5287, "female": 0.5004}, "110": {"male": 1.0, "female": 1.0}};

const CPP_DELAY_FACTOR = 1.42;
const BRIDGE_DURATION_MONTHS = 60;

function getBaseQx(age, gender) {
    if (age >= 115) return 1.0;
    if (MORTALITY_TABLE[age]) return MORTALITY_TABLE[age][gender];
    if (age > 110) return 1.0;
    return 1.0;
}

function getEffectiveAge(age, health) {
    if (health === 'excellent') return Math.max(0, age - 3);
    if (health === 'poor') return Math.min(115, age + 5);
    return age;
}

function getSurvivalProbability(currentAge, targetAge, gender, health) {
    if (targetAge <= currentAge) return 1.0;
    let prob = 1.0;
    const effAge = getEffectiveAge(currentAge, health);
    for (let i = 0; i < (targetAge - currentAge); i++) {
        prob *= (1.0 - getBaseQx(effAge + i, gender));
    }
    return prob;
}

function getLifeExpectancy(currentAge, gender, health) {
    let leSum = 0.0;
    for (let age = currentAge + 1; age <= 115; age++) {
        leSum += getSurvivalProbability(currentAge, age, gender, health);
    }
    return (currentAge + leSum + 0.5).toFixed(1);
}

function calculateAnnuityDuePv(pmt, monthlyRate, months) {
    if (monthlyRate === 0) return pmt * months;
    const v = 1 / (1 + monthlyRate);
    return pmt * ((1 - Math.pow(v, months)) / monthlyRate) * (1 + monthlyRate);
}

function calculateBridgeScenario(req) {
    const monthlyRealRate = Math.pow(1 + req.real_rate_of_return, 1/12) - 1;
    const wageIndex = Math.pow(1 + req.wage_growth, 5);
    const targetMonthly = req.cpp_estimate_at_65 * CPP_DELAY_FACTOR * wageIndex;
    const costAt65 = calculateAnnuityDuePv(targetMonthly, monthlyRealRate, BRIDGE_DURATION_MONTHS);
    const yearsTo65 = Math.max(0, 65 - req.current_age);
    const costToday = costAt65 / Math.pow(1 + req.real_rate_of_return, yearsTo65);
    const isAffordable = req.rrsp_savings >= costToday;
    const shortfall = Math.max(0, costToday - req.rrsp_savings);
    const surplus = Math.max(0, req.rrsp_savings - costToday);

    let breakevenAge = 100;
    for (let age = 66; age <= 105; age++) {
        const monthsEarly = (age - 65) * 12;
        const pvEarly = calculateAnnuityDuePv(req.cpp_estimate_at_65, monthlyRealRate, monthsEarly);
        let pvDelayed = 0;
        if (age >= 70) {
            const monthsDelayed = (age - 70) * 12;
            const pvAt70 = calculateAnnuityDuePv(targetMonthly, monthlyRealRate, monthsDelayed);
            pvDelayed = pvAt70 / Math.pow(1 + monthlyRealRate, 60);
        }
        if (pvDelayed > pvEarly) { breakevenAge = age; break; }
    }

    const probWin = getSurvivalProbability(req.current_age, breakevenAge, req.gender, req.health_status);
    let rec = probWin > 0.5 ? "Delay to 70" : "Take Early (65)";

    return {
        bridge_cost_lump_sum: Math.round(costToday),
        target_monthly_income_at_70: parseFloat(targetMonthly.toFixed(2)),
        is_affordable: isAffordable,
        shortfall_amount: parseFloat(shortfall.toFixed(2)),
        surplus_amount: parseFloat(surplus.toFixed(2)),
        breakeven_age_economic: breakevenAge,
        probability_of_winning: parseFloat(probWin.toFixed(4)),
        life_expectancy: getLifeExpectancy(req.current_age, req.gender, req.health_status),
        recommendation: rec
    };
}

// ============================================
// TEST FRAMEWORK (Simple)
// ============================================

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
    if (condition) {
        console.log(`  ✓ ${testName}`);
        testsPassed++;
    } else {
        console.log(`  ✗ ${testName}`);
        if (details) console.log(`    → ${details}`);
        testsFailed++;
    }
}

function assertApprox(actual, expected, tolerance, testName) {
    const diff = Math.abs(actual - expected);
    if (diff <= tolerance) {
        console.log(`  ✓ ${testName} (${actual})`);
        testsPassed++;
    } else {
        console.log(`  ✗ ${testName}`);
        console.log(`    → Expected ~${expected}, got ${actual} (diff: ${diff})`);
        testsFailed++;
    }
}

// ============================================
// TESTS: Mortality & Survival Functions
// ============================================

console.log('\n═══════════════════════════════════════');
console.log('TEST SUITE: Mortality & Survival');
console.log('═══════════════════════════════════════\n');

// Test 1: Basic mortality table lookup
assert(getBaseQx(65, 'male') === 0.0098, 'Male age 65 qx = 0.0098');
assert(getBaseQx(65, 'female') === 0.0064, 'Female age 65 qx = 0.0064');
assert(getBaseQx(110, 'male') === 1.0, 'Age 110 qx = 1.0 (terminal)');
assert(getBaseQx(120, 'male') === 1.0, 'Age 120+ qx = 1.0');

// Test 2: Effective age adjustments
assert(getEffectiveAge(65, 'average') === 65, 'Average health: no adjustment');
assert(getEffectiveAge(65, 'excellent') === 62, 'Excellent health: -3 years');
assert(getEffectiveAge(65, 'poor') === 70, 'Poor health: +5 years');
assert(getEffectiveAge(2, 'excellent') === 0, 'Excellent health floor at 0');
assert(getEffectiveAge(112, 'poor') === 115, 'Poor health cap at 115');

// Test 3: Survival probability
assert(getSurvivalProbability(65, 65, 'male', 'average') === 1.0, 'Survival to same age = 100%');
assert(getSurvivalProbability(65, 64, 'male', 'average') === 1.0, 'Survival to past age = 100%');

const survMale65to70 = getSurvivalProbability(65, 70, 'male', 'average');
assertApprox(survMale65to70, 0.94, 0.02, 'Male 65→70 survival ~94%');

const survFemale65to70 = getSurvivalProbability(65, 70, 'female', 'average');
assertApprox(survFemale65to70, 0.96, 0.02, 'Female 65→70 survival ~96%');

// Test 4: Life expectancy reasonableness
const leMale55 = parseFloat(getLifeExpectancy(55, 'male', 'average'));
const leFemale55 = parseFloat(getLifeExpectancy(55, 'female', 'average'));
assert(leMale55 > 80 && leMale55 < 90, `Male 55 LE in range (${leMale55})`);
assert(leFemale55 > leMale55, `Female LE > Male LE (${leFemale55} > ${leMale55})`);

const leExcellent = parseFloat(getLifeExpectancy(55, 'male', 'excellent'));
const lePoor = parseFloat(getLifeExpectancy(55, 'male', 'poor'));
assert(leExcellent > leMale55, `Excellent health LE > Average (${leExcellent} > ${leMale55})`);
assert(lePoor < leMale55, `Poor health LE < Average (${lePoor} < ${leMale55})`);

// ============================================
// TESTS: Annuity Calculations
// ============================================

console.log('\n═══════════════════════════════════════');
console.log('TEST SUITE: Annuity Calculations');
console.log('═══════════════════════════════════════\n');

// Test 5: Zero rate annuity
const annuityZeroRate = calculateAnnuityDuePv(1000, 0, 60);
assert(annuityZeroRate === 60000, 'Zero rate: PV = PMT × months');

// Test 6: Positive rate annuity
const monthlyRate = Math.pow(1.01, 1/12) - 1; // ~1% annual
const annuityPosRate = calculateAnnuityDuePv(1000, monthlyRate, 60);
assert(annuityPosRate < 60000, 'Positive rate: PV < simple sum');
assert(annuityPosRate > 55000, 'Positive rate: PV reasonable range');

// ============================================
// TESTS: Bridge Scenario Calculations
// ============================================

console.log('\n═══════════════════════════════════════');
console.log('TEST SUITE: Bridge Scenario');
console.log('═══════════════════════════════════════\n');

// Test 7: CIA Paper Benchmark
// At 1.0% real return and 1.1% wage growth, bridge cost should be ~7.35x annual CPP
const ciaBenchmark = calculateBridgeScenario({
    current_age: 65,
    cpp_estimate_at_65: 1000,
    rrsp_savings: 100000,
    health_status: 'average',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'male'
});

const annualCPP = 1000 * 12;
const bridgeRatio = ciaBenchmark.bridge_cost_lump_sum / annualCPP;
assertApprox(bridgeRatio, 7.35, 0.5, `CIA benchmark: bridge ~7.35x annual CPP (got ${bridgeRatio.toFixed(2)}x)`);

// Test 8: Standard scenario
const standardScenario = calculateBridgeScenario({
    current_age: 55,
    cpp_estimate_at_65: 1000,
    rrsp_savings: 150000,
    health_status: 'average',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'male'
});

assert(standardScenario.bridge_cost_lump_sum > 0, 'Bridge cost is positive');
assert(standardScenario.target_monthly_income_at_70 > 1000, 'Delayed CPP > base CPP');
assertApprox(standardScenario.target_monthly_income_at_70, 1000 * 1.42 * Math.pow(1.011, 5), 5, 'Target monthly = CPP × 1.42 × wage growth');
assert(standardScenario.breakeven_age > 70, 'Breakeven age > 70');
assert(standardScenario.breakeven_age < 95, 'Breakeven age < 95');
assert(standardScenario.probability_of_winning > 0, 'Win probability > 0');
assert(standardScenario.probability_of_winning < 1, 'Win probability < 1');

// Test 9: Affordability check
const affordableScenario = calculateBridgeScenario({
    current_age: 65,
    cpp_estimate_at_65: 500,
    rrsp_savings: 100000,
    health_status: 'average',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'male'
});
assert(affordableScenario.is_affordable === true, 'High savings = affordable');
assert(affordableScenario.shortfall_amount === 0, 'No shortfall when affordable');
assert(affordableScenario.surplus_amount > 0, 'Surplus when affordable');

const unaffordableScenario = calculateBridgeScenario({
    current_age: 65,
    cpp_estimate_at_65: 1500,
    rrsp_savings: 50000,
    health_status: 'average',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'male'
});
assert(unaffordableScenario.is_affordable === false, 'Low savings = not affordable');
assert(unaffordableScenario.shortfall_amount > 0, 'Shortfall when unaffordable');
assert(unaffordableScenario.surplus_amount === 0, 'No surplus when unaffordable');

// Test 10: Recommendation logic
const highProbScenario = calculateBridgeScenario({
    current_age: 55,
    cpp_estimate_at_65: 1000,
    rrsp_savings: 150000,
    health_status: 'excellent',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'female'
});
assert(highProbScenario.recommendation === 'Delay to 70', 'High prob (excellent female) → Delay');

const lowProbScenario = calculateBridgeScenario({
    current_age: 60,
    cpp_estimate_at_65: 1000,
    rrsp_savings: 150000,
    health_status: 'poor',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'male'
});
// Poor health male at 60 has lower survival probability
console.log(`  ℹ Poor health male prob: ${lowProbScenario.probability_of_winning}`);

// Test 11: Gender differences
const maleScenario = calculateBridgeScenario({
    current_age: 55,
    cpp_estimate_at_65: 1000,
    rrsp_savings: 100000,
    health_status: 'average',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'male'
});

const femaleScenario = calculateBridgeScenario({
    current_age: 55,
    cpp_estimate_at_65: 1000,
    rrsp_savings: 100000,
    health_status: 'average',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'female'
});

assert(femaleScenario.probability_of_winning > maleScenario.probability_of_winning,
    `Female win prob > Male (${femaleScenario.probability_of_winning} > ${maleScenario.probability_of_winning})`);

// ============================================
// TESTS: Edge Cases
// ============================================

console.log('\n═══════════════════════════════════════');
console.log('TEST SUITE: Edge Cases');
console.log('═══════════════════════════════════════\n');

// Test 12: Age at 65 (no discounting to present)
const age65Scenario = calculateBridgeScenario({
    current_age: 65,
    cpp_estimate_at_65: 1000,
    rrsp_savings: 100000,
    health_status: 'average',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'male'
});
assert(age65Scenario.bridge_cost_lump_sum > 0, 'Age 65: Bridge cost calculated');

// Test 13: Young person (age 30)
const youngScenario = calculateBridgeScenario({
    current_age: 30,
    cpp_estimate_at_65: 1000,
    rrsp_savings: 50000,
    health_status: 'average',
    real_rate_of_return: 0.01,
    wage_growth: 0.011,
    discount_pre_retirement_mortality: true,
    gender: 'male'
});
assert(youngScenario.bridge_cost_lump_sum < age65Scenario.bridge_cost_lump_sum,
    'Younger person: Lower present value cost');
assert(youngScenario.probability_of_winning < maleScenario.probability_of_winning,
    'Younger person: Lower survival probability to breakeven');

// Test 14: Zero rate of return
const zeroRorScenario = calculateBridgeScenario({
    current_age: 65,
    cpp_estimate_at_65: 1000,
    rrsp_savings: 100000,
    health_status: 'average',
    real_rate_of_return: 0,
    wage_growth: 0,
    discount_pre_retirement_mortality: true,
    gender: 'male'
});
assert(zeroRorScenario.bridge_cost_lump_sum > 0, 'Zero RoR: Still calculates');
assertApprox(zeroRorScenario.target_monthly_income_at_70, 1420, 1, 'Zero wage growth: Target = CPP × 1.42');

// ============================================
// SUMMARY
// ============================================

console.log('\n═══════════════════════════════════════');
console.log('TEST SUMMARY');
console.log('═══════════════════════════════════════');
console.log(`  Passed: ${testsPassed}`);
console.log(`  Failed: ${testsFailed}`);
console.log(`  Total:  ${testsPassed + testsFailed}`);
console.log('═══════════════════════════════════════\n');

if (testsFailed > 0) {
    process.exit(1);
}
