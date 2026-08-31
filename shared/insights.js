/* ============================================================
   shared/insights.js
   KYH — turns session state into actionable insights.
   Every major user input should appear in at least one insight's
   `sources` array (or intentionally only as a constraint).

   Depends on: utils.js  (bmiTag, whtrTag, activeCategories, fmtNum)
   Optional:   data.diet.js not required at insight time
   ============================================================ */

const KYH_BRAND_BLURB =
    'I recently completed a health self-assessment through KYH (Know Your Health), ' +
    'an AI-first app that surfaces diagnostic tests, daily routine adjustments, and diet guidance ' +
    'based on my health profile, symptoms, and other inputs. Treat the following as self-reported findings, not a diagnosis.';

(function (global) {
  'use strict';

  /* ----- Same MET factors as routine.html recalculateLedger ----- */
  const MET = {
    sleep: 0.9,
    desk: 1.2,
    idle: 1.0,
    standing: 2.0,
    walking: 3.0,
    exercise: 6.0,
    yoga: 2.5,
    other: 1.5
  };

  /** Prefer recomputing from the 24-hour ledger; else stored TDEE. Weekly extras are ignored here. */
  function estimateDailyBurn(routine, weightKg) {
    if (!routine) return 0;

    const list = routine.activities || [];
    if (list.length && typeof estimateTdeeFromActivities === 'function') {
      return estimateTdeeFromActivities(list, weightKg || 70);
    }

    const stored = Number(routine.estimatedCalories);
    if (!isNaN(stored) && stored > 0) return Math.round(stored);
    return 0;
  }
  /**
   * Activity band used on diet.html when choosing DIET rows:
   *   estimatedCalories > 2400 → Active
   *   estimatedCalories < 1800 → Sedentary
   *   else → Moderate
   */
  function activityBandFromBurn(kcal) {
    if (kcal == null || isNaN(kcal)) return null;
    if (kcal > 2400) return { id: 'Active', label: 'higher than average (Active)', lo: 2401, hi: null };
    if (kcal < 1800) return { id: 'Sedentary', label: 'lower than average (Sedentary)', lo: null, hi: 1799 };
    return { id: 'Moderate', label: 'in a typical daily range (Moderate)', lo: 1800, hi: 2400 };
  }

  function insight(partial) {
    return Object.assign({
      id: '',
      domain: 'body',
      tone: 'watch', // good | watch | act
      title: '',
      detail: '',
      next: '',
      sources: [],
      priority: 50 // lower = show earlier within tone; act sorted by this
    }, partial);
  }

  function gapHours(actual, ideal) {
    if (actual == null || ideal == null || isNaN(actual) || isNaN(ideal)) return null;
    return actual - ideal;
  }

  /* ============================================================
     Domain builders
     ============================================================ */

  function insightsBody(profile) {
    const out = [];
    if (!profile || !profile.sex) return out;

    if (profile.bmi != null) {
      const [label] = bmiTag(profile.bmi, profile);
      const bmi = profile.bmi;
      const kind = bmiClass(bmi, profile);
      if (kind === 'under') {
        out.push(insight({
          id: 'bmi', domain: 'body', tone: 'act', priority: 20,
          title: 'Body mass is below the usual healthy range',
          detail: `BMI ${bmi.toFixed(1)} is classed as ${label}. Height and weight together point to underweight for most adults.`,
          next: 'Prioritise protein-rich meals and light strength work. If weight loss was unintentional, raise it with a clinician.',
          sources: ['heightCm', 'weightKg', 'bmi']
        }));
      } else if (kind === 'normal') {
        out.push(insight({
          id: 'bmi', domain: 'body', tone: 'good', priority: 40,
          title: 'Body mass is in a healthy range',
          detail: `BMI ${bmi.toFixed(1)} sits in the ${label}. That is a solid baseline for long-term metabolic health.`,
          next: 'Maintain with steady protein intake and some resistance work each week.',
          sources: ['heightCm', 'weightKg', 'bmi']
        }));
      } else if (kind === 'over') {
        out.push(insight({
          id: 'bmi', domain: 'body', tone: 'watch', priority: 25,
          title: 'Body mass is above the healthy range',
          detail: `BMI ${bmi.toFixed(1)} is in the ${label}. Small, sustained changes matter more than aggressive cuts.`,
          next: 'Favour a modest calorie gap, daily walking, and protein at meals. Pair this with waist-to-height below.',
          sources: ['heightCm', 'weightKg', 'bmi']
        }));
      } else {
        out.push(insight({
          id: 'bmi', domain: 'body', tone: 'act', priority: 15,
          title: 'Body mass is in a range that raises metabolic risk',
          detail: `BMI ${bmi.toFixed(1)} is classed as ${label}. This increases the value of screening and structured lifestyle support.`,
          next: 'Discuss metabolic labs and a realistic weight plan with a clinician; start with walking and protein-forward meals.',
          sources: ['heightCm', 'weightKg', 'bmi']
        }));
      }
    }

    const whtr = profile.whtr != null
      ? profile.whtr
      : (profile.waistCm && profile.heightCm ? profile.waistCm / profile.heightCm : null);
    if (whtr != null) {
      const [label] = whtrTag(whtr);
      if (whtr < 0.4) {
        out.push(insight({
          id: 'whtr', domain: 'body', tone: 'watch', priority: 35,
          title: 'Waist-to-height is on the low side',
          detail: `Ratio ${whtr.toFixed(2)} (${label}). Confirm this lines up with BMI and overall energy intake.`,
          next: 'If you feel well and BMI is stable, maintain. If under-eating or unintentional loss, address fuel intake.',
          sources: ['waistCm', 'heightCm', 'whtr']
        }));
      } else if (whtr < 0.5) {
        out.push(insight({
          id: 'whtr', domain: 'body', tone: 'good', priority: 40,
          title: 'Central body fat looks in a healthy band',
          detail: `Waist-to-height ${whtr.toFixed(2)} is in the ${label} (under 0.5 is the usual goal).`,
          next: 'Keep waist-friendly habits: daily movement and limiting sugary drinks and ultra-processed snacks.',
          sources: ['waistCm', 'heightCm', 'whtr']
        }));
      } else if (whtr < 0.6) {
        out.push(insight({
          id: 'whtr', domain: 'body', tone: 'watch', priority: 18,
          title: 'Central adiposity is elevated',
          detail: `Waist-to-height ${whtr.toFixed(2)} (${label}). Belly-carried fat can raise metabolic risk even when BMI looks acceptable.`,
          next: 'Add a 10–15 minute walk after your largest meal and trim sugary drinks; consider metabolic screening if not recent.',
          sources: ['waistCm', 'heightCm', 'whtr']
        }));
      } else {
        out.push(insight({
          id: 'whtr', domain: 'body', tone: 'act', priority: 12,
          title: 'Central adiposity is in a higher-risk range',
          detail: `Waist-to-height ${whtr.toFixed(2)} (${label}). This is one of the stronger lifestyle signals for metabolic and heart risk.`,
          next: 'Prioritise post-meal walks, sleep, and cutting sugary drinks. Ask your clinician about glucose and lipids.',
          sources: ['waistCm', 'heightCm', 'whtr']
        }));
      }
    }

    const smoke = normalizeLifestyle(profile.smoking);
    const drink = normalizeLifestyle(profile.alcohol);

    if (smoke === 'Never') {
      out.push(insight({
        id: 'smoking', domain: 'lifestyle', tone: 'good', priority: 55,
        title: 'No smoking reported',
        detail: 'Staying smoke-free is one of the highest-impact choices for heart and lung health.',
        next: 'Protect this — avoid second-hand smoke where you can.',
        sources: ['smoking']
      }));
    } else if (smoke === 'Former') {
      out.push(insight({
        id: 'smoking', domain: 'lifestyle', tone: 'watch', priority: 28,
        title: 'Past smoking still matters for heart screening',
        detail: 'You reported being a former smoker. Residual cardiovascular risk stays relevant even after quitting.',
        next: 'Keep smoke-free; mention this history when discussing lipids and blood pressure.',
        sources: ['smoking']
      }));
    } else if (isCurrentUse(smoke)) {
      out.push(insight({
        id: 'smoking', domain: 'lifestyle', tone: 'act', priority: 10,
        title: 'Smoking is raising cardiovascular risk',
        detail: `You reported smoking: ${lifestyleLabel('smoking', smoke)}. This stacks with age and family history when prioritising heart screening.`,
        next: 'Cutting down or quitting is higher leverage than almost any other single change — ask for support options.',
        sources: ['smoking']
      }));
    }

    if (drink === 'Never') {
      out.push(insight({
        id: 'alcohol', domain: 'lifestyle', tone: 'good', priority: 55,
        title: 'No alcohol reported',
        detail: 'Staying alcohol-free supports sleep quality, liver load, blood pressure, and calorie control.',
        next: 'Protect this — there is no need to add alcohol for “heart health” or social default.',
        sources: ['alcohol']
      }));
    } else if (drink === 'Former') {
      out.push(insight({
        id: 'alcohol', domain: 'lifestyle', tone: 'watch', priority: 40,
        title: 'Past alcohol use is noted',
        detail: 'You reported being a former drinker. Current intake is not adding load; history can still inform liver and sleep conversations.',
        next: 'Keep it off the table if that is working; mention past use if liver tests or sleep are on the agenda.',
        sources: ['alcohol']
      }));
    } else if (drink === 'Occasional' || drink === '1-2x/week') {
      out.push(insight({
        id: 'alcohol', domain: 'lifestyle', tone: 'good', priority: 60,
        title: 'Alcohol intake looks limited',
        detail: `Reported pattern: ${lifestyleLabel('alcohol', drink)}. Lower frequency is easier on sleep and recovery.`,
        next: 'Keep it occasional; avoid drinking close to bedtime if sleep is a goal.',
        sources: ['alcohol']
      }));
    } else if (isHeavyAlcohol(drink)) {
      out.push(insight({
        id: 'alcohol', domain: 'lifestyle', tone: 'watch', priority: 22,
        title: 'Alcohol frequency may be working against recovery',
        detail: `Reported pattern: ${lifestyleLabel('alcohol', drink)}. More frequent intake can blunt sleep quality, raise blood pressure, and add hidden calories.`,
        next: 'Try alcohol-free weeknights first; note energy and sleep after two weeks.',
        sources: ['alcohol']
      }));
    }

    if (profile.famMetabolic) {
      out.push(insight({
        id: 'fam-metabolic', domain: 'body', tone: 'act', priority: 16,
        title: 'Family history of metabolic conditions',
        detail: 'Diabetes or related conditions in immediate family raise the value of preventive screening even if you feel fine.',
        next: 'Mention this at your next visit and ask which glucose-related tests fit your age and profile.',
        sources: ['famMetabolic']
      }));
    }
    if (profile.famCardio) {
      out.push(insight({
        id: 'fam-cardio', domain: 'body', tone: 'act', priority: 16,
        title: 'Family history of heart disease or hypertension',
        detail: 'Immediate family history increases the payoff from blood pressure checks and lipid screening.',
        next: 'Bring this up with your clinician alongside any chest, breath, or blood-pressure symptoms.',
        sources: ['famCardio']
      }));
    }

    if (profile.sex === 'Female') {
      if (profile.pcos) {
        out.push(insight({
          id: 'pcos', domain: 'body', tone: 'watch', priority: 20,
          title: 'PCOS is part of your metabolic context',
          detail: 'PCOS often overlaps with insulin sensitivity, cycle health, and central weight patterns.',
          next: 'Favour strength work, protein, and steady meal timing; coordinate labs with your clinician.',
          sources: ['pcos', 'reproStatus']
        }));
      }
      if (profile.reproStatus === 'Perimenopausal' || profile.reproStatus === 'Post-menopausal') {
        out.push(insight({
          id: 'repro', domain: 'body', tone: 'watch', priority: 24,
          title: 'Menopause transition raises cardio-metabolic vigilance',
          detail: `Status: ${profile.reproStatus}. This stage often shifts fat distribution, sleep, and heart risk.`,
          next: 'Protect strength training and protein; discuss bone and heart screening cadence with your clinician.',
          sources: ['reproStatus']
        }));
      } else if (profile.reproStatus) {
        out.push(insight({
          id: 'repro', domain: 'body', tone: 'good', priority: 65,
          title: 'Reproductive status noted for tailored screening',
          detail: `Recorded as ${profile.reproStatus}. Recommendations stay aligned with female-specific pathways where relevant.`,
          next: 'Update this if your cycle or pregnancy status changes.',
          sources: ['reproStatus']
        }));
      }
    }

    if (profile.age != null && profile.age >= 40) {
      out.push(insight({
        id: 'age-40', domain: 'body', tone: 'watch', priority: 30,
        title: 'Age supports a proactive screening stance',
        detail: `At ${profile.age}, baseline cardiovascular and metabolic checks are more valuable even without symptoms.`,
        next: 'Use your diagnostics list as a conversation starter at the next visit.',
        sources: ['age', 'sex']
      }));
    }

    return out;
  }

  function insightsVitals(vitals, profile) {
    const out = [];
    if (!vitals) return out;

    if (vitals.fastingSugarUnknown) {
      out.push(insight({
        id: 'sugar-unknown', domain: 'vitals', tone: 'watch', priority: 28,
        title: 'Fasting sugar has not been recorded',
        detail: 'Without a recent fasting glucose, metabolic risk is inferred from body measures and family history only.',
        next: 'A simple fasting glucose (or HbA1c via clinician) is a high-value baseline test.',
        sources: ['fastingSugar', 'fastingSugarUnknown']
      }));
    } else if (vitals.fastingSugar != null) {
      const s = Number(vitals.fastingSugar);
      if (s >= 126) {
        out.push(insight({
          id: 'sugar-high', domain: 'vitals', tone: 'act', priority: 8,
          title: 'Fasting sugar is in a concerning range',
          detail: `${s} mg/dL on self-report is above common fasting thresholds used in screening.`,
          next: 'Confirm with a clinician promptly — do not rely on this app reading alone.',
          sources: ['fastingSugar']
        }));
      } else if (s >= 100) {
        out.push(insight({
          id: 'sugar-mid', domain: 'vitals', tone: 'watch', priority: 14,
          title: 'Fasting sugar is in a grey zone',
          detail: `${s} mg/dL may indicate impaired fasting glucose depending on lab context.`,
          next: 'Discuss confirmation testing and lifestyle levers (walking after meals, sleep, fewer sugary drinks).',
          sources: ['fastingSugar']
        }));
      } else if (s > 0) {
        out.push(insight({
          id: 'sugar-ok', domain: 'vitals', tone: 'good', priority: 45,
          title: 'Fasting sugar looks in a common healthy band',
          detail: `${s} mg/dL is below typical impaired-fasting thresholds (confirm with your lab’s range).`,
          next: 'Recheck on the cadence your clinician suggests, especially with family metabolic history.',
          sources: ['fastingSugar']
        }));
      }
    }

    if (vitals.restingHRUnknown) {
      out.push(insight({
        id: 'hr-unknown', domain: 'vitals', tone: 'watch', priority: 50,
        title: 'Resting heart rate not recorded',
        detail: 'Resting HR is a simple fitness and recovery signal you can capture at home.',
        next: 'Measure once after sitting quietly for 5 minutes, a few mornings in a row.',
        sources: ['restingHR', 'restingHRUnknown']
      }));
    } else if (vitals.restingHR != null) {
      const hr = Number(vitals.restingHR);
      if (hr >= 90) {
        out.push(insight({
          id: 'hr-high', domain: 'vitals', tone: 'watch', priority: 20,
          title: 'Resting heart rate is on the high side',
          detail: `${hr} bpm at rest can reflect low aerobic fitness, stress, caffeine, or insufficient sleep.`,
          next: 'Improve sleep consistency and easy daily walking; see a clinician if this is new or with symptoms.',
          sources: ['restingHR']
        }));
      } else if (hr > 0 && hr < 50) {
        out.push(insight({
          id: 'hr-low', domain: 'vitals', tone: 'watch', priority: 32,
          title: 'Resting heart rate is quite low',
          detail: `${hr} bpm can be normal in trained people, but warrants a check if you feel dizzy or unusually fatigued.`,
          next: 'Mention it at your next visit if symptomatic or if you are not highly trained.',
          sources: ['restingHR']
        }));
      } else if (hr > 0) {
        out.push(insight({
          id: 'hr-ok', domain: 'vitals', tone: 'good', priority: 50,
          title: 'Resting heart rate looks reasonable',
          detail: `${hr} bpm is within a common resting range for adults.`,
          next: 'Track it occasionally as fitness and sleep improve.',
          sources: ['restingHR']
        }));
      }
    }

    return out;
  }

  function insightsSymptoms(profile) {
    const out = [];
    const list = (profile && profile.symptoms) || [];
    if (!list.length) {
      out.push(insight({
        id: 'symptoms-none', domain: 'symptoms', tone: 'good', priority: 70,
        title: 'No current symptoms logged',
        detail: 'Recommendations lean on your risk profile, routine, and diet rather than acute complaints.',
        next: 'Add symptoms later if something new appears — the plan will retarget.',
        sources: ['symptoms']
      }));
      return out;
    }

    const clusters = {
      energy: ['Fatigue', 'Low Energy', 'Insomnia', 'Burnout', 'Restlessness'],
      metabolic: ['Obesity', 'Overweight', 'Diabetes', 'Sugar Cravings', 'Excessive Thirst'],
      gut: ['Bloating', 'Constipation', 'Indigestion', 'Acid Reflux', 'Irritable Bowel Syndrome'],
      pain: ['Back Pain', 'Neck Pain', 'Knee Pain', 'Shoulder Pain', 'Joint Stiffness', 'Leg Pain', 'Leg Cramps'],
      mood: ['Anxiety', 'Stress', 'Depression', 'Mood Swings', 'Irritability'],
      menopause: ['Menopause Symptoms', 'Hot Flashes', 'Night Sweats']
    };
    const hit = [];
    Object.keys(clusters).forEach(k => {
      const m = clusters[k].filter(s => list.includes(s));
      if (m.length) hit.push({ k, m });
    });

    const pattern = hit.length
      ? hit.map(h => h.k).join(', ')
      : 'mixed';
    const examples = list.slice(0, 6).join(', ') + (list.length > 6 ? '…' : '');

    out.push(insight({
      id: 'symptoms-pattern', domain: 'symptoms', tone: 'watch', priority: 19,
      title: 'Symptom pattern shapes your priorities',
      detail: `${list.length} symptom${list.length > 1 ? 's' : ''} logged; pattern leans toward ${pattern}. Examples: ${examples}.`,
      next: 'Use this pattern as context for diagnostics, movement, and nutrient focus — not as a self-diagnosis.',
      sources: ['symptoms']
    }));

    return out;
  }

  function insightsDiagnostics(diagnostics) {
    const out = [];
    const top = (diagnostics && diagnostics.topTests) || [];
    const answers = (diagnostics && diagnostics.answers) || {};
    if (!top.length) {
      out.push(insight({
        id: 'diag-none', domain: 'diagnostics', tone: 'watch', priority: 40,
        title: 'Diagnostics step not completed',
        detail: 'No prioritised test list is stored for this session.',
        next: 'Revisit Diagnostics if you want a symptom- and risk-matched shortlist.',
        sources: ['diagnostics']
      }));
      return out;
    }

    const bySym = top.filter(t => t.bySymptom).length;
    const onTrack = [];
    const belowTarget = [];

    top.forEach(t => {
      const name = t.test || t.name;
      const a = answers[name];
      if (a && a.done === true) onTrack.push(name);
      else belowTarget.push(name); // not done, unanswered, or explicit "no"
    });

    out.push(insight({
      id: 'diag-coverage', domain: 'diagnostics', tone: belowTarget.length ? 'watch' : 'good', priority: 14,
      title: 'Screening coverage from your prioritised list',
      detail: `${top.length} tests matched your profile${bySym ? ` (${bySym} symptom-linked)` : ''}. ` +
        `On track (self-reported done): ${onTrack.length ? onTrack.join(', ') : 'none'}. ` +
        `Still below target: ${belowTarget.length ? belowTarget.slice(0, 6).join(', ') + (belowTarget.length > 6 ? '…' : '') : 'none'}.`,
      next: belowTarget.length
        ? `Highest-value open items to discuss: ${belowTarget.slice(0, 5).join(', ')}.`
        : 'Keep results filed and recheck on the interval your clinician suggests.',
      sources: ['diagnostics.topTests', 'diagnostics.answers']
    }));

    if (belowTarget.length >= 4) {
      out.push(insight({
        id: 'diag-open', domain: 'diagnostics', tone: 'act', priority: 12,
        title: 'Several priority tests are still open',
        detail: `${belowTarget.length} of ${top.length} prioritised tests are not marked done yet.`,
        next: 'Take this shortlist to your next visit rather than ordering ad-hoc panels.',
        sources: ['diagnostics.answers']
      }));
    }

    return out;
  }

    /* Map activity ids → buckets for sleep / sitting / movement insights */
  const ACTIVITY_TO_BUCKET = {
    act_011: 'sleep',          // Sleeping
    act_012: 'idle',           // Watching TV / Lying Down
    act_017: 'idle',           // Sitting (Idle / Relaxing)
    act_013: 'idle',           // Passenger
    act_015: 'desk',           // Office Work
    act_018: 'desk',           // Reading / Studying
    act_022: 'standing',       // Standing desk
    act_014: 'other',          // Driving
    act_002: 'other',          // Cooking
    act_004: 'other',
    act_023: 'other',
    act_005: 'other',
    act_016: 'other',
    act_101: 'walking',
    act_026: 'walking',
    act_025: 'walking',
    act_102: 'walking',
    act_103: 'walking',
    act_501: 'walking',
    act_211: 'other',          // Meditation
    act_212: 'other',          // Social / Community (if you added it)
    act_203: 'yoga',
    act_208: 'yoga',
    act_210: 'yoga',
    act_209: 'yoga',
    act_412: 'exercise',
    act_206: 'exercise',
    act_401: 'exercise',
    act_405: 'exercise',
    act_403: 'exercise',
    act_406: 'exercise',
    act_404: 'exercise',
    act_207: 'exercise',
    act_301: 'exercise',
    act_303: 'exercise',
    act_311: 'exercise',
    act_305: 'exercise',
    act_307: 'exercise',
    act_314: 'exercise',
    act_309: 'exercise'
  };

  /** Daily hours by bucket from routine.activities (daily items only). */
  function hoursByBucket(activities) {
    const act = {
      sleep: 0, desk: 0, idle: 0, standing: 0,
      walking: 0, exercise: 0, yoga: 0, other: 0
    };
    if (!Array.isArray(activities)) return act;

    activities.forEach(sa => {
      if (sa.freq && sa.freq !== 'daily') return; // weekly extras don't fill the 24h ledger
      const hrs = (Number(sa.hours) || 0) + ((Number(sa.mins) || 0) / 60);
      if (hrs <= 0) return;
      const bucket = ACTIVITY_TO_BUCKET[sa.id] || 'other';
      act[bucket] += hrs;
    });
    return act;
  }

  function insightsRoutine(routine, profile) {
    const out = [];
    const habits = (routine && routine.habits) || {};
    const hasActivities = !!(routine && Array.isArray(routine.activities) && routine.activities.length);
    const hasBurn = routine && routine.estimatedCalories != null && !isNaN(Number(routine.estimatedCalories));
    const hasHabits =
      habits.steps != null ||
      habits.sun != null ||
      habits.dinner != null ||
      habits.postMealWalk === true ||
      habits.postMealWalk === false;

    if (!routine || (!hasActivities && !hasBurn && !hasHabits)) {
      out.push(insight({
        id: 'routine-none', domain: 'routine', tone: 'watch', priority: 42,
        title: 'Daily routine not logged',
        detail: 'Without logged activities or daily signals, burn and movement insights stay approximate.',
        next: 'Complete the Routine step to unlock sleep, sitting, burn, and habit insights.',
        sources: ['routine']
      }));
      return out;
    }

    // Hours derived from activities[] (daily items only)
    const act = hasActivities ? hoursByBucket(routine.activities) : {
      sleep: 0, desk: 0, idle: 0, standing: 0,
      walking: 0, exercise: 0, yoga: 0, other: 0
    };

    // ----- 1) Calorie burn -----
    const burn = estimateDailyBurn(routine, profile && profile.weightKg);
    const band = burn ? activityBandFromBurn(burn) : null;

    if (burn && band) {
      let tone = 'good';
      let title = 'Estimated daily burn is in a typical adult range';
      let next = 'Match food intake to hunger and your diet targets rather than chasing burn precisely.';
      if (band.id === 'Sedentary') {
        tone = 'watch';
        title = 'Estimated daily burn is on the low side';
        next = 'Add walking and light strength — small daily movement raises burn more sustainably than rare hard sessions.';
      } else if (band.id === 'Active') {
        tone = 'good';
        title = 'Estimated daily burn is higher than average';
        next = 'Fuel active days adequately; still limit sugary drinks if waist or metabolic risk is a concern.';
      }
      out.push(insight({
        id: 'calorie-burn', domain: 'routine', tone,
        priority: band.id === 'Sedentary' ? 10 : 16,
        title,
        detail:
          `From your activity log and body weight: ~${burn.toLocaleString()} kcal/day. ` +
          `Maps to the ${band.id} band used for diet targets (<1800 sedentary, 1800–2400 moderate, >2400 active).`,
        next,
        sources: ['routine.estimatedCalories', 'routine.activities', 'weightKg']
      }));
    }

    // ----- 2) Sleep / sitting / movement from activities -----
    if (hasActivities) {
      if (act.sleep > 0) {
        if (act.sleep < 6.5) {
          out.push(insight({
            id: 'sleep', domain: 'routine', tone: 'act', priority: 11,
            title: 'Sleep looks short',
            detail: `About ${act.sleep.toFixed(1)}h of sleep logged. Under ~7h is linked to hunger, glucose, and recovery issues for many adults.`,
            next: 'Protect a fixed wind-down and consistent wake time before adding harder workouts.',
            sources: ['routine.activities']
          }));
        } else if (act.sleep <= 9) {
          out.push(insight({
            id: 'sleep', domain: 'routine', tone: 'good', priority: 48,
            title: 'Sleep duration looks reasonable',
            detail: `${act.sleep.toFixed(1)}h logged — in a common adult target band.`,
            next: 'Keep the schedule steady, especially on weeknights.',
            sources: ['routine.activities']
          }));
        } else {
          out.push(insight({
            id: 'sleep-long', domain: 'routine', tone: 'watch', priority: 36,
            title: 'Sleep is on the long side',
            detail: `${act.sleep.toFixed(1)}h logged. Sometimes this is recovery; sometimes low mood or unrefreshing sleep.`,
            next: 'If daytime energy is still low, mention sleep quality to a clinician.',
            sources: ['routine.activities']
          }));
        }
      }

      const sit = act.desk + act.idle;
      if (sit >= 10) {
        out.push(insight({
          id: 'sitting', domain: 'routine', tone: 'watch', priority: 22,
          title: 'Sitting time is high',
          detail: `Desk + idle ≈ ${sit.toFixed(1)}h. Long sitting stacks with waist and glucose risk.`,
          next: 'Break up long blocks with 2–3 minute stands or short walks each hour.',
          sources: ['routine.activities']
        }));
      } else if (sit > 0) {
        out.push(insight({
          id: 'sitting-ok', domain: 'routine', tone: 'good', priority: 58,
          title: 'Sitting load looks manageable',
          detail: `Combined desk and idle time ~${sit.toFixed(1)}h.`,
          next: 'Keep movement snacks on heavy desk days.',
          sources: ['routine.activities']
        }));
      }

      const weeklyExtras = hasActivities
        ? (routine.activities || []).filter(sa => sa.freq && sa.freq !== 'daily')
        : [];
      const weeklyNames = weeklyExtras.map(sa => {
        const defs = (typeof window !== 'undefined' && window.ACTIVITIES) || [];
        const def = defs.find(a => a.id === sa.id);
        return def ? def.name : sa.id;
      });

      const move = act.exercise + act.yoga;
      if (move < 0.3 && !weeklyExtras.length) {
        out.push(insight({
          id: 'exercise-gap', domain: 'routine', tone: 'watch', priority: 19,
          title: 'Little structured movement logged',
          detail: `Exercise + yoga ≈ ${move.toFixed(1)}h in your daily activities, and no weekly extras noted.`,
          next: 'Start with two short sessions you can repeat weekly; use your personalised movement list.',
          sources: ['routine.activities']
        }));
      } else if (weeklyExtras.length && move < 0.3) {
        out.push(insight({
          id: 'exercise-weekly', domain: 'routine', tone: 'good', priority: 46,
          title: 'Structured movement is on your weekly list',
          detail: `Noted: ${weeklyNames.join(', ')}. These are not folded into daily calorie burn; they still count as practice you already have.`,
          next: 'Keep those sessions consistent; add a little daily walking on non-training days.',
          sources: ['routine.activities']
        }));
      } else {
        out.push(insight({
          id: 'exercise-ok', domain: 'routine', tone: 'good', priority: 46,
          title: 'Some structured movement is in your day',
          detail: `Exercise + yoga ≈ ${move.toFixed(1)}h.`,
          next: 'Bias one session toward strength if most of your time is pure cardio or yoga.',
          sources: ['routine.activities']
        }));
      }
    }

    // ----- 3) Habits (steps / sun / dinner / post-meal walk only) -----
    if (habits.steps != null) {
      if (habits.steps < 5000) {
        out.push(insight({
          id: 'steps-low', domain: 'routine', tone: 'act', priority: 21,
          title: 'Step count is low',
          detail: `${Number(habits.steps).toLocaleString()} steps/day is well under common 7–8k+ targets.`,
          next: 'Anchor one daily walk (even 15 minutes after a meal).',
          sources: ['routine.habits.steps']
        }));
      } else if (habits.steps < 8000) {
        out.push(insight({
          id: 'steps-mid', domain: 'routine', tone: 'watch', priority: 34,
          title: 'Steps are moderate — room to rise',
          detail: `${Number(habits.steps).toLocaleString()} steps/day. Nudging toward 8,000+ helps waist and glucose control.`,
          next: 'Add a short post-meal loop on the days you already move least.',
          sources: ['routine.habits.steps']
        }));
      } else {
        out.push(insight({
          id: 'steps-ok', domain: 'routine', tone: 'good', priority: 52,
          title: 'Daily steps look solid',
          detail: `${Number(habits.steps).toLocaleString()} steps/day supports the Active / Moderate side of your energy picture.`,
          next: 'Keep a floor on rest days so the average does not collapse.',
          sources: ['routine.habits.steps']
        }));
      }
    }

    if (habits.sun != null) {
      if (habits.sun < 15) {
        out.push(insight({
          id: 'sun', domain: 'routine', tone: 'watch', priority: 38,
          title: 'Daylight exposure is limited',
          detail: `${habits.sun} minutes of sunlight noted; outdoor light helps circadian rhythm and mood.`,
          next: 'Aim for a brief morning or lunchtime outdoor break most days.',
          sources: ['routine.habits.sun']
        }));
      } else {
        out.push(insight({
          id: 'sun-ok', domain: 'routine', tone: 'good', priority: 62,
          title: 'You are getting some daily daylight',
          detail: `About ${habits.sun} minutes of sunlight exposure logged.`,
          next: 'Keep it earlier in the day when possible.',
          sources: ['routine.habits.sun']
        }));
      }
    }

    if (habits.dinner != null) {
      if (habits.dinner < 1.5) {
        out.push(insight({
          id: 'dinner-gap', domain: 'routine', tone: 'watch', priority: 33,
          title: 'Dinner is close to bedtime',
          detail: `${habits.dinner}h between dinner and sleep can worsen reflux and sleep depth for some people.`,
          next: 'Shift the last large meal earlier by 30–60 minutes when you can.',
          sources: ['routine.habits.dinner']
        }));
      } else {
        out.push(insight({
          id: 'dinner-ok', domain: 'routine', tone: 'good', priority: 64,
          title: 'Dinner-to-sleep gap looks reasonable',
          detail: `${habits.dinner}h buffer before sleep.`,
          next: 'Keep heavy/spicy meals earlier on training days too.',
          sources: ['routine.habits.dinner']
        }));
      }
    }

    if (habits.postMealWalk === true) {
      out.push(insight({
        id: 'post-meal-walk', domain: 'routine', tone: 'good', priority: 47,
        title: 'Post-meal walking is already a habit',
        detail: 'A short walk after the largest meal is one of the highest-ROI glucose habits.',
        next: 'Keep it — especially on higher-carb evenings.',
        sources: ['routine.habits.postMealWalk']
      }));
    } else if (habits.postMealWalk === false) {
      out.push(insight({
        id: 'post-meal-walk-no', domain: 'routine', tone: 'watch', priority: 23,
        title: 'No regular post-meal walk yet',
        detail: 'Adding 10+ minutes after your largest meal improves post-meal glucose and digestion for many people.',
        next: 'Attach it to one meal you never skip.',
        sources: ['routine.habits.postMealWalk']
      }));
    }

    return out;
  }

  function insightsMovement(routine, exercises) {
    const out = [];
    const list = (routine && routine.recommendedExercises)
      || (exercises && exercises.topExercises) || [];
    if (!list.length) return out;

    const practicing = list.filter(ex =>
      ex.isPracticing === true ||
      (exercises && exercises.answers && exercises.answers[ex.exercise || ex]?.practicing)
    );
    const n = list.length;
    const k = practicing.length;

    if (k === 0) {
      out.push(insight({
        id: 'move-plan', domain: 'movement', tone: 'watch', priority: 29,
        title: 'You have a personalised movement list — not started yet',
        detail: `${n} recommended exercise${n > 1 ? 's' : ''} matched to symptoms and routine; none marked as practicing.`,
        next: 'Pick one or two low-equipment moves and schedule them on fixed days.',
        sources: ['routine.recommendedExercises', 'exercises']
      }));
    } else if (k < n) {
      out.push(insight({
        id: 'move-partial', domain: 'movement', tone: 'good', priority: 41,
        title: `You are already practicing ${k} of ${n} recommended moves`,
        detail: 'Building on movements you tolerate is better than overhauling everything.',
        next: 'Add one more from the list once the current ones feel automatic.',
        sources: ['routine.recommendedExercises', 'exercises.answers']
      }));
    } else {
      out.push(insight({
        id: 'move-all', domain: 'movement', tone: 'good', priority: 36,
        title: 'You are practicing your full recommended set',
        detail: `All ${n} listed movements marked as in use.`,
        next: 'Stay consistent; progress range or control before adding intensity.',
        sources: ['routine.recommendedExercises']
      }));
    }
    return out;
  }

  function insightsDiet(diet, routine, profile) {
    const out = [];
    profile = profile || {};
    // Dietary & cuisine preference now live on the Profile step, so they're
    // always known even if the user hasn't been through the Diet step yet.
    // Fall back to the profile value so we don't wrongly claim "not
    // completed" for the one part that's actually already captured.
    const effDiet = Object.assign({}, diet, {
      type: (diet && diet.type) || profile.dietType || null,
      cuisine: (diet && diet.cuisine) || profile.cuisine || null
    });
    diet = effDiet;
    // The deeper nutrient/calorie analysis genuinely does require the Diet
    // step (it needs the food-quality matrix + intake answers), so gate on
    // `target` (only set once that step is completed) rather than on
    // `type`, which is now available from Profile alone.
    if (!diet.target) {
      out.push(insight({
        id: 'diet-none', domain: 'diet', tone: 'watch', priority: 43,
        title: 'Diet preferences not completed',
        detail: diet.type
          ? `Preference on file: ${diet.type}${diet.cuisine ? ' · ' + diet.cuisine : ''}. Calorie target, macros, and nutrient priorities still need the Diet step.`
          : 'Calorie target, macros, and nutrient priorities need the Diet step.',
        next: 'Complete Diet to unlock energy and nutrient insights.',
        sources: ['diet', 'profile.dietType', 'profile.cuisine']
      }));
      return out;
    }

    const target = diet.target || {};
    const burn = routine && routine.estimatedCalories != null
      ? Number(routine.estimatedCalories)
      : null;
    const targetCal = target.cal != null ? parseInt(target.cal, 10) : null;

    // 1) Calorie target (lead)
    if (targetCal) {
      let detail = `Suggested intake about ${targetCal.toLocaleString()} kcal/day`;
      if (target.note) detail += ` — ${target.note}`;
      if (burn) {
        const diff = targetCal - burn;
        if (Math.abs(diff) <= 200) detail += `. Aligns with estimated burn (~${burn.toLocaleString()} kcal).`;
        else if (diff < 0) detail += `. About ${Math.abs(diff).toLocaleString()} kcal under estimated burn (~${burn.toLocaleString()}).`;
        else detail += `. About ${diff.toLocaleString()} kcal above estimated burn (~${burn.toLocaleString()}).`;
      }
      out.push(insight({
        id: 'cal-target', domain: 'diet', tone: 'watch', priority: 8,
        title: 'Calorie guide for your profile',
        detail,
        next: 'Treat this as a guide; adjust with hunger, energy, and clinician advice if you are on a medical diet.',
        sources: ['diet.target.cal', 'routine.estimatedCalories']
      }));
    }


    // 2) Top micro / nutrient priorities
    const priorities = diet.priorities || [];
    if (priorities.length) {
      const top = priorities.slice(0, 3);
      const names = top.map(p => p.nutrient);
      const limits = top.filter(p => p.direction === 'limit').map(p => p.nutrient);
      out.push(insight({
        id: 'nutrient-top', domain: 'diet', tone: 'act', priority: 7,
        title: 'Nutrient adjustments to prioritise',
        detail: `Highest ranked: ${names.join(', ')}.` +
          (limits.length ? ` Actively limit: ${limits.join(', ')}.` : '') +
          ` Ranking used symptoms, risk profile, and food-quality gaps.`,
        next: `For two weeks, focus mainly on ${names[0]} before spreading attention.`,
        sources: ['diet.priorities']
      }));
    }

    // 3) Harmful food quality only (problems)
    const freq = diet.frequency || {};
    if (freq.sugary_drinks === 'Daily' || freq.sugary_drinks === '3-5x/Wk') {
      out.push(insight({
        id: 'fq-sugary', domain: 'diet', tone: 'act', priority: 11,
        title: 'Sugary drinks are frequent',
        detail: `Marked “${freq.sugary_drinks}”. Fast lever for waist, triglycerides, and energy crashes.`,
        next: 'Replace the most frequent sugary drink with water, soda water, or unsweetened tea.',
        sources: ['diet.frequency.sugary_drinks']
      }));
    }
    if (freq.fried_ultraprocessed === 'Daily' || freq.fried_ultraprocessed === '3-5x/Wk') {
      out.push(insight({
        id: 'fq-upf', domain: 'diet', tone: 'act', priority: 11,
        title: 'Fried / ultra-processed foods are frequent',
        detail: `Marked “${freq.fried_ultraprocessed}”.`,
        next: 'Swap one default fried or packaged item per day for a home-cooked option.',
        sources: ['diet.frequency.fried_ultraprocessed']
      }));
    }
    ['fruits', 'leafy_greens', 'legumes', 'nuts_seeds'].forEach(id => {
      const labels = {
        fruits: 'Fruits', leafy_greens: 'Leafy greens',
        legumes: 'Legumes', nuts_seeds: 'Nuts & seeds'
      };
      const f = freq[id];
      if (f === 'Rarely' || f === '1-2x/Wk') {
        out.push(insight({
          id: 'fq-low-' + id, domain: 'diet', tone: f === 'Rarely' ? 'act' : 'watch', priority: 18,
          title: `${labels[id]} intake is infrequent`,
          detail: `Marked “${f}”.`,
          next: `Raise ${labels[id].toLowerCase()} toward several times per week with foods you already like.`,
          sources: ['diet.frequency.' + id]
        }));
      }
    });

    // 4) Thin sustains (max ~3)
    const sustains = [];
    if (freq.sugary_drinks === 'Rarely' && freq.fried_ultraprocessed === 'Rarely') {
      sustains.push(insight({
        id: 'fq-protect', domain: 'diet', tone: 'good', priority: 50,
        title: 'Sugary drinks and ultra-processed foods are rare',
        detail: 'Protective pattern for metabolic and calorie control.',
        next: 'Keep this boundary on busy days.',
        sources: ['diet.frequency']
      }));
    }
    const protectiveOk = ['fruits', 'leafy_greens', 'legumes', 'nuts_seeds'].filter(id =>
      freq[id] === 'Daily' || freq[id] === '3-5x/Wk'
    );
    if (protectiveOk.length >= 3) {
      sustains.push(insight({
        id: 'fq-protective-ok', domain: 'diet', tone: 'good', priority: 52,
        title: 'Core protective foods appear regularly',
        detail: 'Fruits, greens, legumes, and/or nuts are in a solid weekly rhythm.',
        next: 'Keep variety so the habit stays easy.',
        sources: ['diet.frequency']
      }));
    }
    sustains.push(insight({
      id: 'diet-pref', domain: 'diet', tone: 'good', priority: 55,
      title: 'Eating pattern constraints are clear',
      detail: `${diet.type}${diet.cuisine ? ' · ' + diet.cuisine : ''} — plans should respect this.`,
      next: 'Use cuisine-familiar foods when acting on nutrient priorities.',
      sources: ['diet.type', 'diet.cuisine']
    }));
    sustains.slice(0, 3).forEach(s => out.push(s));

    return out;
  }

  /* ============================================================
     Public API
     ============================================================ */

  function buildInsights(state) {
    state = state || {};
    const profile = state.profile || {};
    const list = []
      .concat(insightsBody(profile))
      .concat(insightsVitals(state.vitals, profile))
      .concat(insightsSymptoms(profile))
      .concat(insightsDiagnostics(state.diagnostics))
      .concat(insightsRoutine(state.routine, profile))
      .concat(insightsMovement(state.routine, state.exercises))
      .concat(insightsDiet(state.diet, state.routine, profile));

    const toneOrder = { act: 0, watch: 1, good: 2 };
    list.sort((a, b) => {
      const t = toneOrder[a.tone] - toneOrder[b.tone];
      if (t !== 0) return t;
      return (a.priority || 50) - (b.priority || 50);
    });
    return list;
  }

  function groupInsights(insights) {
    return {
      act: insights.filter(i => i.tone === 'act'),
      watch: insights.filter(i => i.tone === 'watch'),
      good: insights.filter(i => i.tone === 'good')
    };
  }

  /** Insight-first AI prompt (not a raw field dump). */
  function buildInsightAIPrompt(state, insights) {
    insights = insights || buildInsights(state);
    const g = groupInsights(insights);
    const p = (state && state.profile) || {};
    const diet = Object.assign({}, state && state.diet, {
      type: (state && state.diet && state.diet.type) || p.dietType || null,
      cuisine: (state && state.diet && state.diet.cuisine) || p.cuisine || null
    });
    const lines = [];

    lines.push(KYH_BRAND_BLURB);
    lines.push('');
    lines.push('Please prioritise a practical 30-day plan and what to discuss with a clinician.');
    lines.push('');
    lines.push(`Context: ${p.sex || '—'}, age ${p.age || '—'}. Diet preference: ${diet.type || '—'}${diet.cuisine ? ' (' + diet.cuisine + ')' : ''}.`);
    lines.push('');

    function section(title, arr) {
      if (!arr.length) return;
      lines.push(title);
      arr.forEach(i => {
        lines.push(`- ${i.title}: ${i.detail}`);
        if (i.next) lines.push(`  → Suggested next step: ${i.next}`);
      });
      lines.push('');
    }

    section('ACT ON NEXT', g.act);
    section('WATCH', g.watch);
    section('STRENGTHS TO PROTECT', g.good.slice(0, 8));

    lines.push('Please help me with:');
    lines.push('1. The 3–5 highest-leverage changes for the next 30 days');
    lines.push('2. How to prepare for a conversation with my doctor');
    lines.push('3. What not to over-optimise yet');
    lines.push('4. Any red flags I should not ignore');
    return lines.join('\n');
  }

  /** Doctor brief bullets from act + watch only. */
  function buildInsightDoctorPrep(insights) {
    insights = insights || [];
    const items = [];
    groupInsights(insights).act.concat(groupInsights(insights).watch).forEach(i => {
      items.push(`${i.title} — ${i.next || i.detail}`);
    });
    if (!items.length) {
      items.push('Bring your symptom list and any recent lab reports.');
      items.push('Ask which screening tests fit your age and risk profile.');
    }
    return items.slice(0, 12);
  }

  global.KYHInsights = {
    buildInsights,
    groupInsights,
    buildInsightAIPrompt,
    buildInsightDoctorPrep,
    estimateDailyBurn,
    activityBandFromBurn,
    MET
  };

  // Convenience globals for page scripts
  global.buildInsights = buildInsights;
  global.groupInsights = groupInsights;
  global.buildInsightAIPrompt = buildInsightAIPrompt;
  global.buildInsightDoctorPrep = buildInsightDoctorPrep;

})(typeof window !== 'undefined' ? window : globalThis);