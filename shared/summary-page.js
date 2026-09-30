/* summary-page.js -- page logic for summary.html (moved out of the HTML so editors/formatters
   that reflow HTML cannot corrupt it). Depends on the shared/*.js files loaded before it. */
const state = loadState() || {};
const profile = state.profile || {};
renderHeader('great', "KYH \u2014 You're ready");
renderFooter();
const main = document.getElementById('main-content');
let cachedInsights = [];

const STEP_DEFS = [
  { id: 'about-you', title: 'About you', domains: ['body','lifestyle','symptoms','vitals'],
    icon: KYH_ICONS.aboutYou },
  { id: 'diagnostics', title: 'Diagnostics', domains: ['diagnostics'],
    icon: KYH_ICONS.diagnostics },
  { id: 'routine', title: 'Daily routine & movement', domains: ['routine','movement'],
    icon: KYH_ICONS.routine },
  { id: 'diet', title: 'Diet & nutrients', domains: ['diet'],
    icon: KYH_ICONS.diet }
];

const KYH_REPORT_HEADER = 'KYH \u2014 Know Your Health\nSelf-assessment findings (browser-only; not a medical diagnosis)\nKYH surfaces diagnostic tests, daily routine adjustments, and diet guidance from profile, symptoms, and other inputs.\n\n';

function insightCardHtml(i) {
  return '<div class="insight-card tone-' + esc(i.tone) + '">'
    + '<div class="insight-title">' + esc(i.title) + '</div>'
    + '<div class="insight-detail">' + esc(i.detail) + '</div>'
    + (i.next ? '<div class="insight-next"><b>What next</b>' + esc(i.next) + '</div>' : '')
    + '</div>';
}
function toneBucket(items) {
  return { act: items.filter(i => i.tone==='act'), watch: items.filter(i => i.tone==='watch'), good: items.filter(i => i.tone==='good') };
}
function toneGroupHtml(label, cls, items) {
  if (!items.length) return '';
  return '<div class="tone-group"><div class="tone-label ' + cls + '">' + label + '</div>' + items.map(insightCardHtml).join('') + '</div>';
}
const PROSE_STEPS = new Set(['about-you','diagnostics','routine','diet']);
function stepSummaryLine(step, items) {
  if (step.id==='about-you') return summarizeAboutYou(items);
  if (step.id==='diagnostics') return summarizeDiagnosticsSection(items);
  return summarizeSection(items);
}
function stepCardHtml(step, items, pfx) {
  const count = items.length;
  const detailsId = pfx + 'step-details-' + step.id;
  let headBody;
  if (!count) {
    headBody = '<div class="step-meta">No insights from this step yet</div>';
  } else if (PROSE_STEPS.has(step.id)) {
    const line = stepSummaryLine(step, items) || (count + ' insight' + (count>1?'s':'') + ' from this step.');
    headBody = '<div class="step-summary">' + esc(line) + '</div>';
  } else {
    const b = toneBucket(items);
    headBody = '<div class="step-meta">' + esc(b.act.length+' act \u00b7 '+b.watch.length+' watch \u00b7 '+b.good.length+' sustain') + '</div>';
  }
  const detailBody = count
    ? toneGroupHtml('Act','act',toneBucket(items).act) + toneGroupHtml('Watch','watch',toneBucket(items).watch) + toneGroupHtml('Sustain','good',toneBucket(items).good)
    : '<p class="step-empty">No insights from this step yet</p>';
  return '<div class="step-card" id="' + pfx + 'step-' + step.id + '">'
    + '<div class="step-card-head"><div class="step-icon" aria-hidden="true">' + step.icon + '</div>'
    + '<div style="flex:1;"><h2 class="step-title">' + esc(step.title) + '</h2>' + headBody + '</div></div>'
    + '<button type="button" class="step-toggle no-print" data-target="' + detailsId + '" aria-expanded="false">Show details &#8595;</button>'
    + '<div class="step-details" id="' + detailsId + '" hidden>' + detailBody + '</div></div>';
}
function insightsByStep(insights) {
  return STEP_DEFS.map(step => ({ step, items: insights.filter(i => step.domains.includes(i.domain)) }));
}

