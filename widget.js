// CPP Bridge Calculator V2 (Static - No Backend Required)
// All actuarial logic runs client-side in the browser

// --- MORTALITY DATA (Embedded from CSV) ---
const MORTALITY_TABLE = {"0": {"male": 0.0046, "female": 0.0036}, "1": {"male": 0.0002, "female": 0.0002}, "2": {"male": 0.0002, "female": 0.0002}, "3": {"male": 0.0001, "female": 0.0001}, "4": {"male": 0.0001, "female": 0.0001}, "5": {"male": 0.0001, "female": 0.0001}, "6": {"male": 0.0001, "female": 0.0001}, "7": {"male": 0.0001, "female": 0.0001}, "8": {"male": 0.0001, "female": 0.0001}, "9": {"male": 0.0001, "female": 0.0001}, "10": {"male": 0.0001, "female": 0.0001}, "11": {"male": 0.0001, "female": 0.0001}, "12": {"male": 0.0001, "female": 0.0001}, "13": {"male": 0.0001, "female": 0.0001}, "14": {"male": 0.0002, "female": 0.0002}, "15": {"male": 0.0002, "female": 0.0002}, "16": {"male": 0.0003, "female": 0.0003}, "17": {"male": 0.0004, "female": 0.0003}, "18": {"male": 0.0005, "female": 0.0003}, "19": {"male": 0.0006, "female": 0.0003}, "20": {"male": 0.0006, "female": 0.0004}, "21": {"male": 0.0009, "female": 0.0004}, "22": {"male": 0.0009, "female": 0.0004}, "23": {"male": 0.001, "female": 0.0004}, "24": {"male": 0.001, "female": 0.0004}, "25": {"male": 0.001, "female": 0.0005}, "26": {"male": 0.0011, "female": 0.0005}, "27": {"male": 0.0011, "female": 0.0005}, "28": {"male": 0.0011, "female": 0.0006}, "29": {"male": 0.0012, "female": 0.0006}, "30": {"male": 0.0012, "female": 0.0006}, "31": {"male": 0.0014, "female": 0.0006}, "32": {"male": 0.0014, "female": 0.0006}, "33": {"male": 0.0015, "female": 0.0007}, "34": {"male": 0.0015, "female": 0.0007}, "35": {"male": 0.0015, "female": 0.0007}, "36": {"male": 0.0015, "female": 0.0008}, "37": {"male": 0.0016, "female": 0.0008}, "38": {"male": 0.0017, "female": 0.0008}, "39": {"male": 0.0017, "female": 0.0009}, "40": {"male": 0.0019, "female": 0.001}, "41": {"male": 0.0014, "female": 0.0008}, "42": {"male": 0.0015, "female": 0.0009}, "43": {"male": 0.0016, "female": 0.001}, "44": {"male": 0.0017, "female": 0.001}, "45": {"male": 0.0018, "female": 0.0011}, "46": {"male": 0.0019, "female": 0.0012}, "47": {"male": 0.0021, "female": 0.0013}, "48": {"male": 0.0022, "female": 0.0014}, "49": {"male": 0.0024, "female": 0.0016}, "50": {"male": 0.0026, "female": 0.0017}, "51": {"male": 0.0028, "female": 0.0018}, "52": {"male": 0.003, "female": 0.002}, "53": {"male": 0.0033, "female": 0.0021}, "54": {"male": 0.0036, "female": 0.0023}, "55": {"male": 0.0039, "female": 0.0025}, "56": {"male": 0.0043, "female": 0.0027}, "57": {"male": 0.0047, "female": 0.003}, "58": {"male": 0.0051, "female": 0.0033}, "59": {"male": 0.0056, "female": 0.0036}, "60": {"male": 0.0061, "female": 0.0039}, "61": {"male": 0.0068, "female": 0.0044}, "62": {"male": 0.0074, "female": 0.0048}, "63": {"male": 0.0082, "female": 0.0053}, "64": {"male": 0.009, "female": 0.0058}, "65": {"male": 0.0098, "female": 0.0064}, "66": {"male": 0.0108, "female": 0.0071}, "67": {"male": 0.0119, "female": 0.0078}, "68": {"male": 0.013, "female": 0.0086}, "69": {"male": 0.0144, "female": 0.0095}, "70": {"male": 0.0158, "female": 0.0105}, "71": {"male": 0.0176, "female": 0.0118}, "72": {"male": 0.0194, "female": 0.0131}, "73": {"male": 0.0214, "female": 0.0145}, "74": {"male": 0.0237, "female": 0.0162}, "75": {"male": 0.0262, "female": 0.018}, "76": {"male": 0.0291, "female": 0.0201}, "77": {"male": 0.0323, "female": 0.0224}, "78": {"male": 0.0358, "female": 0.0251}, "79": {"male": 0.0397, "female": 0.028}, "80": {"male": 0.0441, "female": 0.0314}, "81": {"male": 0.0482, "female": 0.0344}, "82": {"male": 0.0536, "female": 0.0386}, "83": {"male": 0.0597, "female": 0.0433}, "84": {"male": 0.0665, "female": 0.0487}, "85": {"male": 0.0741, "female": 0.0548}, "86": {"male": 0.0848, "female": 0.0619}, "87": {"male": 0.0946, "female": 0.0698}, "88": {"male": 0.1057, "female": 0.0788}, "89": {"male": 0.1181, "female": 0.089}, "90": {"male": 0.1322, "female": 0.1007}, "91": {"male": 0.1558, "female": 0.1186}, "92": {"male": 0.1732, "female": 0.1334}, "93": {"male": 0.1916, "female": 0.1493}, "94": {"male": 0.211, "female": 0.1663}, "95": {"male": 0.2338, "female": 0.1866}, "96": {"male": 0.2547, "female": 0.206}, "97": {"male": 0.2761, "female": 0.2265}, "98": {"male": 0.298, "female": 0.2479}, "99": {"male": 0.3202, "female": 0.27}, "100": {"male": 0.3424, "female": 0.2926}, "101": {"male": 0.3745, "female": 0.3266}, "102": {"male": 0.3967, "female": 0.3504}, "103": {"male": 0.4184, "female": 0.374}, "104": {"male": 0.4393, "female": 0.3972}, "105": {"male": 0.4594, "female": 0.4197}, "106": {"male": 0.4784, "female": 0.4415}, "107": {"male": 0.4963, "female": 0.4623}, "108": {"male": 0.5131, "female": 0.4819}, "109": {"male": 0.5287, "female": 0.5004}, "110": {"male": 1.0, "female": 1.0}};

