/* ============================================================
   Your Health Profile — shared utilities used by every page.
   Handles: cross-page state, unit conversion, range parsing,
   dataset matching, and the reference-range gauge component.
   ============================================================ */

const STATE_KEY = 'chart_state_v1';
const REMEMBER_KEY = 'kyh_remember_v1';
const URL_PAYLOAD_MAX = 1800; // stay safely under common proxy limits

/* ---------- Cross-page state ----------
   Default: sessionStorage only (cleared when the tab/window closes).
   Optional: localStorage when the user opts in on Profile
   ("Remember my progress on this device").
   State also travels as a base64 payload on the URL between pages,
   as a backup for file:// multi-page testing. */

function isRememberEnabled() {
  try {
    return localStorage.getItem(REMEMBER_KEY) === '1';
  } catch (e) {
    return false;
  }
}

function setRememberEnabled(on) {
  try {
    if (on) {
      localStorage.setItem(REMEMBER_KEY, '1');
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(STATE_KEY);
    }
  } catch (e) { /* ignore */ }
}

function loadState() {
  let fromUrl = null;
  const params = new URLSearchParams(location.search);
  if (params.has('d')) {
    try {
      const binary = atob(decodeURIComponent(params.get('d')));
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      fromUrl = JSON.parse(json);
    } catch (e) { /* ignore malformed payloads */ }
  }

  let fromSession = null;
  let fromLocal = null;
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (raw) fromSession = JSON.parse(raw);
  } catch (e) { /* storage unavailable */ }

  try {
    if (isRememberEnabled()) {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) fromLocal = JSON.parse(raw);
    }
  } catch (e) { /* ignore */ }

  // Merge: local (resume) < session < URL (latest navigation wins)
  const state = Object.assign({}, fromLocal || {}, fromSession || {}, fromUrl || {});
  persistState(state);
  return state;
}

function persistState(state) {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) { /* ignore */ }
  try {
    if (isRememberEnabled()) {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    }
  } catch (e) { /* ignore */ }
}

function encodeStateParam(state) {
  const json = JSON.stringify(state);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return encodeURIComponent(btoa(binary));
}

function goTo(url, state) {
  persistState(state);

  const isFile = location.protocol === 'file:';
  let href = url;

  try {
    const payload = encodeStateParam(state);
    // On https deployment: only use ?d= when the payload is still small.
    // On file:// keep the query string so multi-page local testing still works.
    if (isFile || payload.length <= URL_PAYLOAD_MAX) {
      href = url + (url.includes('?') ? '&' : '?') + 'd=' + payload;
    }
  } catch (e) {
    // encoding failed → navigate without query string
  }

  location.href = href;
}

/* ---------- Unit conversion ---------- */
const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

function cmToFtIn(cm) {
  const totalIn = cm / CM_PER_IN;
  let ft = Math.floor(totalIn / 12);
  let inch = Math.round((totalIn - ft * 12) * 10) / 10;
  if (inch >= 12) { ft += 1; inch -= 12; }
  return { ft, inch };
}
function ftInToCm(ft, inch) { return (Number(ft || 0) * 12 + Number(inch || 0)) * CM_PER_IN; }
function cmToInFlat(cm) { return cm / CM_PER_IN; }
function inFlatToCm(inch) { return inch * CM_PER_IN; }
function kgToLb(kg) { return kg / KG_PER_LB; }
function lbToKg(lb) { return lb * KG_PER_LB; }

/* ---------- Range parsing (drives the diet/routine/diagnostics matching) ---------- */
function parseRange(str) {
  if (!str) return [-Infinity, Infinity];
  let s = String(str).trim();
  if (s.toLowerCase() === 'all') return [-Infinity, Infinity];
  s = s.replace(/cm/gi, '').trim();
  if (s.startsWith('>=')) return [parseFloat(s.slice(2)), Infinity];
  if (s.startsWith('<=')) return [-Infinity, parseFloat(s.slice(2))];
  if (s.startsWith('>')) return [parseFloat(s.slice(1)), Infinity];
  if (s.startsWith('<')) return [-Infinity, parseFloat(s.slice(1))];
  if (s.endsWith('+')) return [parseFloat(s.slice(0, -1)), Infinity];
  if (s.includes('-')) {
    const parts = s.split('-');
    const lo = parseFloat(parts[0]);
    const hi = parseFloat(parts[1]);
    if (!isNaN(lo) && !isNaN(hi)) return [lo, hi];
  }
  const n = parseFloat(s);
  return isNaN(n) ? [-Infinity, Infinity] : [n, n];
}