function formatAllFindingsText() {
  const p = profile;
  let t = KYH_REPORT_HEADER + (p.sex||'') + ' \u00b7 age ' + (p.age||'\u2014') + '\nGenerated ' + new Date().toLocaleString() + '\n\n';
  insightsByStep(cachedInsights).forEach(({step,items}) => {
    t += '=== ' + step.title.toUpperCase() + ' ===\n';
    if (!items.length) { t += '(No insights)\n\n'; return; }
    const b = toneBucket(items);
    [['ACT',b.act],['WATCH',b.watch],['SUSTAIN',b.good]].forEach(([label,list]) => {
      if (!list.length) return;
      t += '\n' + label + '\n';
      list.forEach((i,n) => { t += (n+1)+'. '+i.title+'\n '+i.detail+'\n'; if(i.next) t+=' \u2192 '+i.next+'\n'; });
    });
    t += '\n';
  });
  return t;
}

function fillPrintDocument() {
  const el = document.getElementById('print-document');
  const insEl = document.getElementById('insights');
  if (!el) return;
  let html = '<h1 style="font-family:Georgia,serif;font-weight:400;">KYH \u2014 Health findings</h1>'
    + '<p style="color:#555;font-size:13px;">' + esc(profile.sex||'') + ' \u00b7 age ' + esc(String(profile.age||'\u2014')) + '<br>' + esc(new Date().toLocaleString()) + '<br>Self-assessment \u2014 not a medical diagnosis</p>';
  insightsByStep(cachedInsights).forEach(({step,items}) => {
    html += '<h2>' + esc(step.title) + '</h2>';
    if (!items.length) { html += '<p style="color:#666;">No insights from this step.</p>'; return; }
    const b = toneBucket(items);
    [['Act',b.act],['Watch',b.watch],['Sustain',b.good]].forEach(([label,list]) => {
      if (!list.length) return;
      html += '<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#666;">' + label + '</h3>';
      list.forEach(i => {
        html += '<div style="margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #ddd;"><div style="font-weight:600;">' + esc(i.title) + '</div><div style="font-size:13px;margin-top:4px;">' + esc(i.detail) + '</div>' + (i.next?'<div style="font-size:13px;margin-top:4px;"><b>What next:</b> '+esc(i.next)+'</div>':'') + '</div>';
      });
    });
  });
  el.innerHTML = html;
  if (insEl) {
    insEl.innerHTML = '<div class="cat-title">Review your insights</div>' + insightsByStep(cachedInsights).map(({step,items}) => stepCardHtml(step,items,'print-')).join('');
  }
}
function downloadText(filename, text) {
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* --- Video helpers --- */
function deriveInterestTags(st) {
  const p = st.profile || {};
  const symptomTags = [...(p.symptoms||[])];
  const ctx = new Set();
  if (p.reproStatus==='Perimenopausal'||p.reproStatus==='Post-menopausal') ctx.add('Menopause');
  if (p.pcos) ctx.add('PCOS');
  const kind = bmiClass(p.bmi, p);
  if (kind==='over'||kind==='obese') ctx.add('Weight Loss');
  if ((p.whtr||0)>=0.5) ctx.add('Belly Fat');
  if (p.famMetabolic) { ctx.add('Blood Sugar'); ctx.add('Insulin Resistance'); }
  const freq = (st.diet&&st.diet.frequency)||{};
  if (freq.sugary_drinks==='Daily'||freq.sugary_drinks==='3-5x/Wk') ctx.add('Sugar');
  if (freq.fried_ultraprocessed==='Daily'||freq.fried_ultraprocessed==='3-5x/Wk') ctx.add('Ultra-Processed Foods');
  if (freq.leafy_greens==='Rarely'||freq.fruits==='Rarely') ctx.add('Healthy Eating');
  if (st.routine&&Array.isArray(st.routine.activities)&&st.routine.activities.length) {
    const aid = {}; (window.ACTIVITIES||[]).forEach(a => { aid[a.id]=a; });
    const toHrs = a => (Number(a.hours)||0)+(Number(a.mins)||0)/60;
    const sl = st.routine.activities.find(a => a.id==='act_011');
    if (sl && toHrs(sl)<6.5) ctx.add('Sleep');
    const ECATS = new Set(['Sports & Agility','Gym & Vigorous','Walking & Mobility','Mind & Body']);
    const eh = st.routine.activities.reduce((s,a) => { const d=aid[a.id]; return (d&&ECATS.has(d.category))?s+toHrs(a):s; }, 0);
    if (eh<0.5) ctx.add('Beginner Workout');
  }
  return { symptomTags, contextTags: [...ctx] };
}
function scoreVideo(v, symptomTags, contextTags) {
  const tl=(v.title||'').toLowerCase(), dl=(v.description_short||'').toLowerCase(), vl=(v.tags||[]).map(t=>t.toLowerCase());
  function str(t) { if(tl.includes(t)) return 3; if(vl.some(vt=>vt.includes(t)||t.includes(vt))) return 2; if(dl.includes(t)) return 1; return 0; }
  let score=0; const matched=[];
  symptomTags.forEach(t => { const s=str(t.toLowerCase()); if(s>0){score+=s*3;matched.push(t);} });
  contextTags.forEach(t => { const s=str(t.toLowerCase()); if(s>0){score+=s;if(!matched.includes(t))matched.push(t);} });
  return {score, matched};
}
function pickTopVideos(list, sT, cT, n) {
  return (list||[]).map(v => { const {score,matched}=scoreVideo(v,sT,cT); return Object.assign({},v,{_score:score,_matched:matched}); })
    .sort((a,b) => b._score-a._score||(b.view_count||0)-(a.view_count||0)).slice(0,n);
}
function fmtDur(sec) { if(!sec&&sec!==0) return ''; const m=Math.floor(sec/60),s=String(sec%60).padStart(2,'0'); return m+':'+s; }
function videoCardHtml(v) {
  const th = (v._matched&&v._matched.length) ? v._matched.slice(0,3).map(t=>'<span class="tag ok">'+esc(t)+'</span>').join('') : '<span class="tag">Popular</span>';
  return '<a class="video-card" href="'+esc(v.url)+'" target="_blank" rel="noopener">'
    + '<div class="video-thumb-wrap"><img src="'+esc(v.thumbnail)+'" alt="'+esc(v.title)+'" loading="lazy" onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/'+esc(v.id)+'/hqdefault.jpg\';">'
    + '<span class="video-duration">'+fmtDur(v.duration)+'</span></div>'
    + '<div class="video-title">'+esc(v.title)+'</div><div class="video-tags">'+th+'</div></a>';
}
function videoSourceBlockHtml(title, vids, pfx) {
  if (!vids.length) return '';
  const top=vids.slice(0,3), rest=vids.slice(3);
  return '<div class="video-source-title">'+title+'</div>'
    + '<div class="video-grid">'+top.map(videoCardHtml).join('')+'</div>'
    + (rest.length ? '<div class="video-grid" id="'+pfx+'-extra" style="display:none;margin-top:12px;">'+rest.map(videoCardHtml).join('')+'</div>'
      + '<button type="button" class="btn secondary" id="'+pfx+'-more-btn" data-count="'+rest.length+'" style="margin-bottom:16px;">Show '+rest.length+' more &#8595;</button>' : '');
}

/* --- Wire helpers --- */
function wireStepToggles() {
  document.querySelectorAll('.step-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = document.getElementById(btn.dataset.target); if(!t) return;
      const hidden = t.hasAttribute('hidden');
      if (hidden) { t.removeAttribute('hidden'); btn.textContent='Hide details \u2191'; btn.setAttribute('aria-expanded','true'); }
      else { t.setAttribute('hidden',''); btn.textContent='Show details \u2193'; btn.setAttribute('aria-expanded','false'); }
    });
  });
}
function wireExportActions() {
  const sv = document.getElementById('btn-save-findings');
  const pr = document.getElementById('btn-print-findings');
  if (sv) sv.addEventListener('click', () => { downloadText('KYH-findings-'+new Date().toISOString().slice(0,10)+'.txt', formatAllFindingsText()); });
  if (pr) pr.addEventListener('click', () => { fillPrintDocument(); window.print(); });
}
function wireVideoShowMore() {
  document.querySelectorAll('[id$="-more-btn"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pfx = btn.id.replace(/-more-btn$/, '');
      const ex = document.getElementById(pfx + '-extra');
      if (!ex) return;
      const showing = ex.style.display !== 'none';
      ex.style.display = showing ? 'none' : 'grid';
      btn.textContent = showing ? 'Show ' + btn.dataset.count + ' more \u2193' : 'Show fewer \u2191';
    });
  });
}
function wireAIPrompt(opts) {
  const sel = document.getElementById('ai-prompt-select');
  const disp = document.getElementById('ai-prompt-display');
  function render() { if(sel&&disp) disp.textContent = opts[sel.value]||''; }
  if (sel) { sel.addEventListener('change', render); render(); }
  const cp = document.getElementById('copy-prompt-btn');
  if (cp) cp.addEventListener('click', () => {
    const text = opts[sel?sel.value:'all']||'';
    navigator.clipboard.writeText(text).then(() => { cp.textContent='Copied \u2713'; setTimeout(()=>{ cp.textContent='Copy this prompt'; },2000); });
  });
}
function wireOutcomeCards() {
  const cards  = document.querySelectorAll('.outcome-card[data-panel]');
  const panels = document.querySelectorAll('.outcome-panel');
  function closeAll() {
    cards.forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-expanded','false'); });
    panels.forEach(p => p.classList.remove('is-open'));
  }
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const panel = document.getElementById(card.dataset.panel);
      if (!panel) return;
      const isOpen = panel.classList.contains('is-open');
      closeAll();
      if (!isOpen) {
        card.classList.add('is-active');
        card.setAttribute('aria-expanded','true');
        panel.classList.add('is-open');
        setTimeout(() => panel.scrollIntoView({behavior:'smooth',block:'nearest'}), 50);
      }
    });
  });
}

