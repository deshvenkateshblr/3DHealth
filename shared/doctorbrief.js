/* ============================================================
   shared/doctorbrief.js
   KYH -- printable one-page (A4) Doctor Brief.

   Builds a compact, question-led sheet a person can print and take
   to a clinic. It is a list of things to ASK, not advice:
     - History     : free text from the person (past visits, hospital stays...)
     - Tests       : results already had (one heading per test + the person's own
                     note) and up to 3 tests to ask about ("would this help me?")
     - Activity    : typical-day summary, regular activities, TDEE, and 3 exercises to ask about
     - Diet        : preference, self-assessed nutrients, food pattern, target
                     calories, and 3 changes to ask about

   Depends on: utils.js (esc, bmiClass, bmiTag, whtrTag, lifestyleLabel,
               activityBandFromBurn via KYHInsights)
   Optional data: window.DIAG, window.EXERCISES (for "what it checks" / "why")
   ============================================================ */
(function (global) {
  'use strict';

  /* Set this to the public address you want printed in the footer.
     If left empty, the current site address is used when the app is
     served over http(s). */
  const KYH_SITE_URL = 'https://vividnova.com/3DHealth/';

  const RESULT_WITHIN  = 'Within range';
  const RESULT_FLAGGED = 'Flagged \u2014 needs attention';

  function siteUrl() {
    if (KYH_SITE_URL) return KYH_SITE_URL;
    try {
      if (/^https?:$/.test(location.protocol)) return location.origin + location.pathname.replace(/[^/]*$/, '');
    } catch (e) { /* ignore */ }
    return '';
  }

  function fmtDate(d) {
    try { return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return d.toDateString(); }
  }

  /* ---------- Icons (large, stroke-based) ---------- */
  const ICON = {
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M5 20.5c1.4-3.8 4-5.5 7-5.5s5.6 1.7 7 5.5"/></svg>',
    pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2.5-6 4 12 2.5-6H21"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3"/><path d="M7.5 15h9"/></svg>',
    move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="14.5" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 1.5 2-5-3-2-2.5 3-3-1M11 15l-1.5-3.5M16 11.5l3.5 1"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4C10 4 4 9 4 15c0 3 2 5 5 5 6 0 11-6 11-16z"/><path d="M4 21c3-6 7-9 12-11"/></svg>',
    notes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8.5 11h7M8.5 14.5h7M8.5 18h4"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>'
  };

  /* ---------- Free-text history (kept OUT of the shared app state) ----------
     Stored under its own key so it never rides along in the ?d= URL payload
     that the other pages use, and is removed with the rest of the saved data
     when "remember my progress" is switched off. */
  const HISTORY_KEY = 'kyh_brief_history_v1';
  const HISTORY_MAX = 600;

  function remembered() {
    try { return typeof isRememberEnabled === 'function' && isRememberEnabled(); } catch (e) { return false; }
  }
  function getHistory() {
    try {
      let v = sessionStorage.getItem(HISTORY_KEY);
      if (v == null && remembered()) v = localStorage.getItem(HISTORY_KEY);
      return v || '';
    } catch (e) { return ''; }
  }
  function setHistory(text) {
    const v = String(text || '').slice(0, HISTORY_MAX);
    try {
      if (v.trim()) { sessionStorage.setItem(HISTORY_KEY, v); if (remembered()) localStorage.setItem(HISTORY_KEY, v); }
      else { sessionStorage.removeItem(HISTORY_KEY); localStorage.removeItem(HISTORY_KEY); }
    } catch (e) { /* storage unavailable */ }
  }

  /* ---------- Small helpers ---------- */
  function fmtDur(hours, mins) {
    const t = Math.round((Number(hours) || 0) * 60 + (Number(mins) || 0));
    if (t <= 0) return '';
    if (t < 60) return t + ' min';
    const h = Math.floor(t / 60), m = t % 60;
    return m ? h + 'h ' + m + 'm' : h + 'h';
  }
  function fmtMin(t) {
    t = Math.round(t);
    if (t < 60) return t + ' min';
    const h = Math.floor(t / 60), m = t % 60;
    return m ? h + 'h ' + m + 'm' : h + 'h';
  }
  function lowerFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

  /* ---------- Data assembly ---------- */

  function findDiag(name) { return (global.DIAG || []).find(d => d.test === name) || null; }
  function findExercise(name) { return (global.EXERCISES || []).find(e => e.exercise === name) || null; }

  function statusOf(answer) {
    if (answer && answer.done === true) {
      if (answer.resultStatus === RESULT_WITHIN)  return 'within';
      if (answer.resultStatus === RESULT_FLAGGED) return 'flagged';
    }
    return 'suggested'; // not done, unanswered, or done with unclear result
  }

  function diagnosticsBlock(state) {
    const dx = state.diagnostics || {};
    const top = dx.topTests || [];
    const answers = dx.answers || {};
    const rows = top.map(t => {
      const name = t.test || t.name;
      const meta = findDiag(name) || {};
      const ans = answers[name] || {};
      let why;
      if (t.bySymptom && t.viaSymptoms && t.viaSymptoms.length) why = 'Linked to my ' + t.viaSymptoms.slice(0, 2).join(' & ').toLowerCase();
      else if (t.viaRiskGroup && t.riskGroupReason) why = t.riskGroupReason;
      else why = 'Baseline screening for my age and profile';
      return {
        name, status: statusOf(answers[name]), why,
        what: meta.note ? meta.note.replace(/\.$/, '') : '',
        prep: meta.prep && meta.prep !== 'None' ? meta.prep : '',
        note: ans.resultNote ? String(ans.resultNote).trim() : '',
        recency: ans.recency || ''
      };
    });
    const flagged = rows.filter(r => r.status === 'flagged');
    const within = rows.filter(r => r.status === 'within');
    const suggested = rows.filter(r => r.status === 'suggested');
    return {
      rows, flagged, within, suggested,
      asks: suggested.slice(0, 3),        // tests worth asking about, in the app's priority order
      alsoOnList: suggested.slice(3),
      hasData: rows.length > 0
    };
  }

  /* Activities -> a short read of the typical day + the active things the person actually does */
  const SIT_IDS = ['act_012', 'act_017', 'act_013', 'act_015', 'act_018'];   // TV/lying, idle sitting, passenger, desk work, reading
  const ACTIVE_CATS = ['Walking & Mobility', 'Mind & Body', 'Gym & Vigorous', 'Sports & Agility'];

  function routineBlock(state) {
    const routine = state.routine || {};
    const defs = global.ACTIVITIES || [];
    const acts = (routine.activities || []).map(a => {
      const d = defs.find(x => x.id === a.id);
      const mins = (Number(a.hours) || 0) * 60 + (Number(a.mins) || 0);
      return d && mins > 0 ? { id: a.id, name: d.name, cat: d.category, freq: a.freq, mins } : null;
    }).filter(Boolean);

    const daily = acts.filter(a => a.freq !== 'weekly');
    const sum = f => daily.filter(f).reduce((n, a) => n + a.mins, 0);
    const day = {
      sleep: sum(a => a.id === 'act_011'),
      sitting: sum(a => SIT_IDS.indexOf(a.id) >= 0),
      active: sum(a => ACTIVE_CATS.indexOf(a.cat) >= 0),
    };
    day.other = sum(() => true) - day.sleep - day.sitting - day.active;
    const dayParts = [];
    if (day.sleep)   dayParts.push('sleep ' + fmtMin(day.sleep));
    if (day.sitting) dayParts.push('sitting / desk / screen ' + fmtMin(day.sitting));
    if (day.other > 0) dayParts.push('chores, cooking, travel & other ' + fmtMin(day.other));
    if (day.active)  dayParts.push('active movement ' + fmtMin(day.active));

    // Active things done regularly (daily and weekly), longest first
    const activeList = acts.filter(a => ACTIVE_CATS.indexOf(a.cat) >= 0)
      .sort((a, b) => b.mins - a.mins)
      .map(a => a.name + ' ' + fmtMin(a.mins) + (a.freq === 'weekly' ? ' per session, weekly' : '/day'));

    const h = routine.habits || {};
    const habits = [];
    if (h.steps != null && !isNaN(Number(h.steps))) habits.push('~' + Number(h.steps).toLocaleString() + ' steps/day');
    if (h.sun != null && !isNaN(Number(h.sun)) && Number(h.sun) > 0) habits.push(Number(h.sun) + ' min daylight outdoors');
    if (h.postMealWalk === true) habits.push('walks after largest meal');

    const fromRoutine = routine.recommendedExercises;
    const list = (fromRoutine && fromRoutine.length) ? fromRoutine : ((state.exercises && state.exercises.topExercises) || []);
    const answers = (state.exercises && state.exercises.answers) || {};
    const items = list.slice(0, 3).map(ex => {
      const name = ex.exercise || ex;
      const meta = findExercise(name) || {};
      return {
        name,
        why: meta.note ? meta.note.replace(/\.$/, '') : (ex.bySymptom ? 'Matched to my symptoms' : 'Part of a baseline movement set'),
        intensity: ex.intensity || meta.intensity || '',
        practicing: !!(answers[name] && answers[name].practicing)
      };
    });
    const burn = Number(routine.estimatedCalories) || 0;
    let band = null;
    if (burn && global.KYHInsights && global.KYHInsights.activityBandFromBurn) band = global.KYHInsights.activityBandFromBurn(burn);
    return { items, burn, band, dayParts, activeList, habits, hasActivities: acts.length > 0 };
  }

  const MEET_LABEL = { yes: 'Meeting', partial: 'Partly', no: 'Not meeting' };
  const FREQ_ORDER = ['Daily', '3-5x/Wk', '1-2x/Wk', 'Rarely'];
  const FREQ_LABEL = { 'Daily': 'Daily', '3-5x/Wk': '3\u20135x/week', '1-2x/Wk': '1\u20132x/week', 'Rarely': 'Rarely' };

  function dietBlock(state) {
    const diet = state.diet || {};
    const routine = state.routine || {};
    const profile = state.profile || {};

    const pri = diet.priorities || [];
    const isLimit = p => p.direction === 'limit';
    const limitNames = {};
    pri.filter(isLimit).forEach(p => { limitNames[p.nutrient] = true; });
    (global.NUTRIENTS || []).forEach(n => { if (n.direction === 'limit') limitNames[n.nutrient] = true; });

    // Nutrients to build up: numbered, top 3
    const items = pri.filter(p => !isLimit(p)).slice(0, 3).map(p => ({
      name: 'Focus on ' + p.nutrient,
      why: p.note ? String(p.note).replace(/\.$/, '') : ''
    }));
    // Things to cut back on (e.g. added sugars / refined carbs): shown apart, with how well the person is limiting them
    const LIMIT_STATUS = { yes: 'I am keeping this limited', partial: 'I am partly keeping this limited', no: 'I am not keeping this limited' };
    const limits = pri.filter(isLimit).map(p => {
      const m = diet.intake && diet.intake[p.nutrient] && diet.intake[p.nutrient].meeting;
      return { name: p.nutrient, why: p.note ? String(p.note).replace(/\.$/, '') : '', status: LIMIT_STATUS[m] || '' };
    });

    const t = diet.target || {};
    const cal = t.cal != null ? parseInt(t.cal, 10) : null;
    const burn = Number(routine.estimatedCalories) || 0;

    const type = diet.type || profile.dietType || '';
    const cuisine = diet.cuisine || profile.cuisine || '';
    const pref = [type, cuisine ? cuisine + ' cuisine' : ''].filter(Boolean).join(' \u00b7 ');

    // Typical diet in nutrient terms: what the person says they are / aren't getting enough of
    const groups = { yes: [], partial: [], no: [] };
    Object.keys(diet.intake || {}).filter(n => !limitNames[n]).forEach(n => {
      const m = diet.intake[n] && diet.intake[n].meeting;
      if (groups[m]) groups[m].push(n);
    });
    const nutrientParts = ['no', 'partial', 'yes'].filter(k => groups[k].length)
      .map(k => MEET_LABEL[k] + ': ' + groups[k].join(', '));

    // Food pattern, grouped by how often
    const fq = global.FOOD_QUALITY || [];
    const freq = diet.frequency || {};
    const byFreq = {};
    fq.forEach(f => { const v = freq[f.id]; if (v) (byFreq[v] = byFreq[v] || []).push(lowerFirst(f.label)); });
    const patternParts = FREQ_ORDER.filter(k => byFreq[k]).map(k => FREQ_LABEL[k] + ': ' + byFreq[k].join(', '));

    return { items, limits, cal, burn, pref, nutrientParts, patternParts };
  }

  function aboutBlock(state) {
    const p = state.profile || {};
    const facts = [];
    facts.push(['Age / sex', (p.age ? p.age + ' yrs' : '\u2014') + ' \u00b7 ' + (p.sex || '\u2014')]);
    if (p.bmi != null && !isNaN(Number(p.bmi))) {
      let cls = '';
      try { cls = bmiTag(p.bmi, p)[0]; } catch (e) { /* ignore */ }
      facts.push(['BMI', (Math.round(Number(p.bmi) * 10) / 10) + (cls ? ' \u00b7 ' + cls : '')]);
    }
    if (p.whtr != null && !isNaN(Number(p.whtr))) {
      let cls = '';
      try { cls = whtrTag(Number(p.whtr))[0]; } catch (e) { /* ignore */ }
      facts.push(['Waist-to-height', (Math.round(Number(p.whtr) * 100) / 100) + (cls ? ' \u00b7 ' + cls : '')]);
    }
    if (p.smoking) facts.push(['Smoking', lifestyleLabel('smoking', p.smoking)]);
    if (p.alcohol) facts.push(['Alcohol', lifestyleLabel('alcohol', p.alcohol)]);
    const flags = [];
    if (p.pcos) flags.push('PCOS');
    const fam = [];
    if (p.famMetabolic) fam.push('metabolic');
    if (p.famCardio) fam.push('cardiac');
    if (fam.length) flags.push('Family history: ' + fam.join(', '));
    if (p.reproStatus && p.reproStatus !== 'Not applicable') flags.push(p.reproStatus);
    if (flags.length) facts.push(['Also noted', flags.join(', ')]);
    return { facts, symptoms: p.symptoms || [] };
  }

  /* ---------- Rendering ---------- */

  const STATUS_LABEL = { within: 'Within range', flagged: 'Flagged', suggested: 'Suggested' };

  function sectionHead(icon, title, sub) {
    return '<div class="db-sec-head"><div class="db-icon">' + icon + '</div>'
      + '<div><div class="db-sec-title">' + esc(title) + '</div>'
      + (sub ? '<div class="db-sec-sub">' + esc(sub) + '</div>' : '') + '</div></div>';
  }
  const subhead = (text) => '<div class="db-subh">' + esc(text) + '</div>';
  const kv = (label, value, cls) => value ? '<div class="db-kv' + (cls ? ' ' + cls : '') + '"><b>' + esc(label) + '</b> ' + esc(value) + '</div>' : '';

  function renderAbout(a) {
    return '<section class="db-sec db-about">' + sectionHead(ICON.person, 'About me', '')
      + '<dl class="db-facts">' + a.facts.map(f => '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>').join('') + '</dl></section>';
  }

  function renderSymptoms(a) {
    const body = a.symptoms.length
      ? '<div class="db-chips">' + a.symptoms.map(s => '<span class="db-chip">' + esc(s) + '</span>').join('') + '</div>'
      : '<p class="db-muted">No symptoms logged.</p>';
    return '<section class="db-sec db-symptoms">' + sectionHead(ICON.pulse, 'My symptoms', '') + body + '</section>';
  }

  /** Free-text past visits / hospitalisations. Blank ruled lines when empty so it can be filled in by hand. */
  function renderHistory() {
    const text = getHistory().trim();
    const body = text
      ? '<div class="db-hist-text">' + esc(text) + '</div>'
      : '<div class="db-lines"><i></i><i></i><i></i></div>';
    return '<section class="db-sec db-hist">' + sectionHead(ICON.notes, 'Past visits & medical history', 'In my own words \u2014 visits, hospital stays, medicines, allergies')
      + body + '</section>';
  }

  function renderTests(d) {
    if (!d.hasData) {
      return '<section class="db-sec">' + sectionHead(ICON.flask, 'Tests & results', '') + '<p class="db-muted">Diagnostics step not completed.</p></section>';
    }
    // One heading per test: name + status + timing, with the person's own note directly beneath it.
    const resultRow = r => '<div class="db-res"><div class="db-res-h"><b>' + esc(r.name) + '</b> '
      + '<span class="db-badge db-' + r.status + '">' + STATUS_LABEL[r.status] + '</span>'
      + (r.recency ? ' <span class="db-prep">' + esc(r.recency) + '</span>' : '') + '</div>'
      + (r.note ? '<div class="db-res-note">' + esc(r.note) + '</div>' : '') + '</div>';
    const withNote = d.flagged.concat(d.within.filter(r => r.note));
    const plainWithin = d.within.filter(r => !r.note);
    const resultsHtml = withNote.map(resultRow).join('')
      + (plainWithin.length ? '<div class="db-res db-res-plain"><b>Also within range:</b> ' + esc(plainWithin.map(r => r.name).join(', ')) + '</div>' : '');

    const asksHtml = d.asks.map((r, i) =>
      '<li class="db-item"><span class="db-num">' + (i + 1) + '</span><div class="db-item-body">'
      + '<div class="db-item-title">' + esc(r.name) + '</div>'
      + '<div class="db-item-meta db-wf">' + esc(r.why) + (r.what ? '. Checks: ' + esc(lowerFirst(r.what)) : '') + (r.prep ? ' <span class="db-prep">(' + esc(r.prep) + ')</span>' : '') + '</div>'
      + '</div></li>').join('')
      + '';
    const alsoHtml = d.alsoOnList.length ? '<div class="db-kv db-opt"><b>Also on my list:</b> ' + esc(d.alsoOnList.map(r => r.name).join(', ')) + '</div>' : '';

    const left = resultsHtml ? '<div>' + subhead('Results I\u2019ve already had') + resultsHtml + '</div>' : '';
    const right = asksHtml ? '<div>' + subhead('Would these tests be helpful for me?') + '<ol class="db-list">' + asksHtml + '</ol>' + alsoHtml + '</div>' : '';
    const cols = (left && right) ? ' db-cols-2' : '';
    return '<section class="db-sec">' + sectionHead(ICON.flask, 'Tests & results', 'Self-reported \u2014 please check against my reports')
      + '<div class="db-cols' + cols + '">' + (left || '') + (right || '') + (!left && !right ? '<p class="db-muted">Nothing to show.</p>' : '') + '</div></section>';
  }

  function renderRoutine(r) {
    const items = r.items.length ? r.items.map((it, i) =>
      '<li class="db-item"><span class="db-num">' + (i + 1) + '</span><div class="db-item-body">'
      + '<div class="db-item-title">' + esc(it.name) + (it.practicing ? ' <span class="db-badge db-within">Already doing</span>' : '') + '</div>'
      + '<div class="db-item-meta db-wl">' + esc(it.why) + (it.intensity ? ' \u00b7 ' + esc(it.intensity) + ' intensity' : '') + '</div>'
      + '</div></li>').join('')
      : '<li class="db-muted">Exercise step not completed.</li>';
    const tdee = r.burn
      ? '<div class="db-stat"><div class="db-stat-ic">' + ICON.bolt + '</div><div><div class="db-stat-val">~' + r.burn.toLocaleString() + ' kcal/day</div>'
        + '<div class="db-stat-lbl">Estimated daily energy use (TDEE)' + (r.band ? ' \u00b7 ' + esc(r.band.label) : '') + '</div></div></div>'
      : '';
    const summary = r.hasActivities
      ? kv('Typical day:', r.dayParts.join(' \u00b7 '))
        + kv('Regular activity:', r.activeList.length ? r.activeList.slice(0, 5).join('; ') + (r.activeList.length > 5 ? '; +' + (r.activeList.length - 5) + ' more' : '') : 'none logged beyond daily routine')
        + kv('Other:', r.habits.join(' \u00b7 '), 'db-opt')
      : '<p class="db-muted">Routine step not completed.</p>';
    return '<section class="db-sec">' + sectionHead(ICON.move, 'Physical activity', 'My usual routine, and exercises I\u2019m considering')
      + tdee + summary
      + subhead('Are these exercises suitable for me? Any precautions?') + '<ol class="db-list">' + items + '</ol></section>';
  }

  function renderDiet(d) {
    const items = d.items.length ? d.items.map((it, i) =>
      '<li class="db-item"><span class="db-num">' + (i + 1) + '</span><div class="db-item-body">'
      + '<div class="db-item-title">' + esc(it.name) + '</div>'
      + (it.why ? '<div class="db-item-meta db-wl">' + esc(it.why) + '</div>' : '')
      + '</div></li>').join('')
      : '<li class="db-muted">Diet step not completed.</li>';
    const target = d.cal
      ? '<div class="db-stat"><div class="db-stat-ic">' + ICON.bolt + '</div><div><div class="db-stat-val">~' + d.cal.toLocaleString() + ' kcal/day</div>'
        + '<div class="db-stat-lbl">Suggested intake to discuss' + (d.burn ? ' (estimated burn ~' + d.burn.toLocaleString() + ')' : '') + '</div></div></div>'
      : '';
    const limitHtml = d.limits.length ? '<div class="db-limit-wrap">' + d.limits.map(l =>
      '<div class="db-limit"><span class="db-badge db-cut">Cut back</span> <b>' + esc(l.name) + '</b>'
      + (l.status ? ' <span class="db-prep">\u2014 ' + esc(l.status) + '</span>' : '')
      + (l.why ? '<div class="db-item-meta db-wl">' + esc(l.why) + '</div>' : '') + '</div>').join('') + '</div>' : '';
    const summary = kv('Preference:', d.pref)
      + kv('Nutrients (self-assessed):', d.nutrientParts.join(' \u00b7 '))
      + kv('Food pattern:', d.patternParts.join(' \u00b7 '), 'db-opt');
    return '<section class="db-sec">' + sectionHead(ICON.leaf, 'Diet', 'My usual pattern, and changes I\u2019m considering')
      + target + summary
      + subhead('Would these changes be good for me? Can I do them?') + '<ol class="db-list">' + items + '</ol>' + limitHtml + '</section>';
  }

  /** Full sheet HTML. `level` is a space-separated list of: compact (drops test why/what), lean (drops exercise/diet descriptions), tight (smaller type, hides optional lines). */
  function renderDoctorBriefHtml(state, opts) {
    opts = opts || {};
    const about = aboutBlock(state), dx = diagnosticsBlock(state), rt = routineBlock(state), dt = dietBlock(state);
    const url = siteUrl();
    return '<div class="db-sheet' + (opts.level ? ' db-' + opts.level.split(' ').join(' db-') : '') + '">'
      + '<header class="db-head"><img class="db-logo" src="shared/assets/kyh_logo_final.png" alt="KYH">'
      + '<div class="db-head-mid"><div class="db-title">Doctor Brief</div><div class="db-tag">Prepared by me with KYH, a self-check tool \u2014 self-reported, not a diagnosis</div></div>'
      + '<div class="db-date"><span>Date</span>' + esc(fmtDate(new Date())) + '</div></header>'
      + '<div class="db-grid-2">' + renderAbout(about) + renderSymptoms(about) + '</div>'
      + renderHistory()
      + renderTests(dx)
      + '<div class="db-grid-2">' + renderRoutine(rt) + renderDiet(dt) + '</div>'
      + '<div class="db-foot"><span>KYH \u2014 Know Your Health. Prepared privately in my browser; use as a discussion aid, not medical advice.</span>'
      + (url ? '<a class="db-url" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + '</a>' : '') + '</div></div>';
  }

  /** Picks the least-trimmed layout that still fits one A4 page: full -> drop test why/what -> also drop exercise/diet descriptions -> smaller type. */
  function fitLevel(state) {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;left:-10000px;top:0;width:194mm;visibility:hidden;';
    document.body.appendChild(probe);
    let chosen = 'compact lean tight';
    for (const lvl of ['', 'compact', 'compact lean', 'compact lean tight']) {
      probe.innerHTML = renderDoctorBriefHtml(state, { level: lvl });
      const sheet = probe.querySelector('.db-sheet');
      if (sheet && sheet.scrollHeight <= sheet.clientHeight + 1) { chosen = lvl; break; }
    }
    probe.remove();
    return chosen;
  }

  /** Renders into a container, trimming the why/what text (then type size) only if one A4 page would overflow. */
  function mountDoctorBrief(container, state) {
    if (!container) return;
    container.innerHTML = renderDoctorBriefHtml(state, { level: fitLevel(state) });
  }

  const api = { renderDoctorBriefHtml, mountDoctorBrief, getHistory, setHistory, HISTORY_MAX, diagnosticsBlock, routineBlock, dietBlock, aboutBlock };
  global.KYHDoctorBrief = api;
})(typeof window !== 'undefined' ? window : this);
