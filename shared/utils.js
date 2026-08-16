/* ============================================================
   Your Health Profile — shared utilities used by every page.
   Handles: cross-page state, unit conversion, range parsing,
   dataset matching, and the reference-range gauge component.
   ============================================================ */

const STATE_KEY = 'chart_state_v1';

/* ---------- Cross-page state ----------
   Uses sessionStorage (cleared when the tab/window closes) rather than
   localStorage, so nothing is remembered between browsing sessions — only
   while navigating forward and back through this one visit. State also
   travels as a base64 payload on the URL between pages, as a backup for
   browsers that isolate sessionStorage across local files opened via file://. */
function loadState(){
  let fromUrl = null;
  const params = new URLSearchParams(location.search);
  if(params.has('d')){
    try{
      const json = decodeURIComponent(escape(atob(decodeURIComponent(params.get('d')))));
      fromUrl = JSON.parse(json);
    }catch(e){ /* ignore malformed payloads */ }
  }
  let fromStorage = null;
  try{
    const raw = sessionStorage.getItem(STATE_KEY);
    if(raw) fromStorage = JSON.parse(raw);
  }catch(e){ /* storage unavailable */ }

  const state = Object.assign({}, fromStorage||{}, fromUrl||{});
  persistState(state);
  return state;
}

function persistState(state){
  try{ sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); }catch(e){ /* ignore */ }
}

function encodeStateParam(state){
  const json = JSON.stringify(state);
  return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
}

function goTo(url, state){
  persistState(state);
  location.href = url + '?d=' + encodeStateParam(state);
}

/* ---------- Unit conversion ---------- */
const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

function cmToFtIn(cm){
  const totalIn = cm / CM_PER_IN;
  let ft = Math.floor(totalIn/12);
  let inch = Math.round((totalIn - ft*12)*10)/10;
  if(inch>=12){ ft+=1; inch-=12; }
  return {ft, inch};
}
function ftInToCm(ft, inch){ return (Number(ft||0)*12 + Number(inch||0)) * CM_PER_IN; }
function cmToInFlat(cm){ return cm / CM_PER_IN; }
function inFlatToCm(inch){ return inch * CM_PER_IN; }
function kgToLb(kg){ return kg / KG_PER_LB; }
function lbToKg(lb){ return lb * KG_PER_LB; }

/* ---------- Range parsing (drives the diet/routine/diagnostics matching) ---------- */
function parseRange(str){
  if(!str) return [-Infinity, Infinity];
  let s = String(str).trim();
  if(s.toLowerCase()==='all') return [-Infinity, Infinity];
  s = s.replace(/cm/gi,'').trim();
  if(s.startsWith('>=')) return [parseFloat(s.slice(2)), Infinity];
  if(s.startsWith('<=')) return [-Infinity, parseFloat(s.slice(2))];
  if(s.startsWith('>')) return [parseFloat(s.slice(1)), Infinity];
  if(s.startsWith('<')) return [-Infinity, parseFloat(s.slice(1))];
  if(s.endsWith('+')) return [parseFloat(s.slice(0,-1)), Infinity];
  if(s.includes('-')){
    const parts = s.split('-');
    const lo = parseFloat(parts[0]);
    const hi = parseFloat(parts[1]);
    if(!isNaN(lo) && !isNaN(hi)) return [lo,hi];
  }
  const n = parseFloat(s);
  return isNaN(n) ? [-Infinity,Infinity] : [n,n];
}

function ageRelevancyMatch(str, age){
  if(!str) return true;
  return str.split(';').some(tok=>{
    const t = tok.trim();
    if(t.toLowerCase()==='all') return true;
    if(t.startsWith('>=')) return age >= parseFloat(t.slice(2));
    if(t.startsWith('<=')) return age <= parseFloat(t.slice(2));
    if(t.startsWith('>')) return age > parseFloat(t.slice(1));
    if(t.startsWith('<')) return age < parseFloat(t.slice(1));
    if(t.includes('-')){
      const [a,b] = t.split('-').map(x=>parseFloat(x));
      return age>=a && age<=b;
    }
    return age === parseFloat(t);
  });
}
function genderMatch(str, sex){
  if(!str) return true;
  return str.toLowerCase()==='all' || str.toLowerCase()===sex.toLowerCase();
}
function profileMatch(str, activeCats){
  return str.split(';').map(s=>s.trim()).some(t=>activeCats.includes(t));
}

