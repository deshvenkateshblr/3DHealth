/* ============================================================
   KYH (Know Your Health) — shared utilities used by every page.
   Handles: cross-page state, unit conversion, range parsing,
   dataset matching, and the reference-range gauge component.
   ============================================================ */

const STATE_KEY = 'chart_state_v1';
const REMEMBER_KEY = 'kyh_remember_v1';
const URL_PAYLOAD_MAX = 1800; // stay safely under common proxy limits

/* ---------- Clinical Routing Constants ---------- */
const GROUP_ORDER = [
  'Cardiometabolic', 
  'Cardiovascular', 
  'Metabolic', 
  'Female Specific', 
  'Age Specific', 
  'Low Risk'
];

const NO_SYMPTOM_FALLBACK = {
  'Cardiometabolic': 'no specific symptom — cardiometabolic baseline',
  'Cardiovascular': 'no specific symptom — cardiovascular baseline',
  'Metabolic': 'no specific symptom — metabolic baseline',
  'Female Specific': 'no specific symptom — female biomechanical baseline',
  'Age Specific': 'no specific symptom — longevity and balance baseline',
  'Low Risk': 'no specific symptom — general baseline'
};

/* ---------- Cross-page state ----------
   Default: sessionStorage only (cleared when the tab/window closes).
   Optional: localStorage when the user opts in on Profile
   ("Remember my progress on this device").
   State also travels as a base64 payload between pages as a backup
   (for file:// multi-page testing, or when storage is blocked).

   PRIVACY: that payload lives in the URL #fragment (#d=...), never in the
   query string. Browsers do not send the fragment to the server or in the
   Referer header, so health data cannot reach server logs, proxies or
   third parties. Once the state is safely in sessionStorage the fragment is
   removed from the address bar (see scrubStateFromUrl). Legacy ?d= links
   are still read, then removed, so old bookmarks keep working. */

/* Read a value from the #fragment (#k=v&k2=v2); fall back to the legacy query string. */
function getUrlParam(key) {
  const parts = location.hash.replace(/^#/, '').split('&');
  for (const part of parts) {
    if (part.indexOf(key + '=') === 0) {
      try { return decodeURIComponent(part.slice(key.length + 1)); } catch (e) { return null; }
    }
  }
  return new URLSearchParams(location.search).get(key);
}

/* Remove the state payload from the address bar once it is stored safely.
   If storage is unavailable the URL is the only copy, so leave it alone. */
function scrubStateFromUrl() {
  if (!(window.history && history.replaceState)) return;
  if (!location.hash && !location.search) return;
  try {
    if (sessionStorage.getItem(STATE_KEY) === null) return;
  } catch (e) { return; }
  try {
    const q = new URLSearchParams(location.search);
    q.delete('d');
    const newSearch = q.toString() ? '?' + q.toString() : '';
    const keep = location.hash.replace(/^#/, '').split('&').filter(p => p && p.indexOf('d=') !== 0);
    const newHash = keep.length ? '#' + keep.join('&') : '';
    if (newSearch === location.search && newHash === location.hash) return;
    history.replaceState(history.state, '', location.pathname + newSearch + newHash);
  } catch (e) { /* ignore: cosmetic only */ }
}

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
      localStorage.removeItem('kyh_brief_history_v1');
    }
  } catch (e) { /* ignore */ }
}

/* Defence in depth for state arriving via a link (#d= / ?d=): the link is
   untrusted input. Keep only known top-level keys, drop prototype-polluting
   keys, cap size/depth, and strip < > from every string so it can never be
   turned into markup even if some page forgets to escape it. */
const STATE_ALLOWED_KEYS = ['acknowledgedLimitations','profile','vitals','diagnostics','routine','exercises','diet'];
// Active-care symptoms the app does not take (About page scope). Kept out of the picker and out of incoming state.
window.RED_FLAG_SYMPTOMS = new Set(['Chest Pain', 'Fainting / Passing Out', 'Blood in Stool', 'Palpable Lump']);

/* Derived flags: pseudo-symptoms worked out from the profile. They are never shown in the
   symptom picker and never stored in profile.symptoms (so they stay out of links, the Doctor
   Brief and symptom matching). Data files can name them in `contraindications`, and
   derivedFlags(profile) is the place to widen the check when exercises, tests or diet items
   specific to older adults are added.
   NEEDS PHYSICIAN REVIEW: SENIOR_AGE is a placeholder cut-off (India's legal senior-citizen
   age is 60; many clinical guidelines use 65). */
