/* ============================================================
   shared/doctorbrief.js
   KYH -- printable one-page (A4) Doctor Brief.

   Builds a compact, question-led sheet a person can print and take
   to a clinic. It is a list of things to ASK, not advice:
     - Diagnostics : top 3 tests to discuss (why + what) + status roll-up
     - Routine     : top 3 recommended exercises as "is this OK for me?"
                     + estimated daily energy use (TDEE) for context
     - Diet        : top 3 diet changes as "is this good for me?"
                     + target intake calories

   Depends on: utils.js (esc, bmiClass, bmiTag, whtrTag, lifestyleLabel,
               activityBandFromBurn via KYHInsights)
   Optional data: window.DIAG, window.EXERCISES (for "what it checks" / "why")
   ============================================================ */
(function (global) {
  'use strict';

  /* Set this to the public address you want printed in the footer.
     If left empty, the current site address is used when the app is
     served over http(s). */
  const KYH_SITE_URL = '';

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
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>'
  };

  /* ---------- Data assembly ---------- */

  function findDiag(name) {
    return (global.DIAG || []).find(d => d.test === name) || null;
  }
  function findExercise(name) {
    return (global.EXERCISES || []).find(e => e.exercise === name) || null;
  }

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
      let why;
      if (t.bySymptom && t.viaSymptoms && t.viaSymptoms.length) why = 'Linked to your ' + t.viaSymptoms.slice(0, 2).join(' & ').toLowerCase();
      else if (t.viaRiskGroup && t.riskGroupReason) why = t.riskGroupReason;
      else why = 'Baseline screening for your age and profile';
      const ans = answers[name] || {};
      return {
        name, status: statusOf(answers[name]),
        note: ans.resultNote ? String(ans.resultNote).trim() : '',
        recency: ans.recency || '',
        why, what: meta.note ? meta.note.replace(/\.$/, '') : '',
        prep: meta.prep && meta.prep !== 'None' ? meta.prep : ''
      };
    });
    const roll = {
      within:    rows.filter(r => r.status === 'within'),
      flagged:   rows.filter(r => r.status === 'flagged'),
      suggested: rows.filter(r => r.status === 'suggested')
    };
    // Top 3 to discuss: flagged first, then not-yet-done, in the app's own priority order.
    const pool = roll.flagged.concat(roll.suggested);
    const topThree = (pool.length ? pool : rows).slice(0, 3);
    return { rows, roll, topThree, hasData: rows.length > 0 };
  }

  function routineBlock(state) {
    const routine = state.routine || {};
    const fromRoutine = routine.recommendedExercises;
    const list = (fromRoutine && fromRoutine.length) ? fromRoutine
      : ((state.exercises && state.exercises.topExercises) || []);
    const answers = (state.exercises && state.exercises.answers) || {};
    const items = list.slice(0, 3).map(ex => {
      const name = ex.exercise || ex;
      const meta = findExercise(name) || {};
      return {
        name,
        why: meta.note ? meta.note.replace(/\.$/, '') : (ex.bySymptom ? 'Matched to your symptoms' : 'Part of your baseline movement set'),
        intensity: ex.intensity || meta.intensity || '',
        practicing: !!(answers[name] && answers[name].practicing)
      };
    });
    const burn = Number(routine.estimatedCalories) || 0;
    let band = null;
    if (burn && global.KYHInsights && global.KYHInsights.activityBandFromBurn) band = global.KYHInsights.activityBandFromBurn(burn);
    return { items, burn, band };
  }

  function dietBlock(state) {
    const diet = state.diet || {};
    const routine = state.routine || {};
    const pri = (diet.priorities || []).slice(0, 3).map(p => {
      const limit = p.direction === 'limit';
      return {
        name: p.nutrient,
        limit,
        why: p.note ? String(p.note).replace(/\.$/, '') : '',
        q: limit
          ? 'Would cutting back on ' + p.nutrient + ' be good for me? Can I do this safely?'
          : 'Is focusing on ' + p.nutrient + ' good for me? What amount suits me?'
      };
    });
    const t = diet.target || {};
    const cal = t.cal != null ? parseInt(t.cal, 10) : null;
    const burn = Number(routine.estimatedCalories) || 0;
    return { items: pri, cal, burn, note: t.note || '', type: diet.type || (state.profile || {}).dietType || '' };
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

  function renderDiagnostics(d) {
    if (!d.hasData) {
      return '<section class="db-sec">' + sectionHead(ICON.flask, 'Tests to discuss', '') + '<p class="db-muted">Diagnostics step not completed.</p></section>';
    }
    const top = d.topThree.map((r, i) =>
      '<li class="db-item"><span class="db-num">' + (i + 1) + '</span><div class="db-item-body">'
      + '<div class="db-item-title">' + esc(r.name) + ' <span class="db-badge db-' + r.status + '">' + STATUS_LABEL[r.status] + '</span></div>'
      + '<div class="db-item-meta db-wf"><b>Why:</b> ' + esc(r.why) + (r.what ? '. <b>What it checks:</b> ' + esc(r.what) : '') + (r.prep ? ' <span class="db-prep">(' + esc(r.prep) + ')</span>' : '') + '</div>'
      + '</div></li>').join('');
    // Flagged results: show the person's own note exactly as typed, so the doctor gets context before the reports.
    const flaggedBlock = d.roll.flagged.length
      ? '<div class="db-flagbox"><div class="db-flagbox-h">Flagged results \u2014 my notes</div>'
        + d.roll.flagged.map(r => '<div class="db-flag-row"><b>' + esc(r.name) + '</b>'
          + (r.recency ? ' <span class="db-prep">(' + esc(r.recency) + ')</span>' : '')
          + ': ' + (r.note ? '<span class="db-note">' + esc(r.note) + '</span>' : '<span class="db-prep">no note added</span>') + '</div>').join('')
        + '</div>'
      : '';
    const listOf = (key) => d.roll[key].length
      ? d.roll[key].map(r => key === 'within' && r.note ? r.name + ' (' + r.note + ')' : r.name).join(', ')
      : '\u2014';
    const col = (key, label) => '<div class="db-roll db-roll-' + key + '"><div class="db-roll-h"><span class="db-roll-n">' + d.roll[key].length + '</span> ' + label + '</div>'
      + '<div class="db-roll-list">' + esc(listOf(key)) + '</div></div>';
    return '<section class="db-sec">' + sectionHead(ICON.flask, 'Tests to discuss', 'Top 3 from my prioritised list of ' + d.rows.length)
      + '<ol class="db-list">' + top + '</ol>'
      + flaggedBlock
      + '<div class="db-rolls">' + col('within', 'Within range') + col('flagged', 'Flagged') + col('suggested', 'Suggested / not done') + '</div></section>';
  }

  function renderRoutine(r) {
    const items = r.items.length ? r.items.map((it, i) =>
      '<li class="db-item"><span class="db-num">' + (i + 1) + '</span><div class="db-item-body">'
      + '<div class="db-item-title">' + esc(it.name) + (it.practicing ? ' <span class="db-badge db-within">Already doing</span>' : '') + '</div>'
      + '<div class="db-item-q">Is this appropriate and beneficial for me? Any precautions?</div>'
      + '<div class="db-item-meta">' + esc(it.why) + (it.intensity ? ' \u00b7 ' + esc(it.intensity) + ' intensity' : '') + '</div>'
      + '</div></li>').join('')
      : '<li class="db-muted">Exercise step not completed.</li>';
    const tdee = r.burn
      ? '<div class="db-stat"><div class="db-stat-ic">' + ICON.bolt + '</div><div><div class="db-stat-val">~' + r.burn.toLocaleString() + ' kcal/day</div>'
        + '<div class="db-stat-lbl">Estimated daily energy use (TDEE)' + (r.band ? ' \u00b7 ' + esc(r.band.label) : '') + '</div></div></div>'
      : '';
    return '<section class="db-sec">' + sectionHead(ICON.move, 'Movement to ask about', 'Top 3 recommended exercises') + tdee + '<ol class="db-list">' + items + '</ol></section>';
  }

  function renderDiet(d) {
    const items = d.items.length ? d.items.map((it, i) =>
      '<li class="db-item"><span class="db-num">' + (i + 1) + '</span><div class="db-item-body">'
      + '<div class="db-item-title">' + esc(it.name) + '</div>'
      + '<div class="db-item-q">' + esc(it.q) + '</div>'
      + (it.why ? '<div class="db-item-meta">' + esc(it.why) + '</div>' : '')
      + '</div></li>').join('')
      : '<li class="db-muted">Diet step not completed.</li>';
    const target = d.cal
      ? '<div class="db-stat"><div class="db-stat-ic">' + ICON.bolt + '</div><div><div class="db-stat-val">~' + d.cal.toLocaleString() + ' kcal/day</div>'
        + '<div class="db-stat-lbl">Suggested intake to discuss' + (d.burn ? ' (estimated burn ~' + d.burn.toLocaleString() + ')' : '') + '</div></div></div>'
      : '';
    return '<section class="db-sec">' + sectionHead(ICON.leaf, 'Diet changes to ask about', 'Top 3' + (d.type ? ' \u00b7 ' + d.type : '')) + target + '<ol class="db-list">' + items + '</ol></section>';
  }

  /** Full sheet HTML. `compact` hides the why/what text on tests & extra meta (space fallback). */
  function renderDoctorBriefHtml(state, opts) {
    opts = opts || {};
    const about = aboutBlock(state), dx = diagnosticsBlock(state), rt = routineBlock(state), dt = dietBlock(state);
    const url = siteUrl();
    return '<div class="db-sheet' + (opts.level ? ' db-' + opts.level.split(' ').join(' db-') : '') + '">'
      + '<header class="db-head"><img class="db-logo" src="shared/assets/kyh_logo_final.png" alt="KYH">'
      + '<div class="db-head-mid"><div class="db-title">Doctor Brief</div><div class="db-tag">Questions I\u2019d like to discuss \u2014 self-reported, not a diagnosis</div></div>'
      + '<div class="db-date"><span>Date</span>' + esc(fmtDate(new Date())) + '</div></header>'
      + '<div class="db-grid-2">' + renderAbout(about) + renderSymptoms(about) + '</div>'
      + renderDiagnostics(dx)
      + '<div class="db-grid-2">' + renderRoutine(rt) + renderDiet(dt) + '</div>'
      + '<div class="db-foot"><span>KYH \u2014 Know Your Health. Prepared privately in my browser; use as a discussion aid, not medical advice.</span>'
      + (url ? '<span class="db-url">' + esc(url) + '</span>' : '') + '</div></div>';
  }

  /** Picks the least-trimmed layout that still fits one A4 page: '' -> 'compact' -> 'compact tight'. */
  function fitLevel(state) {
    const probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;left:-10000px;top:0;width:194mm;visibility:hidden;';
    document.body.appendChild(probe);
    let chosen = 'compact tight';
    for (const lvl of ['', 'compact', 'compact tight']) {
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

  const api = { renderDoctorBriefHtml, mountDoctorBrief, diagnosticsBlock, routineBlock, dietBlock, aboutBlock };
  global.KYHDoctorBrief = api;
})(typeof window !== 'undefined' ? window : this);