/* Nearest-match row picker — handles inconsistent/overlapping bucket labels
   in the diet & routine sheets by scoring on containment first, distance second. */
function pickBestRow(rows, sex, crit){
  const candidates = rows.filter(r=>r.sex.toLowerCase()===sex.toLowerCase());
  let best=null, bestContain=-1, bestDist=Infinity;
  for(const r of candidates){
    let contain=0, dist=0;
    if(crit.age!==undefined){
      const [lo,hi]=parseRange(r.age);
      if(crit.age>=lo && crit.age<=hi) contain++;
      else dist += Math.min(Math.abs(crit.age-lo), Math.abs(crit.age-hi))/5;
    }
    if(crit.bmi!==undefined){
      const [lo,hi]=parseRange(r.bmi);
      if(crit.bmi>=lo && crit.bmi<=hi) contain++;
      else dist += Math.min(Math.abs(crit.bmi-lo), Math.abs(crit.bmi-hi))/3;
    }
    if(crit.waist!==undefined){
      const [lo,hi]=parseRange(r.waist);
      if(crit.waist>=lo && crit.waist<=hi) contain++;
      else dist += Math.min(Math.abs(crit.waist-lo), Math.abs(crit.waist-hi))/10;
    }
    if(crit.activity!==undefined && r.activity!==undefined){
      if(r.activity===crit.activity) contain++;
      else dist += 1.5;
    }
    if(contain>bestContain || (contain===bestContain && dist<bestDist)){
      best=r; bestContain=contain; bestDist=dist;
    }
  }
  return best;
}

/* ---------- Derived profile metrics ---------- */
function computeBMI(weightKg, heightCm){ return weightKg / Math.pow(heightCm/100, 2); }
function computeWHtR(waistCm, heightCm){ return waistCm / heightCm; }

function bmiTag(bmi){
  if(bmi<18.5) return ['Underweight','var(--amber)'];
  if(bmi<25) return ['Normal range','var(--teal)'];
  if(bmi<30) return ['Overweight','var(--amber)'];
  return ['Obesity range','var(--rose)'];
}
function whtrTag(r){
  if(r<0.4) return ['Low (verify BMI too)','var(--amber)'];
  if(r<0.5) return ['Healthy range','var(--teal)'];
  if(r<0.6) return ['Increased risk','var(--amber)'];
  return ['High risk','var(--rose)'];
}

function activeCategories(profile){
  const cats = ['Low Risk'];
  const waistHigh = profile.sex==='Female' ? profile.waistCm>80 : profile.waistCm>94;
  const smokingRisk = profile.smoking==='Daily' || profile.smoking==='Occasionally';
  const heavyAlcohol = profile.alcohol==='3-5x/week' || profile.alcohol==='Daily';
  const postMenopausal = profile.reproStatus==='Post-menopausal' || profile.reproStatus==='Perimenopausal';
  const pcos = !!profile.pcos;
  const metabolic = profile.bmi>=25 || waistHigh || profile.famMetabolic || heavyAlcohol || pcos;
  const cardio = profile.age>=40 || waistHigh || profile.famCardio || smokingRisk || postMenopausal;
  if(metabolic) cats.push('Metabolic');
  if(cardio) cats.push('Cardiovascular');
  cats.push('Age Specific');
  if(profile.sex==='Female') cats.push('Female Specific');
  if(metabolic && cardio) cats.push('Mixed');
  return {cats, metabolic, cardio, waistHigh, smokingRisk, heavyAlcohol, postMenopausal, pcos};
}

/* ---------- Formatting ---------- */
function fmtNum(n){ return (Math.round(n*10)/10).toString(); }

/* ---------- Gauge component (signature element, reused on Diet & Routine) ----------
   Renders a reference-range band; an optional markerVal draws a diamond
   showing where the user's own reported value sits against that band. */
