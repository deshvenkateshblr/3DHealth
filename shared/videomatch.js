/* Learning-resource matching, shared by Summary and Next Steps.
   A video is matched to the person through window.VIDEO_TOPICS (shared/data.videotopics.js), which is built from
   tools/video_topic_rules.js and can be reviewed in tools/video_topics_audit.csv.  Only videos that match at least
   one of the person's symptoms or profile-derived tags are returned; nothing is padded with "popular" filler. */

/* Tags the app derives from the profile and answers (in addition to the symptoms the person picked). */
function deriveInterestTags(st) {
  const p = (st && st.profile) || {};
  const symptomTags = [...(p.symptoms || [])];
  const ctx = new Set();
  if (p.reproStatus === 'Perimenopausal' || p.reproStatus === 'Post-menopausal') ctx.add('Menopause');
  if (p.pcos) ctx.add('PCOS');
  const kind = (typeof bmiClass === 'function') ? bmiClass(p.bmi, p) : '';
  if (kind === 'over' || kind === 'obese') ctx.add('Weight Loss');
  if ((p.whtr || 0) >= 0.5) ctx.add('Belly Fat');
  if (p.famMetabolic) { ctx.add('Blood Sugar'); ctx.add('Insulin Resistance'); }
  const freq = (st && st.diet && st.diet.frequency) || {};
  if (freq.sugary_drinks === 'Daily' || freq.sugary_drinks === '3-5x/Wk') ctx.add('Sugar');
  if (freq.fried_ultraprocessed === 'Daily' || freq.fried_ultraprocessed === '3-5x/Wk') ctx.add('Ultra-Processed Foods');
  if (freq.leafy_greens === 'Rarely' || freq.fruits === 'Rarely') ctx.add('Healthy Eating');
  // Routine-based tags only when the person confirmed their typical week (not the pre-filled example).
  const r = st && st.routine;
  if (r && r.activitiesConfirmed !== false && Array.isArray(r.activities) && r.activities.length) {
    const byId = {}; (window.ACTIVITIES || []).forEach(a => { byId[a.id] = a; });
    const hrs = a => (Number(a.hours) || 0) + (Number(a.mins) || 0) / 60;
    const sl = r.activities.find(a => a.id === 'act_011');
    if (sl && hrs(sl) < 6.5) ctx.add('Sleep');
    const EX = new Set(['Sports & Agility', 'Gym & Vigorous', 'Walking & Mobility', 'Mind & Body']);
    const eh = r.activities.reduce((s, a) => { const d = byId[a.id]; return (d && EX.has(d.category)) ? s + hrs(a) : s; }, 0);
    if (eh < 0.5) ctx.add('Beginner Workout');
  }
  return { symptomTags, contextTags: [...ctx] };
}

function scoreVideo(v, symptomTags, contextTags) {
  const topics = (window.VIDEO_TOPICS && window.VIDEO_TOPICS[v.id]) || [];
  const strength = {}; topics.forEach(t => { strength[t[0]] = Math.max(strength[t[0]] || 0, t[1]); });
  let score = 0; const matched = [];
  (symptomTags || []).forEach(t => { const s = strength[t] || 0; if (s) { score += s * 3; matched.push(t); } });
  (contextTags || []).forEach(t => { const s = strength[t] || 0; if (s) { score += s; if (!matched.includes(t)) matched.push(t); } });
  return { score, matched };
}

function pickTopVideos(list, symptomTags, contextTags, n) {
  return (list || [])
    .map(v => { const r = scoreVideo(v, symptomTags, contextTags); return Object.assign({}, v, { _score: r.score, _matched: r.matched }); })
    .filter(v => v._score > 0)
    .sort((a, b) => b._score - a._score || (b.view_count || 0) - (a.view_count || 0))
    .slice(0, n);
}

/* To add a source: add its data file to the pages, add an entry here, and re-run tools/build_video_topics.js. */
const VIDEO_SOURCES = [
  { globalVar: 'SB_VIDEOS',      label: 'Saurabh Bothra · Habuild Yoga',           pfx: 'sb' },
  { globalVar: 'NBS_VIDEOS',     label: 'Nourished by Science · Mario Kratz, PhD', pfx: 'nbs' },
  { globalVar: 'DRSUMIT_VIDEOS', label: 'Dr Sumit Kapadia',                             pfx: 'drsk' },
  { globalVar: 'AYUSH_VIDEOS',   label: 'National Institute of Yoga',                   pfx: 'ayush' },
  { globalVar: 'CURATED_VIDEOS', label: 'Curated · KYH Picks',                     pfx: 'curated' }
];