window.SENIOR_AGE = 65;
window.SENIOR_FLAG = 'Senior Citizen';
window.DERIVED_FLAGS = new Set([window.SENIOR_FLAG]);
window.derivedFlags = function (profile) {
  const flags = [];
  const age = Number(profile && profile.age);
  if (age >= window.SENIOR_AGE) flags.push(window.SENIOR_FLAG);
  return flags;
};

function sanitizeIncomingState(input) {
  const BAD = { '__proto__': 1, 'constructor': 1, 'prototype': 1 };
  function clean(v, depth) {
    if (depth > 8) return undefined;
    if (typeof v === 'string') return v.slice(0, 500).replace(/[<>]/g, '');
    if (typeof v === 'number') return isFinite(v) ? v : undefined;
    if (typeof v === 'boolean' || v === null) return v;
    if (Array.isArray(v)) return v.slice(0, 300).map(x => clean(x, depth + 1)).filter(x => x !== undefined);
    if (typeof v === 'object') {
      const out = {};
      Object.keys(v).slice(0, 300).forEach(k => {
        if (BAD[k]) return;
        const c = clean(v[k], depth + 1);
        if (c !== undefined) out[k.slice(0, 80).replace(/[<>]/g, '')] = c;
      });
      return out;
    }
    return undefined;
  }
  const out = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  STATE_ALLOWED_KEYS.forEach(k => { if (k in input) { const c = clean(input[k], 0); if (c !== undefined) out[k] = c; } });
  if (out.profile && Array.isArray(out.profile.symptoms)) out.profile.symptoms = out.profile.symptoms.filter(x => !window.RED_FLAG_SYMPTOMS.has(x));
  return out;
}