function gaugeBlock(name, lo, hi, max, unit, markerVal){
  if(hi===Infinity) hi = max;
  if(lo===-Infinity) lo = 0;
  const leftPct = Math.max(0, (lo/max)*100);
  const widthPct = Math.max(1.5, ((hi-lo)/max)*100);
  let markerHtml = '';
  if(markerVal!==undefined && markerVal!==null && !isNaN(markerVal)){
    const mPct = Math.min(100, Math.max(0, (markerVal/max)*100));
    const bad = markerVal<lo || markerVal>hi;
    markerHtml = `<div class="gauge-marker${bad?' bad':''}" style="left:${mPct}%;" title="Your value: ${fmtNum(markerVal)} ${unit}"></div>`;
  }
  const rangeText = fmtNum(lo)===fmtNum(hi) ? `${fmtNum(lo)} ${unit}` : `${fmtNum(lo)}&ndash;${fmtNum(hi)} ${unit}`;
  return `
  <div class="gauge-block">
    <div class="gauge-label">
      <span class="name">${name}</span>
      <span class="range-val">${rangeText}${markerVal!==undefined && markerVal!==null && !isNaN(markerVal) ? ` &middot; you: ${fmtNum(markerVal)} ${unit}` : ''}</span>
    </div>
    <div class="gauge-track">
      <div class="gauge-band" style="left:${leftPct}%; width:${widthPct}%;"></div>
      ${markerHtml}
    </div>
    <div class="gauge-scale"><span>0</span><span>${fmtNum(max)} ${unit}</span></div>
  </div>`;
}

/* ---------- Small escaping helper for user-entered text ---------- */
function esc(s){
  return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
/* ---------- Unified Header / Progress Map ---------- */
const HEADER_STEPS = [
  {
    id: 'fine',
    label: 'Fine',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
             <path d="M12 21s-6-5.4-6-10a6 6 0 1 1 12 0c0 4.6-6 10-6 10z"/>
             <circle cx="12" cy="11" r="2.2"/>
           </svg>`
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
             <rect x="9" y="3" width="6" height="4" rx="1"/>
           </svg>`
  },
  {
    id: 'routine',
    label: 'Routine',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="12" r="9"/>
             <path d="M12 7v5l3.5 2"/>
           </svg>`
  },
  {
    id: 'diet',
    label: 'Diet',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="12" r="9"/>
             <circle cx="12" cy="12" r="4"/>
           </svg>`
  },
  {
    id: 'great',
    label: 'Great',
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4L12 17.3 5.7 21.4 8 14 2 9.4h7.6z"/>
           </svg>`
  }
];

/**
 * Renders the KYH masthead + progress map.
 * @param {string} activeStep - one of: 'fine' | 'diagnostics' | 'routine' | 'diet' | 'great'
 * @param {string} [targetId='app-header'] - element to inject into
 */
function renderHeader(activeStep = 'fine', targetId = 'app-header') {
  const target = document.getElementById(targetId);
  if (!target) return;

  const activeIndex = HEADER_STEPS.findIndex(s => s.id === activeStep);

  const stopsHtml = HEADER_STEPS.map((step, i) => {
    let cls = 'map-stop';
    if (i === activeIndex) cls += ' active';
    if (i < activeIndex)   cls += ' done';          // previous steps
    if (step.id === 'great') cls += ' dest';

    return `
      <div class="${cls}" data-step="${step.id}">
        <div class="map-pin">${step.icon}</div>
        <div class="label">${step.label}</div>
      </div>
      ${i < HEADER_STEPS.length - 1 ? '<div class="map-line"></div>' : ''}
    `;
  }).join('');

  target.innerHTML = `
    <div class="masthead-inner">
      <div class="brand-lockup">
        <a href="index.html" style="text-decoration:none;">
          <img src="shared/assets/kyh_logo.jpg"
               alt="KYH – Know Your Health. Own Your Path."
               style="height:38px; width:auto; display:block;">
        </a>
      </div>

      <div class="map-route" aria-label="Your progress from Fine to Great">
        ${stopsHtml}
      </div>
    </div>
  `;
}