/* --- Your insights: running summary + AI guidance --- */
const RS_SECTIONS = [
  { id: 'diag', title: 'Diagnostics', sub: 'Includes profile, symptom and vitals signals',
    domains: ['diagnostics','vitals','body','lifestyle','symptoms'],
    icon: KYH_ICONS.rsDiagnostics },
  { id: 'routine', title: 'Daily routine', sub: 'Sleep, sitting, movement and exercise',
    domains: ['routine','movement'],
    icon: KYH_ICONS.rsRoutine },
  { id: 'diet', title: 'Diet', sub: 'Calories, nutrients and food patterns',
    domains: ['diet'],
    icon: KYH_ICONS.rsDiet }
];
const RS_MAX = 5;
// "Go back and fill this in" nudges are about the app, not the person's health -- they stay in the full detail, not the ranked summary.
const RS_SKIP = new Set(['diag-none','routine-none','routine-partial','move-intake-nudge','diet-none','diet-partial','diet-intake-nudge']);
function runningSummaryHtml(insights) {
  const body = RS_SECTIONS.map(sec => {
    // buildInsights already orders by tone (act, then watch) and priority.
    const items = insights.filter(i => sec.domains.includes(i.domain) && (i.tone === 'act' || i.tone === 'watch') && !RS_SKIP.has(i.id));
    const shown = items.slice(0, RS_MAX);
    let inner;
    if (!shown.length) {
      inner = '<p class="rs-empty">Nothing stands out here right now. The full detail below still lists what is going well.</p>';
    } else {
      inner = '<ol class="rs-list">' + shown.map((i, n) =>
        '<li class="rs-item"><span class="rs-num">' + (n + 1) + '</span><div>'
        + '<div class="rs-title">' + esc(i.title) + '<span class="rs-pri ' + (i.tone === 'act' ? 'high' : 'mid') + '">' + (i.tone === 'act' ? 'Higher priority' : 'Worth watching') + '</span></div>'
        + '<div class="rs-detail">' + esc(i.detail) + '</div>'
        + (i.next ? '<div class="rs-idea"><b>One option</b>' + esc(i.next) + '</div>' : '')
        + '</div></li>').join('') + '</ol>'
        + (items.length > RS_MAX ? '<p class="rs-more">+ ' + (items.length - RS_MAX) + ' more in the full detail below</p>' : '');
    }
    return '<div class="rs-section"><div class="rs-head"><div class="rs-ic" aria-hidden="true">' + sec.icon + '</div>'
      + '<div><h3>' + esc(sec.title) + '</h3><div class="rs-sub">' + esc(sec.sub) + '</div></div></div>' + inner + '</div>';
  }).join('');
  return '<p class="rs-intro">A running summary of what your answers point to, ordered within each area. These are observations to think about and discuss, not instructions.</p>' + body;
}
function aiGuideHtml() {
  return '<div class="ai-guide"><h3>Using the AI prompts</h3>'
    + '<p class="lede2">One way to go about it, if you decide to use an AI assistant alongside your doctor.</p>'
    + '<ol>'
    + '<li><b>Consider a private session first.</b> An incognito or private browser window, or the temporary / incognito chat option many assistants offer, typically keeps the conversation out of your regular history. Settings differ between tools, so it is worth checking how yours handles saved chats.</li>'
    + '<li><b>Pick the prompt closest to your question.</b> Diagnostics, movement and diet each have their own, or you can use the combined one (see <em>AI action prompt</em> above).</li>'
    + '<li><b>Keep identifying details out.</b> The prompts include age, sex, symptoms and findings, but no name or contact details. You may prefer to keep it that way when you add follow-up questions.</li>'
    + '<li><b>Treat answers as things to check.</b> Assistants can be wrong or overconfident. Anything that stands out is a good candidate to raise with your doctor rather than act on alone.</li>'
    + '<li><b>Bring the useful bits to your visit.</b> The one-page <em>Doctor brief</em> is a handy place to collect your questions.</li>'
    + '</ol></div>';
}