function ageRelevancyMatch(str, age) {
  if (!str) return true;
  age = Number(age);
  if (isNaN(age)) return true;
  return String(str).split(';').some(tok => {
    const t = tok.trim();
    if (!t || t.toLowerCase() === 'all') return true;
    // Explicit inclusive operators
    if (t.startsWith('>=')) return age >= parseFloat(t.slice(2));
    if (t.startsWith('<=')) return age <= parseFloat(t.slice(2));
    // Bare > / < : treat as inclusive for screening thresholds
    // e.g. ">40" means age 40 and above (same clinical intent as ">=40")
    if (t.startsWith('>')) return age >= parseFloat(t.slice(1));
    if (t.startsWith('<')) return age <= parseFloat(t.slice(1));
    if (t.includes('-')) {
      const [a, b] = t.split('-').map(x => parseFloat(x));
      return age >= a && age <= b;
    }
    return age === parseFloat(t);
  });
}

function genderMatch(str, sex) {
  if (!str) return true;
  return str.toLowerCase() === 'all' || str.toLowerCase() === sex.toLowerCase();
}
function profileMatch(str, activeCats) {
  return str.split(';').map(s => s.trim()).some(t => activeCats.includes(t));
}

/* Nearest-match row picker — handles inconsistent/overlapping bucket labels
   in the diet & routine sheets by scoring on containment first, distance second. */
function pickBestRow(rows, sex, crit) {
  const candidates = rows.filter(r => r.sex.toLowerCase() === sex.toLowerCase());
  let best = null, bestContain = -1, bestDist = Infinity;
  for (const r of candidates) {
    let contain = 0, dist = 0;
    if (crit.age !== undefined) {
      const [lo, hi] = parseRange(r.age);
      if (crit.age >= lo && crit.age <= hi) contain++;
      else dist += Math.min(Math.abs(crit.age - lo), Math.abs(crit.age - hi)) / 5;
    }
    if (crit.bmi !== undefined) {
      const [lo, hi] = parseRange(r.bmi);
      if (crit.bmi >= lo && crit.bmi <= hi) contain++;
      else dist += Math.min(Math.abs(crit.bmi - lo), Math.abs(crit.bmi - hi)) / 3;
    }
    if (crit.waist !== undefined) {
      const [lo, hi] = parseRange(r.waist);
      if (crit.waist >= lo && crit.waist <= hi) contain++;
      else dist += Math.min(Math.abs(crit.waist - lo), Math.abs(crit.waist - hi)) / 10;
    }
    if (crit.activity !== undefined && r.activity !== undefined) {
      if (r.activity === crit.activity) contain++;
      else dist += 1.5;
    }
    if (contain > bestContain || (contain === bestContain && dist < bestDist)) {
      best = r; bestContain = contain; bestDist = dist;
    }
  }
  return best;
}

/* ---------- Derived profile metrics ---------- */
function computeBMI(weightKg, heightCm) { return weightKg / Math.pow(heightCm / 100, 2); }
function computeWHtR(waistCm, heightCm) { return waistCm / heightCm; }

/** Default on: this app is built for India. Uncheck for generic WHO adult cutoffs. */
function usesIndiaCutoffs(profile) {
  if (profile && profile.adjustForIndia === false) return false;
  return true;
}

function bodyCutoffs(profile) {
  if (usesIndiaCutoffs(profile)) {
    return {
      bmiOver: 23,
      bmiObese: 27.5,
      waistMaleCm: 90,
      waistFemaleCm: 80
    };
  }
  return {
    bmiOver: 25,
    bmiObese: 30,
    waistMaleCm: 94,
    waistFemaleCm: 80
  };
}

function bmiClass(bmi, profile) {
  const n = Number(bmi);
  if (isNaN(n)) return null;
  const c = bodyCutoffs(profile);
  if (n < 18.5) return 'under';
  if (n < c.bmiOver) return 'normal';
  if (n < c.bmiObese) return 'over';
  return 'obese';
}