const CPP_DELAY_FACTOR = 1.42;
const BRIDGE_DURATION_MONTHS = 60;

// --- ACTUARIAL FUNCTIONS ---
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

function calculateActuarialEpv(monthlyPayment, startAge, currentAge, realRate, gender, health) {
    let epv = 0.0;
    const monthlyRate = Math.pow(1 + realRate, 1/12) - 1;
    for (let age = startAge; age <= 115; age++) {
        const probSurvive = getSurvivalProbability(currentAge, age, gender, health);
        for (let month = 0; month < 12; month++) {
            const monthsFromNow = (age - currentAge) * 12 + month;
            const discountFactor = 1 / Math.pow(1 + monthlyRate, monthsFromNow);
            epv += monthlyPayment * discountFactor * probSurvive;
        }
    }
    return epv;
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
    let bonusEstate = 0.0;
    if (surplus > 0) {
        bonusEstate = surplus * Math.pow(1 + req.real_rate_of_return, Math.max(0, 85 - req.current_age));
    }
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
    const reason = `To benefit from delaying, you must live past Age ${breakevenAge}. Given your ${req.health_status} health, you have a ${(probWin*100).toFixed(1)}% probability of reaching this milestone.`;
    let epvEarly = calculateActuarialEpv(req.cpp_estimate_at_65, 65, req.current_age, req.real_rate_of_return, req.gender, req.health_status);
    let epvDelayed = calculateActuarialEpv(targetMonthly, 70, req.current_age, req.real_rate_of_return, req.gender, req.health_status);
    if (!req.discount_pre_retirement_mortality && req.current_age < 65) {
        const prob65 = getSurvivalProbability(req.current_age, 65, req.gender, req.health_status);
        if (prob65 > 0) { epvEarly /= prob65; epvDelayed /= prob65; }
    }
    return {
        bridge_cost_lump_sum: Math.round(costToday),
        target_monthly_income_at_70: parseFloat(targetMonthly.toFixed(2)),
        is_affordable: isAffordable,
        shortfall_amount: parseFloat(shortfall.toFixed(2)),
        surplus_amount: parseFloat(surplus.toFixed(2)),
        bonus_estate_value_at_85: parseFloat(bonusEstate.toFixed(2)),
        breakeven_age_economic: breakevenAge,
        probability_of_winning: parseFloat(probWin.toFixed(4)),
        life_expectancy: getLifeExpectancy(req.current_age, req.gender, req.health_status),
        epv_early: parseFloat(epvEarly.toFixed(2)),
        epv_delayed: parseFloat(epvDelayed.toFixed(2)),
        recommendation: rec,
        recommendation_reasoning: reason
    };
}

