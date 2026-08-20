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

  /** Recompute daily burn the same way routine does (hours × MET × weightKg). */
  function estimateDailyBurn(routine, weightKg) {
    const w = weightKg || 70;
    const act = (routine && routine.actual) || {};
    let daily = 0;
    Object.keys(MET).forEach(key => {
      const hrs = parseFloat(act[key]) || 0;
      daily += hrs * MET[key];
    });
    const habits = (routine && routine.habits) || {};
    const sportsDaily = (parseFloat(habits.sports) || 0) / 7;
    const strengthDaily = (parseFloat(habits.strength) || 0) / 7;
    daily += sportsDaily * 6.0 + strengthDaily * 5.0;
    return Math.round(daily * w);
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
      const [label] = bmiTag(profile.bmi);
      const bmi = profile.bmi;
      if (bmi < 18.5) {
        out.push(insight({
          id: 'bmi', domain: 'body', tone: 'act', priority: 20,
          title: 'Body mass is below the usual healthy range',
          detail: `BMI ${bmi.toFixed(1)} is classed as ${label}. Height and weight together point to underweight for most adults.`,
          next: 'Prioritise protein-rich meals and light strength work. If weight loss was unintentional, raise it with a clinician.',
          sources: ['heightCm', 'weightKg', 'bmi']
        }));
      } else if (bmi < 25) {
        out.push(insight({
          id: 'bmi', domain: 'body', tone: 'good', priority: 40,
          title: 'Body mass is in a healthy range',
          detail: `BMI ${bmi.toFixed(1)} sits in the ${label}. That is a solid baseline for long-term metabolic health.`,
          next: 'Maintain with steady protein intake and some resistance work each week.',
          sources: ['heightCm', 'weightKg', 'bmi']
        }));
      } else if (bmi < 30) {
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

    if (profile.smoking === 'Never') {
      out.push(insight({
        id: 'smoking', domain: 'lifestyle', tone: 'good', priority: 55,
        title: 'No smoking reported',
        detail: 'Staying smoke-free is one of the highest-impact choices for heart and lung health.',
        next: 'Protect this — avoid second-hand smoke where you can.',
        sources: ['smoking']
      }));
    } else if (profile.smoking === 'Occasionally' || profile.smoking === 'Daily') {
      out.push(insight({
        id: 'smoking', domain: 'lifestyle', tone: 'act', priority: 10,
        title: 'Smoking is raising cardiovascular risk',
        detail: `You reported smoking: ${profile.smoking}. This stacks with age and family history when prioritising heart screening.`,
        next: 'Cutting down or quitting is higher leverage than almost any other single change — ask for support options.',
        sources: ['smoking']
      }));
    }

    // Alcohol — values must match profile.html: Never | Occasional | 1-2x/week | 3-5x/week | Daily
    if (profile.alcohol === 'Never') {
      out.push(insight({
        id: 'alcohol', domain: 'lifestyle', tone: 'good', priority: 55,
        title: 'No alcohol reported',
        detail: 'Staying alcohol-free supports sleep quality, liver load, blood pressure, and calorie control.',
        next: 'Protect this — there is no need to add alcohol for “heart health” or social default.',
        sources: ['alcohol']
      }));
    } else if (profile.alcohol === 'Occasional' || profile.alcohol === '1-2x/week') {
      out.push(insight({
        id: 'alcohol', domain: 'lifestyle', tone: 'good', priority: 60,
        title: 'Alcohol intake looks limited',
        detail: `Reported pattern: ${profile.alcohol === 'Occasional' ? 'Occasional / social' : profile.alcohol}. Lower frequency is easier on sleep and recovery.`,
        next: 'Keep it occasional; avoid drinking close to bedtime if sleep is a goal.',
        sources: ['alcohol']
      }));
    } else if (profile.alcohol === '3-5x/week' || profile.alcohol === 'Daily') {
      out.push(insight({
        id: 'alcohol', domain: 'lifestyle', tone: 'watch', priority: 22,
        title: 'Alcohol frequency may be working against recovery',
        detail: `Reported pattern: ${profile.alcohol}. More frequent intake can blunt sleep quality, raise blood pressure, and add hidden calories.`,
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
      pain: ['Back Pain', 'Neck Pain', 'Knee Pain', 'Shoulder Pain', 'Joint Stiffness'],
      mood: ['Anxiety', 'Stress', 'Depression', 'Mood Swings', 'Irritability']
    };
    const hit = [];
    Object.keys(clusters).forEach(k => {
      const m = clusters[k].filter(s => list.includes(s));
      if (m.length) hit.push({ k, m });
    });

    out.push(insight({
      id: 'symptoms-overview', domain: 'symptoms', tone: 'watch', priority: 18,
      title: `You reported ${list.length} symptom${list.length > 1 ? 's' : ''}`,
      detail: hit.length
        ? `Patterns lean toward: ${hit.map(h => h.k).join(', ')}. Example signals: ${list.slice(0, 6).join(', ')}${list.length > 6 ? '…' : ''}.`
        : `Including: ${list.slice(0, 8).join(', ')}${list.length > 8 ? '…' : ''}.`,
      next: 'Use these as the spine of your doctor conversation and of the AI plan — not as a self-diagnosis.',
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
    const done = [];
    const notDone = [];
    const flagged = [];
    top.forEach(t => {
      const name = t.test || t.name;
      const a = answers[name];
      if (!a) { notDone.push(name); return; }
      if (a.done === true) {
        done.push(name);
        if (a.resultStatus && /attention|abnormal|high|low/i.test(a.resultStatus)) flagged.push(name);
      } else if (a.done === false) notDone.push(name);
      else notDone.push(name);
    });

    out.push(insight({
      id: 'diag-mix', domain: 'diagnostics', tone: bySym ? 'watch' : 'good', priority: 26,
      title: `${top.length} tests prioritised for you`,
      detail: `${bySym} driven by symptoms; ${top.length - bySym} from baseline risk. ${done.length} marked done; ${notDone.length} still open.`,
      next: notDone.length
        ? `Highest-value open items to discuss: ${notDone.slice(0, 4).join(', ')}.`
        : 'Keep results filed and recheck on the interval your clinician suggests.',
      sources: ['diagnostics.topTests', 'diagnostics.answers']
    }));

    if (flagged.length) {
      out.push(insight({
        id: 'diag-flagged', domain: 'diagnostics', tone: 'act', priority: 9,
        title: 'Some completed tests need follow-up attention',
        detail: `You flagged results on: ${flagged.join(', ')}.`,
        next: 'Bring reports to your clinician rather than interpreting them only from memory.',
        sources: ['diagnostics.answers']
      }));
    }

    return out;
  }

  function insightsRoutine(routine, profile) {
    const out = [];
    if (!routine || !routine.actual) {
      out.push(insight({
        id: 'routine-none', domain: 'routine', tone: 'watch', priority: 42,
        title: 'Daily routine not logged',
        detail: 'Without a 24-hour ledger, calorie burn and movement gaps are only approximate.',
        next: 'Complete the Routine step for sleep, sitting, and exercise insights.',
        sources: ['routine']
      }));
      return out;
    }

    const act = routine.actual || {};
    const idl = routine.ideal || {};
    const habits = routine.habits || {};

    // Sleep
    const sleepGap = gapHours(act.sleep, idl.sleep);
    if (sleepGap != null) {
      if (sleepGap <= -1) {
        out.push(insight({
          id: 'sleep', domain: 'routine', tone: 'act', priority: 11,
          title: 'Sleep is short of your ideal window',
          detail: `About ${act.sleep}h logged vs ${idl.sleep}h ideal (gap ${sleepGap.toFixed(1)}h). Short sleep affects hunger, glucose, and recovery.`,
          next: 'Protect a fixed wind-down and consistent wake time before adding harder workouts.',
          sources: ['routine.actual.sleep', 'routine.ideal.sleep']
        }));
      } else if (Math.abs(sleepGap) < 0.75) {
        out.push(insight({
          id: 'sleep', domain: 'routine', tone: 'good', priority: 48,
          title: 'Sleep is near your target',
          detail: `${act.sleep}h vs ideal ${idl.sleep}h — close enough to support recovery.`,
          next: 'Keep the schedule steady, especially on weeknights.',
          sources: ['routine.actual.sleep', 'routine.ideal.sleep']
        }));
      } else if (sleepGap >= 1.5) {
        out.push(insight({
          id: 'sleep-long', domain: 'routine', tone: 'watch', priority: 36,
          title: 'Sleep is longer than your ideal band',
          detail: `${act.sleep}h vs ideal ${idl.sleep}h. Sometimes this is recovery; sometimes low mood, sleep apnea, or illness.`,
          next: 'If daytime energy is still low, mention sleep quality (snoring, unrefreshing sleep) to a clinician.',
          sources: ['routine.actual.sleep', 'routine.ideal.sleep']
        }));
      }
    }

    // Desk + idle (bad to be high)
    const sit = (parseFloat(act.desk) || 0) + (parseFloat(act.idle) || 0);
    const sitIdl = (parseFloat(idl.desk) || 0) + (parseFloat(idl.idle) || 0);
    if (sit > 0) {
      if (sitIdl && sit > sitIdl + 1.5) {
        out.push(insight({
          id: 'sitting', domain: 'routine', tone: 'watch', priority: 22,
          title: 'Sitting time is high relative to your ideal day',
          detail: `Desk + idle ≈ ${sit.toFixed(1)}h vs ideal ≈ ${sitIdl.toFixed(1)}h. Long sitting stacks with waist and glucose risk.`,
          next: 'Break up long blocks with 2–3 minute stands or short walks each hour.',
          sources: ['routine.actual.desk', 'routine.actual.idle', 'routine.ideal.desk', 'routine.ideal.idle']
        }));
      } else if (sit <= sitIdl + 0.5) {
        out.push(insight({
          id: 'sitting-ok', domain: 'routine', tone: 'good', priority: 58,
          title: 'Sitting load is near your ideal',
          detail: `Combined desk and idle time (~${sit.toFixed(1)}h) aligns reasonably with your target day.`,
          next: 'Keep movement snacks on heavy desk days.',
          sources: ['routine.actual.desk', 'routine.actual.idle']
        }));
      }
    }

    // Exercise + yoga
    const move = (parseFloat(act.exercise) || 0) + (parseFloat(act.yoga) || 0);
    const moveIdl = (parseFloat(idl.exercise) || 0) + (parseFloat(idl.yoga) || 0);
    if (moveIdl > 0 && move + 0.25 < moveIdl) {
      out.push(insight({
        id: 'exercise-gap', domain: 'routine', tone: 'watch', priority: 19,
        title: 'Structured movement is under your ideal',
        detail: `Exercise + yoga ≈ ${move.toFixed(1)}h vs ideal ≈ ${moveIdl.toFixed(1)}h.`,
        next: 'Start with two short sessions you can repeat weekly; use your personalised movement list.',
        sources: ['routine.actual.exercise', 'routine.actual.yoga', 'routine.ideal.exercise', 'routine.ideal.yoga']
      }));
    } else if (moveIdl > 0 && move >= moveIdl - 0.25) {
      out.push(insight({
        id: 'exercise-ok', domain: 'routine', tone: 'good', priority: 46,
        title: 'Movement time is near target',
        detail: `You are close to your ideal exercise/yoga allotment (~${move.toFixed(1)}h).`,
        next: 'Bias one session toward strength if most of your time is pure cardio or yoga.',
        sources: ['routine.actual.exercise', 'routine.actual.yoga']
      }));
    }

    // --- Calorie burn vs profile activity bands (aligned with diet.html) ---
    const stored = routine.estimatedCalories;
    const recomputed = estimateDailyBurn(routine, profile && profile.weightKg);
    const burn = (stored != null && !isNaN(stored)) ? Number(stored) : recomputed;
    const band = activityBandFromBurn(burn);

    if (burn && band) {
      let tone = 'good';
      let title = 'Daily energy burn looks in a typical range';
      let next = 'Match food intake to hunger and your diet targets rather than chasing burn precisely.';
      if (band.id === 'Sedentary') {
        tone = 'watch';
        title = 'Estimated daily burn is on the low side for adults';
        next = 'Add walking and light strength — small NEAT increases raise burn more sustainably than sporadic hard sessions.';
      } else if (band.id === 'Active') {
        tone = 'good';
        title = 'Estimated daily burn is higher than average';
        next = 'Fuel training days adequately; still watch ultra-processed snacks if waist or sugar is a concern.';
      }
      out.push(insight({
        id: 'calorie-burn', domain: 'routine', tone, priority: band.id === 'Sedentary' ? 17 : 44,
        title,
        detail: `From your logged day (activity × body weight, same method as Routine): ~${burn.toLocaleString()} kcal. That maps to the **${band.id}** band used for diet targets (<1800 sedentary, 1800–2400 moderate, >2400 active) — ${band.label}.`,
        next,
        sources: [
          'routine.estimatedCalories',
          'routine.actual',
          'routine.habits.sports',
          'routine.habits.strength',
          'weightKg'
        ]
      }));
    }

    // Habits
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
          detail: `${Number(habits.steps).toLocaleString()} steps/day supports the “Active / Moderate” side of your energy picture.`,
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

    if ((habits.strength || 0) <= 0) {
      out.push(insight({
        id: 'strength', domain: 'routine', tone: 'watch', priority: 27,
        title: 'Little or no strength training logged',
        detail: 'Resistance work supports muscle, bone, and metabolic rate beyond steps alone.',
        next: 'Two short full-body sessions per week is enough to start.',
        sources: ['routine.habits.strength']
      }));
    } else {
      out.push(insight({
        id: 'strength-ok', domain: 'routine', tone: 'good', priority: 53,
        title: 'Strength work is part of your week',
        detail: `About ${habits.strength} h/week of strength training noted.`,
        next: 'Stay consistent; progressive overload beats random intensity.',
        sources: ['routine.habits.strength']
      }));
    }

    if ((habits.sports || 0) > 0) {
      out.push(insight({
        id: 'sports', domain: 'routine', tone: 'good', priority: 56,
        title: 'Sports add meaningful weekly burn',
        detail: `${habits.sports} h/week of sports — included in your estimated daily calories.`,
        next: 'Balance with recovery sleep after intense match days.',
        sources: ['routine.habits.sports']
      }));
    }

    if ((habits.social || 0) > 0) {
      out.push(insight({
        id: 'social', domain: 'routine', tone: 'good', priority: 68,
        title: 'Social time is present in your week',
        detail: `${habits.social} h/week of social or community time supports stress resilience.`,
        next: 'Protect a minimum even during busy work stretches.',
        sources: ['routine.habits.social']
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

  function insightsDiet(diet, routine) {
    const out = [];
    if (!diet || !diet.type) {
      out.push(insight({
        id: 'diet-none', domain: 'diet', tone: 'watch', priority: 43,
        title: 'Diet preferences not completed',
        detail: 'Food quality and nutrient priorities need the Diet step.',
        next: 'Complete Diet to unlock nutrient and food-pattern insights.',
        sources: ['diet']
      }));
      return out;
    }

    out.push(insight({
      id: 'diet-pref', domain: 'diet', tone: 'good', priority: 66,
      title: 'Eating pattern constraints are clear',
      detail: `${diet.type}${diet.cuisine ? ' · ' + diet.cuisine : ''} — plans should respect this, not fight it.`,
      next: 'Use cuisine-familiar foods when acting on nutrient priorities.',
      sources: ['diet.type', 'diet.cuisine']
    }));

    const freq = diet.frequency || {};
    const protective = [
      ['fruits', 'Fruits'],
      ['leafy_greens', 'Leafy greens'],
      ['legumes', 'Legumes'],
      ['nuts_seeds', 'Nuts & seeds']
    ];
    protective.forEach(([id, label]) => {
      const f = freq[id];
      if (!f) return;
      if (f === 'Rarely' || f === '1-2x/Wk') {
        out.push(insight({
          id: 'fq-' + id, domain: 'diet', tone: f === 'Rarely' ? 'act' : 'watch', priority: f === 'Rarely' ? 18 : 31,
          title: `${label} intake is infrequent`,
          detail: `Marked “${f}”. These foods support fibre, micronutrients, and satiety.`,
          next: id === 'leafy_greens'
            ? 'Add one leafy portion on most days (dal + sabzi, salad, or sautéed greens).'
            : `Raise ${label.toLowerCase()} toward several times per week with foods you already like.`,
          sources: ['diet.frequency.' + id]
        }));
      } else if (f === 'Daily' || f === '3-5x/Wk') {
        out.push(insight({
          id: 'fq-ok-' + id, domain: 'diet', tone: 'good', priority: 57,
          title: `${label} appear regularly`,
          detail: `Frequency: ${f}.`,
          next: 'Keep variety within this habit.',
          sources: ['diet.frequency.' + id]
        }));
      }
    });

    [['sugary_drinks', 'Sugary drinks'], ['fried_ultraprocessed', 'Fried / ultra-processed foods']].forEach(([id, label]) => {
      const f = freq[id];
      if (!f) return;
      if (f === 'Daily' || f === '3-5x/Wk') {
        out.push(insight({
          id: 'fq-harm-' + id, domain: 'diet', tone: 'act', priority: 13,
          title: `${label} are frequent`,
          detail: `Marked “${f}”. This is often the fastest lever for waist, triglycerides, and energy crashes.`,
          next: id === 'sugary_drinks'
            ? 'Swap the most frequent sugary drink for water, soda water, or unsweetened tea.'
            : 'Replace one ultra-processed or deep-fried default per day with a home-cooked option.',
          sources: ['diet.frequency.' + id]
        }));
      } else if (f === 'Rarely') {
        out.push(insight({
          id: 'fq-harm-ok-' + id, domain: 'diet', tone: 'good', priority: 54,
          title: `${label} are rare`,
          detail: `Frequency: ${f} — protective pattern.`,
          next: 'Maintain this boundary on busy days.',
          sources: ['diet.frequency.' + id]
        }));
      }
    });

    const priorities = diet.priorities || [];
    if (priorities.length) {
      const top = priorities.slice(0, 3);
      const names = top.map(p => p.nutrient);
      out.push(insight({
        id: 'nutrient-top', domain: 'diet', tone: 'watch', priority: 15,
        title: 'Nutrient focus should follow your top priorities',
        detail: `Highest ranked: ${names.join(', ')}. Ranking used symptoms, risk profile, and food-quality gaps.`,
        next: `Start with ${names[0]} only for two weeks before spreading attention.`,
        sources: ['diet.priorities']
      }));

      const intake = diet.intake || {};
      top.forEach(p => {
        const t = intake[p.nutrient];
        if (!t) return;
        if (t.tracking === 'no' || (t.tracking === 'yes' && (t.frequency === 'Rarely' || !t.frequency))) {
          out.push(insight({
            id: 'intake-' + p.nutrient, domain: 'diet', tone: 'watch', priority: 28,
            title: `Room to raise attention on ${p.nutrient}`,
            detail: t.tracking === 'no'
              ? 'You marked that you are not currently focusing on this nutrient.'
              : `Tracking yes but frequency: ${t.frequency || 'unspecified'}.`,
            next: 'Pick one food source you already eat and increase frequency slightly.',
            sources: ['diet.intake']
          }));
        } else if (t.tracking === 'yes' && (t.frequency === 'Daily' || t.frequency === 'Most days')) {
          out.push(insight({
            id: 'intake-ok-' + p.nutrient, domain: 'diet', tone: 'good', priority: 59,
            title: `${p.nutrient} is already in regular rotation`,
            detail: `Intake frequency: ${t.frequency}.`,
            next: 'Maintain; improve variety if meals feel repetitive.',
            sources: ['diet.intake']
          }));
        }
      });
    }

    // Target calories vs burn
    const burn = routine && routine.estimatedCalories != null
      ? Number(routine.estimatedCalories)
      : null;
    const targetCal = diet.target && diet.target.cal != null
      ? parseInt(diet.target.cal, 10)
      : null;
    if (burn && targetCal) {
      const diff = targetCal - burn;
      const band = activityBandFromBurn(burn);
      if (Math.abs(diff) <= 200) {
        out.push(insight({
          id: 'cal-align', domain: 'diet', tone: 'good', priority: 49,
          title: 'Calorie target aligns with estimated daily burn',
          detail: `Target ~${targetCal.toLocaleString()} kcal vs burn ~${burn.toLocaleString()} kcal (${band ? band.id : 'n/a'} activity band).`,
          next: 'Use portions and hunger rather than precise tracking unless a clinician advises otherwise.',
          sources: ['diet.target.cal', 'routine.estimatedCalories']
        }));
      } else if (diff < -200) {
        out.push(insight({
          id: 'cal-deficit', domain: 'diet', tone: 'watch', priority: 24,
          title: 'Diet target sits below estimated burn',
          detail: `Target ~${targetCal.toLocaleString()} kcal is about ${Math.abs(diff).toLocaleString()} kcal under estimated burn (~${burn.toLocaleString()}). That can support fat loss if sustainable.`,
          next: 'Ensure protein stays high and energy for daily life does not crash; adjust if fatigue worsens.',
          sources: ['diet.target.cal', 'routine.estimatedCalories']
        }));
      } else {
        out.push(insight({
          id: 'cal-surplus', domain: 'diet', tone: 'watch', priority: 24,
          title: 'Diet target sits above estimated burn',
          detail: `Target ~${targetCal.toLocaleString()} kcal vs burn ~${burn.toLocaleString()}. Useful if underweight or very active days were under-logged.`,
          next: 'If waist or weight is rising unintentionally, pull snacks and sugary drinks before cutting meals.',
          sources: ['diet.target.cal', 'routine.estimatedCalories']
        }));
      }
    } else if (targetCal) {
      out.push(insight({
        id: 'cal-target-only', domain: 'diet', tone: 'good', priority: 55,
        title: 'A calorie target is set for your profile',
        detail: `About ${targetCal.toLocaleString()} kcal/day${diet.target.note ? ' — ' + diet.target.note : ''}.`,
        next: 'Treat it as a guide; match your activity band as Routine stay up to date.',
        sources: ['diet.target']
      }));
    }

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
      .concat(insightsDiet(state.diet, state.routine));

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
    const diet = (state && state.diet) || {};
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