function bmiTag(bmi, profile) {
  const kind = bmiClass(bmi, profile);
  const india = usesIndiaCutoffs(profile);
  const suffix = india ? ' · India' : '';
  if (kind === 'under') return ['Underweight' + suffix, 'var(--amber)'];
  if (kind === 'normal') return ['Normal range' + suffix, 'var(--teal)'];
  if (kind === 'over') return ['Overweight' + suffix, 'var(--amber)'];
  return ['Obesity range' + suffix, 'var(--rose)'];
}
function whtrTag(r) {
  if (r < 0.4) return ['Low (verify BMI too)', 'var(--amber)'];
  if (r < 0.5) return ['Healthy range', 'var(--teal)'];
  if (r < 0.6) return ['Increased risk', 'var(--amber)'];
  return ['High risk', 'var(--rose)'];
}

/* Shared smoking & alcohol values (profile.html stores these exact strings).
   Older sessions may still have "Former smoker" or "Occasionally". */
const LIFESTYLE_VALUES = ['Never', 'Former', 'Occasional', '1-2x/week', '3-5x/week', 'Daily'];

function normalizeLifestyle(value) {
  if (value == null || value === '') return '';
  const s = String(value).trim().toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ');
  if (s === 'never') return 'Never';
  if (s.startsWith('former')) return 'Former';
  if (s.startsWith('occasional')) return 'Occasional';
  if (s.includes('1-2')) return '1-2x/week';
  if (s.includes('3-5')) return '3-5x/week';
  if (s === 'daily') return 'Daily';
  return String(value).trim();
}

function lifestyleLabel(kind, value) {
  const n = normalizeLifestyle(value);
  if (n === 'Former') return kind === 'smoking' ? 'Former smoker' : 'Former drinker';
  if (n === 'Occasional') return 'Occasional / social';
  if (n === '1-2x/week') return '1–2x / week';
  if (n === '3-5x/week') return '3–5x / week';
  return n || '';
}

function isCurrentUse(value) {
  const n = normalizeLifestyle(value);
  return n === 'Occasional' || n === '1-2x/week' || n === '3-5x/week' || n === 'Daily';
}

function isHeavyAlcohol(value) {
  const n = normalizeLifestyle(value);
  return n === '3-5x/week' || n === 'Daily';
}

function isSmokingRisk(value) {
  const n = normalizeLifestyle(value);
  return n === 'Former' || isCurrentUse(n);
}

// shared/utils.js — replace / extend activeCategories
function deriveRiskCategories(profile) {
  const cats = ['Low Risk'];
  const waistCm = Number(profile.waistCm) || 0;
  const heightCm = Number(profile.heightCm) || 0;
  const whtr = heightCm > 0 ? waistCm / heightCm : (Number(profile.whtr) || 0);
  const bmi = Number(profile.bmi) || 0;
  const age = Number(profile.age) || 0;

  const c = bodyCutoffs(profile);
  const centralObesity = whtr >= 0.5 ||
    (profile.sex === 'Female' ? waistCm > c.waistFemaleCm : waistCm > c.waistMaleCm);

  const heavyAlcohol = isHeavyAlcohol(profile.alcohol);
  const smokingRisk  = isSmokingRisk(profile.smoking);
  const postMenopausal = profile.reproStatus === 'Post-menopausal' ||
                         profile.reproStatus === 'Perimenopausal';
  const pcos = !!profile.pcos;

  const metabolic = bmi >= c.bmiOver || centralObesity || !!profile.famMetabolic ||
                    heavyAlcohol || pcos;
  const cardio    = age >= 40 || centralObesity || !!profile.famCardio ||
                    smokingRisk || postMenopausal;

  if (metabolic) cats.push('Metabolic');
  if (cardio)    cats.push('Cardiovascular');
  cats.push('Age Specific');
  if (profile.sex === 'Female') cats.push('Female Specific');
  if (metabolic && cardio) cats.push('Mixed');

  return { cats, metabolic, cardio, centralObesity, smokingRisk, heavyAlcohol, postMenopausal, pcos };
}