// --- UI CODE ---
let myChart = null;
const $ = (id) => document.getElementById(id);

function toggleTheme() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        updateIcons('light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        updateIcons('dark');
    }
}

function updateIcons(mode) {
    const sun = $('sun-icon');
    const moon = $('moon-icon');
    if (mode === 'dark') { sun.classList.remove('hidden'); moon.classList.add('hidden'); }
    else { sun.classList.add('hidden'); moon.classList.remove('hidden'); }
}

const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    updateIcons('dark');
} else {
    document.documentElement.classList.remove('dark');
    updateIcons('light');
}

$('age').addEventListener('input', (e) => $('age-val').innerText = e.target.value);
$('ror').addEventListener('input', (e) => $('ror-val').innerText = (e.target.value * 100).toFixed(1) + "%");
$('wage').addEventListener('input', (e) => $('wage-val').innerText = (e.target.value * 100).toFixed(1) + "%");
$('mortality-risk').addEventListener('change', calculate);

function calculate() {
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const payload = {
        current_age: parseInt($('age').value),
        cpp_estimate_at_65: parseFloat($('cpp').value),
        rrsp_savings: parseFloat($('savings').value),
        health_status: $('health').value,
        real_rate_of_return: parseFloat($('ror').value),
        wage_growth: parseFloat($('wage').value),
        discount_pre_retirement_mortality: $('mortality-risk').checked,
        gender: gender
    };
    const data = calculateBridgeScenario(payload);
    renderResults(data);
}

function updateLifeExpectancy() {
    const genderEl = document.querySelector('input[name="gender"]:checked');
    if (!genderEl) return;
    const le = getLifeExpectancy(parseInt($('age').value), genderEl.value, $('health').value);
    $('le-display').innerText = `Est. Life Expectancy: ${le}`;
}

$('health').addEventListener('change', updateLifeExpectancy);
$('age').addEventListener('change', updateLifeExpectancy);
document.querySelectorAll('input[name="gender"]').forEach(el => el.addEventListener('change', updateLifeExpectancy));
window.addEventListener('DOMContentLoaded', updateLifeExpectancy);

function renderResults(data) {
    $('empty-state').classList.add('hidden');
    $('results').classList.remove('hidden');
    if (data.life_expectancy) $('le-display').innerText = `Est. Life Expectancy: ${data.life_expectancy}`;
    $('cost-display').innerText = "$" + data.bridge_cost_lump_sum.toLocaleString();
    const badge = $('afford-badge');
    const affordText = $('afford-text');
    affordText.classList.remove('hidden');
    if (data.is_affordable) {
        badge.className = "mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800";
        badge.innerText = "✅ Fully Funded";
        $('cost-display').className = "text-3xl font-extrabold text-green-600";
        affordText.innerText = "Your savings are sufficient to fund the cost of bridging.";
    } else {
        badge.className = "mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800";
        badge.innerText = `❌ Shortfall: $${data.shortfall_amount.toLocaleString()}`;
        $('cost-display').className = "text-3xl font-extrabold text-red-600";
        affordText.innerText = `Your savings are insufficient (shortfall of $${data.shortfall_amount.toLocaleString()}).`;
    }
    $('prob-display').innerText = (data.probability_of_winning * 100).toFixed(1) + "%";
    $('rec-text').innerText = data.recommendation_reasoning;
    if (data.epv_early && data.epv_delayed) {
        $('epv-monthly-early').innerText = "$" + parseInt($('cpp').value).toLocaleString();
        $('epv-monthly-delayed').innerText = "$" + data.target_monthly_income_at_70.toLocaleString();
        $('epv-total-early').innerText = "$" + data.epv_early.toLocaleString();
        $('epv-total-delayed').innerText = "$" + data.epv_delayed.toLocaleString();
        if (data.epv_delayed > data.epv_early) {
            $('epv-total-delayed').classList.add('text-green-600');
            $('epv-total-early').classList.remove('text-green-600');
        } else {
            $('epv-total-early').classList.add('text-green-600');
            $('epv-total-delayed').classList.remove('text-green-600');
        }
    }
    renderChart(data.breakeven_age_economic, data.probability_of_winning);
}