/* --- Doctor brief preview scaling + printing --- */
function fitBriefPreview() {
  const wrap = document.getElementById('db-preview-wrap');
  const scaler = document.getElementById('db-preview-scaler');
  const sheet = scaler && scaler.querySelector('.db-sheet');
  if (!wrap || !sheet) return;
  scaler.style.transform = 'none';
  const avail = wrap.clientWidth - 24;
  const natW = sheet.offsetWidth, natH = sheet.offsetHeight;
  if (!natW || avail <= 0) return;
  const k = Math.min(1, avail / natW);
  scaler.style.transform = 'scale(' + k + ')';
  scaler.style.width = natW + 'px';
  wrap.style.height = Math.ceil(natH * k + 24) + 'px';
}
function printDoctorBrief() {
  document.body.setAttribute('data-print', 'brief');
  const done = () => { document.body.removeAttribute('data-print'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}

/* --- Main render --- */
function render() {
  if (!profile.sex) {
    main.innerHTML = '<div class="empty-state">No profile found. <a href="profile.html">Start here \u2192</a></div>';
    return;
  }
  try { cachedInsights = typeof buildInsights==='function' ? (buildInsights(state)||[]) : []; }
  catch(e) { console.error(e); cachedInsights=[]; }

  fillPrintDocument();

  const byStep = insightsByStep(cachedInsights);
  const total  = cachedInsights.length;

  const aiPrompt = typeof buildInsightAIPrompt==='function' ? buildInsightAIPrompt(state,cachedInsights) : {full:'',header:'',sections:[]};
  const {symptomTags,contextTags} = deriveInterestTags(state);
  // ─── Video source registry ────────────────────────────────────────────────
  // To add a new source (e.g. AYUSH_VIDEOS), append one object here:
  //   { globalVar: 'AYUSH_VIDEOS', label: 'Ayush Channel Name', pfx: 'ayush-sum' }
  // No other code changes are needed.
  const VIDEO_SOURCES = [
    { globalVar: 'SB_VIDEOS',       label: 'Saurabh Bothra \u00b7 Habuild Yoga',          pfx: 'sb-sum'      },
    { globalVar: 'NBS_VIDEOS',      label: 'Nourished by Science \u00b7 Mario Kratz, PhD', pfx: 'nbs-sum'     },
    { globalVar: 'DRSUMIT_VIDEOS',  label: 'Dr Sumit Kapadia',                          pfx: 'drsk-sum'    },
    { globalVar: 'AYUSH_VIDEOS',    label: 'National Institute of Yoga',         pfx: 'ayush-sum'   },
    { globalVar: 'CURATED_VIDEOS',  label: 'Curated \u00b7 KYH Picks',                      pfx: 'curated-sum' },
  ];

  const pickedSources = VIDEO_SOURCES.map(src => ({
    ...src,
    vids: pickTopVideos(window[src.globalVar], symptomTags, contextTags, 9),
  }));

  const AI_OPTS = {all: aiPrompt.full};
  aiPrompt.sections.forEach(s => { AI_OPTS[s.key]=s.withContext; });

  const iconDoctor = KYH_ICONS.doctor;
  const iconAI     = KYH_ICONS.ai;
  const iconLearn  = KYH_ICONS.learn;
  const iconSnap   = KYH_ICONS.snap;
  const chevron    = '<span class="card-chevron">&#8964;</span>';
  const execSummary = total ? buildExecutiveSummary(state, cachedInsights) : '';

  const doctorPanel = '<p style="font-size:14px;margin:0 0 12px;">A one-page sheet to print and take with you. It lists questions to ask, not conclusions. Choose <b>A4</b> in the print dialog (or save as PDF).</p>'
    + '<div class="db-preview-wrap" id="db-preview-wrap"><div class="db-preview-scaler" id="db-preview-scaler"><div id="db-preview"></div></div></div>'
    + '<button type="button" class="btn" id="btn-print-brief" style="margin:0 0 4px;">Print doctor brief</button>';

  const aiPanel = '<p style="font-size:14px;margin:0 0 6px;">Four ready-to-copy prompts &mdash; pick the conversation you want to have.</p>'
    + '<p style="font-size:12.5px;color:var(--muted);margin:0 0 16px;">Tip: consider a private / incognito session first. More on this under <em>Your insights</em>.</p>'
    + '<div class="field" style="max-width:440px;margin-bottom:16px;"><label class="intake-label" for="ai-prompt-select">Choose a prompt</label>'
    + '<select id="ai-prompt-select"><option value="all">All three, with shared context</option>'
    + aiPrompt.sections.map(s=>'<option value="'+esc(s.key)+'">'+esc(s.label)+'</option>').join('')
    + '</select></div><div class="prompt-box" id="ai-prompt-display"></div>'
    + '<button type="button" class="btn" id="copy-prompt-btn" style="margin:0 0 4px;" aria-live="polite">Copy this prompt</button>';

  const learnPanel = pickedSources.some(s => s.vids.length)
    ? '<p style="font-size:14px;margin:0 0 4px;">Ranked by relevance to your symptoms and risk profile.</p>'
      + pickedSources.map(s => videoSourceBlockHtml(s.label, s.vids, s.pfx)).join('')
    : '<p class="lede" style="color:var(--muted);">Video library not loaded.</p>';

  const insightsPanel = runningSummaryHtml(cachedInsights) + aiGuideHtml()
    + '<div class="detail-divider">Full detail by step</div>'
    + byStep.map(({step,items}) => stepCardHtml(step,items,'panel-')).join('');

  main.innerHTML =
    '<div class="summary-hero no-print">'
    + '<h1>You took the first step toward <em>great</em>.</h1>'
    + '<p class="sub">Your private health picture is ready. Nothing left this browser.</p></div>'
    + (execSummary
      ? '<div class="note-block teal exec-summary no-print" style="margin-bottom:28px;">'+esc(execSummary)+'</div>'
      : '<p class="lede no-print" style="margin-bottom:28px;">Choose how you want to use what you built.</p>')
    + '<div class="outcome-grid action-grid no-print" style="margin-bottom:12px;">'
    + '<button class="outcome-card" data-panel="panel-doctor" aria-expanded="false"><div class="icon-lg">'+iconDoctor+'</div><div class="verb">Consult</div><h3>Doctor brief</h3><p>A printable one-page sheet of tests, exercises and diet questions for your visit.</p>'+chevron+'</button>'
    + '<button class="outcome-card" data-panel="panel-ai" aria-expanded="false"><div class="icon-lg">'+iconAI+'</div><div class="verb">Plan</div><h3>AI action prompt</h3><p>Copy an insight-based prompt into ChatGPT, Claude, or any assistant.</p>'+chevron+'</button>'
    + '<button class="outcome-card" data-panel="panel-learn" aria-expanded="false"><div class="icon-lg">'+iconLearn+'</div><div class="verb">Learn</div><h3>Learning resources</h3><p>Videos matched to your symptoms, routine, and diet signals.</p>'+chevron+'</button>'
    + '<button class="outcome-card" data-panel="panel-insights" aria-expanded="false"><div class="icon-lg">'+iconSnap+'</div><div class="verb">Review</div><h3>Your insights</h3><p>A prioritised summary of diagnostics, routine and diet, plus tips for using the AI prompts.</p>'+chevron+'</button>'
    + '</div>'
    + '<div class="outcome-panels no-print">'
    + '<div class="outcome-panel" id="panel-doctor"><div class="panel-inner">'+doctorPanel+'</div></div>'
    + '<div class="outcome-panel" id="panel-ai"><div class="panel-inner">'+aiPanel+'</div></div>'
    + '<div class="outcome-panel" id="panel-learn"><div class="panel-inner">'+learnPanel+'</div></div>'
    + '<div class="outcome-panel" id="panel-insights"><div class="panel-inner">'+insightsPanel+'</div></div>'
    + '</div>'
    + '<div class="note-block teal no-print" style="margin-bottom:28px;"><span class="k">Your data, your call</span> Your answers stay in this browser and are not uploaded anywhere. Saving or printing is optional and makes a copy that you control.</div>'
    + '<div class="page-footer-nav no-print"><a href="diet-synthesis.html" class="btn secondary">&larr; Back</a>'
    + '<div style="display:flex;flex-wrap:wrap;gap:10px;">'
    + '<button type="button" class="btn secondary" id="btn-save-findings">Save findings</button>'
    + '<button type="button" class="btn secondary" id="btn-print-findings">Print findings</button>'
    + '<a href="index.html" class="btn">Done</a></div></div>';

  wireOutcomeCards();
  wireAIPrompt(AI_OPTS);
  wireVideoShowMore();
  wireStepToggles();
  wireExportActions();

  if (window.KYHDoctorBrief) {
    KYHDoctorBrief.mountDoctorBrief(document.getElementById('db-preview'), state);
    KYHDoctorBrief.mountDoctorBrief(document.getElementById('db-print-root'), state);
  }
  const pb = document.getElementById('btn-print-brief');
  if (pb) pb.addEventListener('click', printDoctorBrief);
  fitBriefPreview();
  window.addEventListener('resize', fitBriefPreview);
  document.querySelectorAll('.outcome-card[data-panel="panel-doctor"]').forEach(c => c.addEventListener('click', () => setTimeout(fitBriefPreview, 60)));
}

render();