// Keep the old name as a thin alias so existing callers keep working
function activeCategories(profile) {
  return deriveRiskCategories(profile);
}


/* ---------- Formatting ---------- */
function fmtNum(n) { return (Math.round(n * 10) / 10).toString(); }

/* ---------- Gauge component ---------- */
function gaugeBlock(name, lo, hi, max, unit, markerVal) {
  if (hi === Infinity) hi = max;
  if (lo === -Infinity) lo = 0;
  const leftPct = Math.max(0, (lo / max) * 100);
  const widthPct = Math.max(1.5, ((hi - lo) / max) * 100);
  let markerHtml = '';
  if (markerVal !== undefined && markerVal !== null && !isNaN(markerVal)) {
    const mPct = Math.min(100, Math.max(0, (markerVal / max) * 100));
    const bad = markerVal < lo || markerVal > hi;
    markerHtml = `<div class="gauge-marker${bad ? ' bad' : ''}" style="left:${mPct}%;" title="Your value: ${fmtNum(markerVal)} ${unit}"></div>`;
  }
  const rangeText = fmtNum(lo) === fmtNum(hi) ? `${fmtNum(lo)} ${unit}` : `${fmtNum(lo)}&ndash;${fmtNum(hi)} ${unit}`;
  return `
  <div class="gauge-block">
    <div class="gauge-label">
      <span class="name">${name}</span>
      <span class="range-val">${rangeText}${markerVal !== undefined && markerVal !== null && !isNaN(markerVal) ? ` &middot; you: ${fmtNum(markerVal)} ${unit}` : ''}</span>
    </div>
    <div class="gauge-track">
      <div class="gauge-band" style="left:${leftPct}%; width:${widthPct}%;"></div>
      ${markerHtml}
    </div>
    <div class="gauge-scale"><span>0</span><span>${fmtNum(max)} ${unit}</span></div>
  </div>`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ============================================================
   Modern header / progress map
   ============================================================ */
const HEADER_STEPS = [
  {
    id: 'fine',
    label: 'Fine',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/></svg>`
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>`
  },
  {
    id: 'routine',
    label: 'Routine',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>`
  },
  {
    id: 'diet',
    label: 'Diet',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>`
  },
  {
    id: 'great',
    label: 'Great',
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4L12 17.3 5.7 21.4 8 14 2 9.4h7.6z"/></svg>`
  }
];

function renderHeader(activeStep = 'fine', pageTitle = 'Know Your Health') {
  const target = document.getElementById('app-header');
  if (!target) {
    console.error('Header target #app-header not found');
    return;
  }

  const activeIndex = HEADER_STEPS.findIndex(s => s.id === activeStep);

  let stopsHtml = '';
  HEADER_STEPS.forEach((step, i) => {
    let cls = 'map-stop';
    if (i === activeIndex) cls += ' active';
    if (i < activeIndex) cls += ' done';
    if (step.id === 'great') cls += ' dest';

    stopsHtml += `
      <div class="${cls}">
        <div class="map-pin">${step.icon}</div>
        <div class="label">${step.label}</div>
      </div>
    `;

    if (i < HEADER_STEPS.length - 1) {
      stopsHtml += `<div class="map-line"></div>`;
    }
  });

  target.innerHTML = `
    <div class="masthead-inner">
      <div class="brand-logo">
        <a href="index.html">
          <img src="shared/assets/kyh_logo_final.png" alt="KYH" class="brand-mark">
        </a>
      </div>
      <div class="brand-caption">${pageTitle}</div>
      <div class="map-route" aria-label="Progress from Fine to Great">
        ${stopsHtml}
      </div>
    </div>
  `;
}

/* Compendium of Physical Activities:
   kcal = MET × 3.5 × kg × min / 200  ≡  MET × kg × hours × 1.05 */
const MET_KCAL_FACTOR = 1.05;

function activitySessionKcal(met, weightKg, hours, mins) {
  const durationHours = (Number(hours) || 0) + ((Number(mins) || 0) / 60);
  return (Number(met) || 0) * (Number(weightKg) || 0) * durationHours * MET_KCAL_FACTOR;
}

/** Daily TDEE uses the 24-hour ledger only. Weekly extras are not averaged in. */
function activityDailyKcal(activity, met, weightKg) {
  if (activity && activity.freq && activity.freq !== 'daily') return 0;
  return activitySessionKcal(met, weightKg, activity && activity.hours, activity && activity.mins);
}

function estimateTdeeFromActivities(activities, weightKg, defs) {
  defs = defs || (typeof window !== 'undefined' && window.ACTIVITIES) || [];
  let daily = 0;
  (activities || []).forEach(sa => {
    const def = defs.find(a => a.id === sa.id);
    const met = def ? Number(def.met) : 1.5;
    daily += activityDailyKcal(sa, met, weightKg);
  });
  return Math.round(daily);
}

/** Daily fluid target (litres) from weight; small bump if burn is higher. */
function estimateWaterLiters(profile, estimatedCalories) {
  const kg = Number(profile && profile.weightKg) || 70;
  let liters = kg * 0.033; // ~33 mL/kg

  const burn = Number(estimatedCalories) || 0;
  if (burn > 2400) liters += 0.4;
  else if (burn > 1800) liters += 0.2;

  liters = Math.max(1.5, Math.min(4.0, liters));
  return Math.round(liters * 10) / 10;
}

/**
 * Intake as a fraction of estimated daily burn.
 * Underweight: slight surplus; healthy: near maintenance;
 * overweight/obese: mild deficit (still conservative for a self-serve app).
 */
function intakeFactorFromBody(profile) {
  const bmi = Number(profile && profile.bmi);
  const whtr = Number(profile && profile.whtr);

  // Unknown BMI: default to maintenance (1.0) rather than a deficit --
  // recommending a calorie cut based on missing data isn't a safe default.
  if (!bmi || isNaN(bmi)) return 1.0;

  const c = bodyCutoffs(profile);
  let factor;
  if (bmi < 18.5) factor = 1.05;
  else if (bmi < c.bmiOver) factor = 0.98;
  else if (bmi < c.bmiObese) factor = 0.93;
  else factor = 0.90;

  // Central adiposity with "normal" BMI → gentle nudge down
  if (bmi >= 18.5 && bmi < c.bmiOver && !isNaN(whtr) && whtr >= 0.5) {
    factor = Math.min(factor, 0.95);
  }

  return factor;
}

function estimateTargetCalories(estimatedCalories, profile) {
  const burn = Number(estimatedCalories) || 2200;
  const factor = intakeFactorFromBody(profile);
  return {
    cal: Math.round(burn * factor),
    factor,
    burn: Math.round(burn)
  };
}

function proteinTargetGrams(profile, estimatedCalories) {
  const kg = Number(profile && profile.weightKg) || 70;
  const bmi = Number(profile && profile.bmi);
  let perKg = 1.2;
  if (!isNaN(bmi)) {
    const kind = bmiClass(bmi, profile);
    if (kind === 'under' || kind === 'over' || kind === 'obese') perKg = 1.5;
  }
  const burn = Number(estimatedCalories) || 0;
  if (burn > 2400) perKg = Math.min(perKg + 0.1, 1.6);
  const mid = Math.round(kg * perKg);
  return {
    min: Math.round(mid * 0.9),
    max: Math.round(mid * 1.1),
    mid,
    label: `~${Math.round(mid * 0.9)}–${Math.round(mid * 1.1)} g/day`
  };
}

function fibreTargetGrams(profile) {
  const g = (profile && profile.sex === 'Male') ? 30 : 25;
  return { grams: g, label: `~${g} g/day` };
}

/** Guide line for priority cards; null if no numeric target. */
function nutrientTargetLabel(nutrientName, profile, estimatedCalories) {
  const name = (nutrientName || '').toLowerCase();
  if (name === 'protein') {
    return proteinTargetGrams(profile, estimatedCalories).label;
  }
  if (name === 'fibre' || name === 'fiber' || name === 'dietary fiber') {
    return fibreTargetGrams(profile).label;
  }
  if (name === 'carbohydrates' || name === 'carbs') {
    return '~45–55% of calorie target';
  }
  if (name === 'fats' || name === 'healthy fats') {
    return '~25–35% of calorie target';
  }
  // micros / limit nutrients: no chip
  return null;
}