function loadState() {
  let fromUrl = null;
  const payload = getUrlParam('d');
  if (payload) {
    try {
      const binary = atob(payload);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      const json = new TextDecoder().decode(bytes);
      fromUrl = sanitizeIncomingState(JSON.parse(json));
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
  // Scope guard: adults only, and not while pregnant. Any step page reached with
  // such a profile (stale storage, edited link) goes back to Profile, which shows the pause.
  const sp = state.profile || {};
  const outOfScope = (Number(sp.age) > 0 && Number(sp.age) < 18) || sp.reproStatus === 'Currently pregnant';
  if (outOfScope && !/(profile|index|about|not-ready)\.html$|\/$/.test(location.pathname)) {
    location.replace('profile.html');
  }
  persistState(state);
  scrubStateFromUrl();
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
    // Carry the payload in the #fragment (never sent to the server), not the
    // query string. On https only when it is still small; on file:// always,
    // so multi-page local testing still works.
    if (isFile || payload.length <= URL_PAYLOAD_MAX) {
      href = url + (url.includes('#') ? '&' : '#') + 'd=' + payload;
    }
  } catch (e) {
    // encoding failed → navigate without the payload
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
  if (metabolic && cardio) cats.push('Cardiometabolic');

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
      <div class="brand-caption"${Array.from(document.querySelectorAll('h1')).some(h => h.offsetParent !== null) ? '' : ' role="heading" aria-level="1"'}>${pageTitle}</div>
      <div class="map-route" aria-label="Progress from Fine to Great">
        ${stopsHtml}
      </div>
    </div>
  `;
}

function renderFooter() {
  const target = document.querySelector('footer') || document.getElementById('app-footer');
  if (!target) return;
  target.innerHTML = `
    <span>KYH &mdash; Know Your Health. Own Your Path. Your answers stay in your browser and are never sent to KYH. Video pictures and playback come from YouTube.</span>
    <span>Not a substitute for professional medical advice. <a href="#" id="kyh-start-over">Start over</a></span>
  `;
  const so = document.getElementById('kyh-start-over');
  if (so) so.addEventListener('click', (e) => {
    e.preventDefault();
    if (!confirm('Start over? This clears your answers saved in this browser.')) return;
    try { sessionStorage.removeItem(STATE_KEY); sessionStorage.removeItem('kyh_brief_history_v1'); } catch (err) {}
    try { localStorage.removeItem(STATE_KEY); localStorage.removeItem('kyh_brief_history_v1'); } catch (err) {}
    location.href = 'index.html';
  });
}

/* Compendium of Physical Activities:
   kcal = MET × 3.5 × kg × min / 200  ≡  MET × kg × hours × 1.05 */
const MET_KCAL_FACTOR = 1.05;
const REST_OF_DAY_MET = 1.5; // assumed for any time of the day the person did not describe

function activitySessionKcal(met, weightKg, hours, mins) {
  const durationHours = (Number(hours) || 0) + ((Number(mins) || 0) / 60);
  return (Number(met) || 0) * (Number(weightKg) || 0) * durationHours * MET_KCAL_FACTOR;
}

/** Daily TDEE uses the 24-hour ledger only. Weekly extras are not averaged in. */
function activityDailyKcal(activity, met, weightKg) {
  if (activity && activity.freq && activity.freq !== 'daily') return 0;
  return activitySessionKcal(met, weightKg, activity && activity.hours, activity && activity.mins);
}

/** Resting energy per day (Mifflin-St Jeor), or 0 if the profile is incomplete. */
function restingKcalPerDay(profile) {
  const p = profile || {};
  const kg = Number(p.weightKg) || 0, cm = Number(p.heightCm) || 0, age = Number(p.age) || 0;
  if (!kg || !cm || !age) return 0;
  return 10 * kg + 6.25 * cm - 5 * age + (p.sex === 'Female' ? -161 : 5);
}

/* Daily energy use from the day's activities.
   Each activity's MET is a multiple of resting energy, so with a complete profile the
   day is priced from the person's own resting energy: kcal = MET-hours x resting / 24.
   (The flat 1.05 kcal/kg/h per MET assumes everyone rests at 3.5 ml/kg/min, which runs
   about 15% high for a typical adult.) Without a full profile it falls back to that flat rate.
   Time not described counts as light activity (REST_OF_DAY_MET). */
function estimateTdeeFromActivities(activities, weightKg, defs, profile) {
  defs = defs || (typeof window !== 'undefined' && window.ACTIVITIES) || [];
  const list = activities || [];
  let metHours = 0, loggedH = 0, flatKcal = 0;
  list.forEach(sa => {
    if (sa.freq && sa.freq !== 'daily') return;      // weekly extras are not in the daily figure
    const def = defs.find(a => a.id === sa.id);
    const met = def ? Number(def.met) : 1.5;
    const h = (Number(sa.hours) || 0) + (Number(sa.mins) || 0) / 60;
    metHours += met * h; loggedH += h;
    flatKcal += activitySessionKcal(met, weightKg, sa.hours, sa.mins);
  });
  if (list.length && loggedH < 24) {
    metHours += REST_OF_DAY_MET * (24 - loggedH);
    flatKcal += activitySessionKcal(REST_OF_DAY_MET, weightKg, 24 - loggedH, 0);
  }
  const rest = restingKcalPerDay(profile);
  return Math.round(rest > 0 ? rest / 24 * metHours : flatKcal);
}

/* Weekly activities (gym, sports) are NOT part of the daily figure. This gives an indicative
   burn for them on their own, priced the same way as the daily total (MET x resting/24 x hours,
   or the flat rate when the profile is incomplete). It is the energy used while doing the activity
   (the resting share of that time is already inside the daily total), so it is shown as a guide to
   how active the week is and is never added to the daily figure.
   sa = { id, perWeek, hours, mins } (one session = hours + mins). Returns { session, week } or null. */
function weeklyActivityBurn(sa, profile, defs) {
  defs = defs || (typeof window !== 'undefined' && window.ACTIVITIES) || [];
  const def = defs.find(a => a.id === (sa && sa.id));
  const met = def ? Number(def.met) : 0;
  const h = (Number(sa && sa.hours) || 0) + (Number(sa && sa.mins) || 0) / 60;
  const perWeek = Number(sa && sa.perWeek) || 0;
  if (!(met > 0) || !(h > 0) || !(perWeek > 0)) return null;
  const rest = restingKcalPerDay(profile);
  const kg = Number(profile && profile.weightKg) || 0;
  if (!(rest > 0) && !(kg > 0)) return null;
  const session = rest > 0 ? rest / 24 * met * h : met * kg * h * MET_KCAL_FACTOR;
  return { session, week: session * perWeek };
}

/** Rounded for display so an estimate does not look precise: nearest 10 under 200, else nearest 50. */
function approxKcal(n) {
  n = Number(n) || 0;
  return n < 200 ? Math.round(n / 10) * 10 : Math.round(n / 50) * 50;
}

/* ---------- Daily-burn bands: what the cut-offs are, and are not ----------
   BURN_LOW_KCAL / BURN_HIGH_KCAL split estimated daily energy use into lower than average,
   typical and higher than average. Used for: the wording and ranking of the burn insight,
   the Doctor Brief label, a small water bump, and a small protein bump.
   BASIS: rule-of-thumb figures around the usual reference adult (about 2,000-2,200 kcal), +/-20%.
   There is NO published source for these exact numbers; they were set against the earlier,
   flat 1.05 kcal/kg/h burn method and have not been re-tuned for the current method, which
   runs about 15% lower. They ignore body size: a small adult with an ordinary day can read
   as "lower than average". They do NOT set the diet target (that is burn x intake factor, below).
   NEEDS PHYSICIAN REVIEW. The nearest published reference is the FAO/WHO/UNU "Human energy
   requirements" (2001/2004) physical activity level table (PAL = daily energy / resting energy:
   sedentary or light 1.40-1.69, active or moderately active 1.70-1.99, vigorous 2.00-2.40),
   which is size-neutral; moving to a ratio like that would be the better long-term basis. */
const BURN_LOW_KCAL = 1800;
const BURN_HIGH_KCAL = 2400;

/** Daily fluid target (litres) from weight; small bump if burn is higher. */
function estimateWaterLiters(profile, estimatedCalories) {
  const kg = Number(profile && profile.weightKg) || 70;
  let liters = kg * 0.033; // ~33 mL/kg

  const burn = Number(estimatedCalories) || 0;
  if (burn > BURN_HIGH_KCAL) liters += 0.4;      // cut-offs: see note at BURN_LOW_KCAL
  else if (burn > BURN_LOW_KCAL) liters += 0.2;

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

/* Daily burn to use for diet targets. If the person has not confirmed their routine
   (placeholder data, or no routine at all) the number comes from age, sex, height and
   weight (Mifflin-St Jeor x 1.4, a light-activity day) and is flagged as assumed. */
function resolveDailyBurn(routine, profile) {
  const r = routine || {}, p = profile || {};
  const saved = Number(r.estimatedCalories) || 0;
  if (saved > 0 && r.activitiesConfirmed !== false) return { burn: Math.round(saved), assumed: false };
  const kg = Number(p.weightKg) || 70, cm = Number(p.heightCm) || 168, age = Number(p.age) || 35;
  const bmr = 10 * kg + 6.25 * cm - 5 * age + (p.sex === 'Female' ? -161 : 5);
  return { burn: Math.round(bmr * 1.4 / 10) * 10, assumed: true };
}

/* Intake floor. Unsupervised eating plans are generally advised not to go below 1,200 kcal a day
   for women or 1,500 for men (Harvard Health, "Calorie counting made easy"; same figures are in
   common NHS/NIH-style guidance). The floor never pushes the target above the person's estimated
   burn: if their burn is itself under the floor, the target is maintenance and the page asks them
   to talk to a doctor. Using one flat 1,200 for everyone is the alternative; change MIN_INTAKE_KCAL.
   NEEDS PHYSICIAN REVIEW. */
const MIN_INTAKE_KCAL = { Female: 1200, Male: 1500 };

function estimateTargetCalories(estimatedCalories, profile) {
  const burn = Number(estimatedCalories) || 2200;
  const factor = intakeFactorFromBody(profile);
  let cal = Math.round(burn * factor);
  const floorKcal = (profile && profile.sex === 'Female') ? MIN_INTAKE_KCAL.Female : MIN_INTAKE_KCAL.Male;
  let floored = false, lowBurn = false;
  if (cal < floorKcal) {
    if (burn < floorKcal) { cal = Math.round(burn); lowBurn = true; }   // maintenance, flag for a doctor
    else { cal = floorKcal; floored = true; }
  }
  return { cal, factor, burn: Math.round(burn), floored, lowBurn, floorKcal };
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
  if (burn > BURN_HIGH_KCAL) perKg = Math.min(perKg + 0.1, 1.6);   // cut-off: see note at BURN_LOW_KCAL
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

/* ---- In-place video player for Learning resources ----
   Clicking a card's play button swaps its thumbnail for a youtube-nocookie embed
   (the same approach the Exercises page uses). The embed is only created on click. */
document.addEventListener('click', function (e) {
  const btn = e.target.closest && e.target.closest('.video-play');
  if (!btn) return;
  const id = btn.getAttribute('data-vid') || '';
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;          // never embed an unexpected id
  const wrap = btn.parentElement;
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
  iframe.title = btn.getAttribute('aria-label') || 'Video';
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  iframe.setAttribute('loading', 'lazy');
  wrap.replaceChildren(iframe);
});