function renderChart(breakevenAge, probability) {
    const ctx = document.getElementById('resultChart').getContext('2d');
    if (myChart) myChart.destroy();
    const ageStart = 60, ageEnd = 95;
    const labels = [], dataEarly = [], dataDelayed = [];
    const monthlyEarly = parseInt($('cpp').value.replace(/,/g, '')) || 1000;
    const delayedText = $('epv-monthly-delayed').innerText.replace('$', '').replace(/,/g, '');
    let monthlyDelayed = parseFloat(delayedText);
    if (isNaN(monthlyDelayed)) monthlyDelayed = monthlyEarly * 1.42 * Math.pow(1.011, 5);
    const ror = parseFloat($('ror').value);
    const monthlyRate = Math.pow(1 + ror, 1/12) - 1;
    let balEarly = 0, balDelayed = 0;
    for (let age = ageStart; age <= ageEnd; age++) {
        labels.push(age);
        for (let m = 0; m < 12; m++) {
            balEarly = (balEarly + (age >= 65 ? monthlyEarly : 0)) * (1 + monthlyRate);
            balDelayed = (balDelayed + (age >= 70 ? monthlyDelayed : 0)) * (1 + monthlyRate);
        }
        dataEarly.push(balEarly);
        dataDelayed.push(balDelayed);
    }
    const isDark = document.documentElement.classList.contains('dark');
    const colorEarly = isDark ? '#FCA5A5' : '#EF4444';
    const colorDelayed = isDark ? '#86EFAC' : '#10B981';
    const gridColor = isDark ? '#334155' : '#E2E8F0';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const annotationPlugin = {
        id: 'annotationLine',
        beforeDraw: (chart) => {
            const ctx = chart.ctx, xAxis = chart.scales.x, yAxis = chart.scales.y;
            const index = labels.indexOf(parseInt(breakevenAge));
            if (index === -1) return;
            const x = xAxis.getPixelForValue(index);
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = textColor;
            ctx.stroke();
            ctx.fillStyle = textColor;
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Breakeven: Age ${breakevenAge}`, x, yAxis.top - 10);
            ctx.restore();
        }
    };
    myChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [
            { label: 'Take Early (65)', data: dataEarly, borderColor: colorEarly, backgroundColor: colorEarly, borderWidth: 3, pointRadius: 0, tension: 0.1 },
            { label: 'Delay Strategy (70)', data: dataDelayed, borderColor: colorDelayed, backgroundColor: colorDelayed, borderWidth: 3, pointRadius: 0, tension: 0.1 }
        ]},
        plugins: [annotationPlugin],
        options: {
            responsive: true, maintainAspectRatio: false,
            layout: { padding: { top: 20, right: 20, bottom: 0, left: 10 } },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, padding: 20, usePointStyle: true, font: { family: 'Inter, sans-serif', size: 12 } } },
                tooltip: { backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)', titleColor: isDark ? '#f1f5f9' : '#1e293b', bodyColor: isDark ? '#cbd5e1' : '#475569', borderColor: gridColor, borderWidth: 1, padding: 10, callbacks: { label: (ctx) => ctx.dataset.label + ': ' + new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumSignificantDigits:3}).format(ctx.parsed.y) } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, callback: v => '$' + v/1000 + 'k' }, border: { display: false } },
                x: { grid: { color: gridColor }, ticks: { color: textColor, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }, border: { display: false } }
            }
        }
    });
}
