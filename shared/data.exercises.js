// shared/data.exercises.js

window.EXERCISES = [
  // --- MUSCULOSKELETAL & POSTURE ---
  {
    "exercise": "Cat-Cow Stretch (Marjaryasana)",
    "profile": "Mobility & Rehab",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Gently mobilises the spine, relieves desk tension, and improves posture.",
    "symptoms": ["Back Pain", "Neck Pain", "Poor Posture", "Slouching", "Joint Stiffness"],
    "contraindications": ["Carpal Tunnel", "Sports Injury", "Recent Surgery / Injury"],
    "videoTag": "cat_cow_demo"
  },
  {
    "exercise": "Wall Push-Ups",
    "profile": "Foundational Strength",
    "gender": "All",
    "age": "All", 
    "intensity": "Moderate",
    "equipment": "Wall",
    "note": "Builds upper body strength with very low stress on joints.",
    "symptoms": ["Muscle Weakness", "Fatigue", "Poor Posture", "Weak Core"],
    "contraindications": ["Frozen Shoulder", "Shoulder Pain", "Carpal Tunnel"],
    "videoTag": "wall_pushup"
  },
  {
    "exercise": "Glute Bridges",
    "profile": "Core & Lower Body",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "None",
    "note": "Activates the posterior chain to counteract prolonged sitting and support the knees.",
    "symptoms": ["Back Pain", "Knee Pain", "Hip Pain", "Weak Core", "Sciatica"],
    "contraindications": ["Pregnancy Discomfort", "Recent Surgery / Injury"],
    "videoTag": "glute_bridge"
  },
  {
    "exercise": "Towel Scrunches / Calf Stretches",
    "profile": "Foot & Ankle Rehab",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Towel",
    "note": "Strengthens the arch of the foot and stretches the Achilles tendon.",
    "symptoms": ["Plantar Fasciitis", "Leg Pain", "Leg Cramps", "Balance Issues", "Foot Pain", "Toe Pain"],
    "contraindications": ["Sprain", "Strain", "Recent Surgery / Injury"],
    "videoTag": "towel_scrunch"
  },

  // --- ENERGY, SLEEP, HEAD & NEUROLOGICAL ---
  {
    "exercise": "Box Breathing (Sama Vritti)",
    "profile": "Breathwork & Nervous System",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "A 4-4-4-4 breathing technique to down-regulate the nervous system and lower cortisol.",
    "symptoms": ["Insomnia", "Stress", "Anxiety", "Brain Fog", "High Blood Pressure", "Heart Palpitations"],
    "contraindications": ["Shortness of Breath", "Asthma"], // Holding breath can trigger asthma anxiety
    "videoTag": "box_breathing"
  },
  {
    "exercise": "Legs Up the Wall (Viparita Karani)",
    "profile": "Restorative Yoga",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Wall",
    "note": "Improves venous return, calms the nervous system, and relieves swollen ankles.",
    "symptoms": ["Insomnia", "Poor Circulation", "Edema", "Swelling", "Varicose Veins", "Fatigue", "Burnout"],
    "contraindications": ["Vertigo", "High Blood Pressure", "Glaucoma"], // Inversions are bad for eye/head pressure
    "videoTag": "legs_up_wall"
  },
  {
    "exercise": "Chin Tucks (Neck Retractions)",
    "profile": "Postural Rehab",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Corrects forward-head posture that leads to tension headaches.",
    "symptoms": ["Neck Pain", "Migraine", "Headache", "Poor Posture", "Brain Fog"],
    "contraindications": ["Vertigo", "Recent Surgery / Injury"],
    "videoTag": "chin_tucks"
  },

  // --- DIGESTIVE & CORE ---
  {
    "exercise": "Supine Spinal Twist (Supta Matsyendrasana)",
    "profile": "Mobility & Gut Health",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Gently massages abdominal organs to stimulate digestion and relieve lower back tightness.",
    "symptoms": ["Constipation", "Bloating", "Irritable Bowel Syndrome", "Indigestion", "Back Pain"],
    "contraindications": ["Pregnancy Discomfort", "Recent Surgery / Injury", "Hernia"], 
    "videoTag": "spinal_twist"
  },

  // --- HORMONAL, METABOLIC & REPRODUCTIVE ---
  {
    "exercise": "Transverse Abdominis (TvA) Breathing",
    "profile": "Core & Pelvic Floor",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Safely rebuilds deep core strength without causing intra-abdominal pressure.",
    "symptoms": ["Postpartum Recovery", "Weak Core", "Back Pain", "Frequent Urination"],
    "contraindications": ["Recent Surgery / Injury"],
    "videoTag": "tva_breathing"
  },
  {
    "exercise": "Child's Pose (Balasana)",
    "profile": "Restorative Yoga",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Releases tension in the lower back and pelvic region; excellent for menstrual cramping.",
    "symptoms": ["Menstrual Pain", "PCOS", "Back Pain", "Stress", "Anxiety"],
    "contraindications": ["Knee Pain", "Arthritis"], // Hard on bad knees
    "videoTag": "childs_pose"
  },
  {
    "exercise": "Low-Intensity Steady State (LISS) Walk",
    "profile": "Cardio & Metabolic",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "None",
    "note": "A 20-minute brisk walk to improve insulin sensitivity and safely manage cortisol.",
    "symptoms": ["PCOS", "Diabetes", "Obesity", "Overweight", "Low Energy", "Depression", "High Blood Pressure"],
    "contraindications": ["Plantar Fasciitis", "Knee Pain", "Recovery Fatigue"],
    "videoTag": "liss_walk"
  },
  
  // --- RESPIRATORY & AGE-SPECIFIC ---
  {
    "exercise": "Pursed-Lip Breathing",
    "profile": "Respiratory Health",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Helps control breathing rate and keeps airways open longer to improve oxygen exchange.",
    "symptoms": ["Shortness of Breath", "Asthma", "Bronchitis", "Anxiety", "Panic Attacks"],
    "contraindications": [],
    "videoTag": "pursed_lip"
  },
  {
    "exercise": "Chair Squats (Sit-to-Stand)",
    "profile": "Foundational Strength",
    "gender": "All",
    "age": "All", // You can use >50 here if you want to restrict it
    "intensity": "Moderate",
    "equipment": "Chair",
    "note": "Builds leg strength and balance safely using a chair for support.",
    "symptoms": ["Muscle Weakness", "Balance Issues", "Osteoporosis", "Obesity"],
    "contraindications": ["Severe Knee Pain", "Arthritis"],
    "videoTag": "chair_squats"
  },
  // --- POSTURE & DESK WORKER REHAB ---
  {
    "exercise": "Wall Angels",
    "profile": "Postural Rehab",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Wall",
    "note": "Counters the 'hunched' desk posture by activating upper back muscles and opening the chest.",
    "symptoms": ["Shoulder Pain", "Neck Pain", "Poor Posture", "Slouching"],
    "contraindications": ["Frozen Shoulder", "Sports Injury", "Sprain", "Strain"],
    "videoTag": "wall_angels"
  },
  {
    "exercise": "Doorway Pectoral Stretch",
    "profile": "Mobility & Posture",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Doorway",
    "note": "Releases tight chest muscles that pull the shoulders forward during prolonged sitting.",
    "symptoms": ["Poor Posture", "Slouching", "Neck Pain", "Stress"],
    "contraindications": ["Frozen Shoulder", "Rotator Cuff Tear"], // Custom note: Map severe shoulder issues here
    "videoTag": "doorway_stretch"
  },
  {
    "exercise": "Wrist Flexor & Extensor Stretches",
    "profile": "Joint Care",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Relieves tension in the forearms and wrists from heavy typing and mouse usage.",
    "symptoms": ["Carpal Tunnel", "Joint Stiffness", "Numbness or Tingling"],
    "contraindications": ["Arthritis", "Sprain"], // Do not stretch during an acute arthritis flare-up
    "videoTag": "wrist_stretches"
  },

  // --- CORE STABILITY & BACK PAIN ---
  {
    "exercise": "Bird-Dog",
    "profile": "Core Stability",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Mat",
    "note": "Builds deep core and spinal stability without putting pressure on the lower back.",
    "symptoms": ["Back Pain", "Weak Core", "Balance Issues", "Sciatica"],
    "contraindications": ["Knee Pain", "Sprain"], // Requires kneeling
    "videoTag": "bird_dog"
  },
  {
    "exercise": "Knee-to-Chest Stretch",
    "profile": "Lower Back Rehab",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Mat",
    "note": "Gently decompress the lower spine and relieves tension in the lower back and glutes.",
    "symptoms": ["Sciatica", "Back Pain", "Leg Pain", "Joint Stiffness"],
    "contraindications": ["Hip Pain", "Recent Surgery / Injury"], 
    "videoTag": "knee_to_chest"
  },

  // --- CIRCULATION & BONE DENSITY (Great for Aging / Metabolic) ---
  {
    "exercise": "Ankle Pumps",
    "profile": "Circulation",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Promotes blood flow from the lower legs back to the heart; can be done seated or lying down.",
    "symptoms": ["Poor Circulation", "Edema", "Swelling", "Leg Cramps", "Diabetes"],
    "contraindications": ["Sprain", "Strain"],
    "videoTag": "ankle_pumps"
  },
  {
    "exercise": "Single Leg Stand (With Chair Support)",
    "profile": "Balance & Bone Density",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Chair",
    "note": "Crucial for preventing falls and maintaining neural pathways for balance as we age.",
    "symptoms": ["Balance Issues", "Osteoporosis", "Muscle Weakness"],
    "contraindications": ["Vertigo", "Fainting / Passing Out"],
    "videoTag": "single_leg_stand"
  },
  {
    "exercise": "Wall Sits",
    "profile": "Isometric Strength",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Wall",
    "note": "Builds isometric leg strength and bone density with minimal joint movement.",
    "symptoms": ["Osteoporosis", "Muscle Weakness", "Obesity"],
    "contraindications": ["Knee Pain", "Arthritis"],
    "videoTag": "wall_sits"
  },

  // --- NERVOUS SYSTEM, HEAD & MENTAL HEALTH ---
  {
    "exercise": "Upper Trapezius Stretch",
    "profile": "Tension Relief",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Targets the thick muscles connecting the neck and shoulders where stress is commonly held.",
    "symptoms": ["Headache", "Migraine", "Neck Pain", "Stress", "Anxiety"],
    "contraindications": ["Recent Surgery / Injury", "Sports Injury"],
    "videoTag": "upper_trap_stretch"
  },
  {
    "exercise": "Deep Diaphragmatic Breathing",
    "profile": "Nervous System",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Shifts the body from 'fight or flight' into 'rest and digest' mode by stimulating the vagus nerve.",
    "symptoms": ["Stress", "Anxiety", "Acid Reflux", "High Blood Pressure", "Indigestion", "Heart Palpitations"],
    "contraindications": [], // Universally safe
    "videoTag": "belly_breathing"
  },
  {
    "exercise": "Yoga Nidra (Body Scan Meditation)",
    "profile": "Deep Rest",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "A guided physiological relaxation technique proven to lower cortisol and improve sleep architecture.",
    "symptoms": ["Insomnia", "Restlessness", "Depression", "Burnout", "Brain Fog", "Fatigue", "Mood Swings"],
    "contraindications": [],
    "videoTag": "yoga_nidra"
  },

  // --- REPRODUCTIVE & DIGESTIVE ---
  {
    "exercise": "Kegel Exercises (Pelvic Floor)",
    "profile": "Pelvic Health",
    "gender": "All",
    "age": "All", 
    "intensity": "Low",
    "equipment": "None",
    "note": "Strengthens the pelvic floor muscles to support bladder control and core stability.",
    "symptoms": ["Frequent Urination", "Postpartum Recovery", "Pregnancy Discomfort", "Weak Core"],
    "contraindications": ["Recent Surgery / Injury"],
    "videoTag": "kegels"
  },
  {
    "exercise": "Seated Figure-Four Stretch",
    "profile": "Hip Mobility",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Chair",
    "note": "Opens tight hips and relieves compression on the sciatic nerve without needing to get on the floor.",
    "symptoms": ["Hip Pain", "Sciatica", "Back Pain", "Joint Stiffness", "Menstrual Pain"],
    "contraindications": ["Knee Pain", "Recent Surgery / Injury"],
    "videoTag": "seated_figure_four"
  },
  {
    "exercise": "Knee Hugs to Chest (Apanasana)",
    "profile": "Gut Health",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Mat",
    "note": "Known as the 'wind-relieving pose', this gently massages the ascending and descending colon.",
    "symptoms": ["Bloating", "Constipation", "Irritable Bowel Syndrome", "Gut Health", "Indigestion"],
    "contraindications": ["Pregnancy Discomfort", "Recent Surgery / Injury"], // Hernia risk
    "videoTag": "apanasana"
  },
  {
    "exercise": "Seated Stationary Pedaling",
    "profile": "Metabolic Cardio",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Under-Desk Elliptical / Bike",
    "note": "Provides joint-friendly cardiovascular training to improve insulin sensitivity.",
    "symptoms": ["Obesity", "Overweight", "High Cholesterol", "Diabetes", "Low Energy"],
    "contraindications": ["Heart Palpitations", "Chest Pain", "Shortness of Breath"],
    "videoTag": "seated_pedaling"
  },
  // --- WOMEN'S HEALTH & PELVIC FLOOR ---
  {
    "exercise": "Pelvic Tilts",
    "profile": "Core & Pelvic Health",
    "gender": "All", // Highly beneficial for women, but safe for all
    "age": "All",
    "intensity": "Low",
    "equipment": "Mat",
    "note": "A safe, foundational movement to restore deep core function and relieve lower back pressure.",
    "symptoms": ["Back Pain", "Postpartum Recovery", "Pregnancy Discomfort", "Menstrual Pain", "Weak Core"],
    "contraindications": ["Sprain", "Strain"],
    "videoTag": "pelvic_tilts"
  },
  {
    "exercise": "Clamshells",
    "profile": "Hip & Knee Stability",
    "gender": "Female",
    "age": "All",
    "intensity": "Low to Moderate",
    "equipment": "Mat",
    "note": "Strengthens the gluteus medius, which is critical for stabilizing the pelvis and preventing knee cave.",
    "symptoms": ["Knee Pain", "Hip Pain", "Sciatica", "Muscle Weakness", "Balance Issues", "Menopause Symptoms"],
    "contraindications": ["Sports Injury", "Sprain"],
    "videoTag": "clamshells"
  },

  // --- SENIOR MOBILITY & BONE HEALTH ---
  {
    "exercise": "Tai Chi / Qigong Weight Shifting",
    "profile": "Balance & Fall Prevention",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Slow, mindful weight transfers that build joint resilience, balance, and lower blood pressure.",
    "symptoms": ["Balance Issues", "Arthritis", "Joint Stiffness", "Stress", "High Blood Pressure"],
    "contraindications": ["Vertigo", "Fainting / Passing Out"],
    "videoTag": "tai_chi_shifting"
  },
  {
    "exercise": "Water Aerobics / Swimming",
    "profile": "Low-Impact Cardio",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Pool",
    "note": "Provides excellent cardiovascular and metabolic benefits while entirely offloading the joints.",
    "symptoms": ["Arthritis", "Knee Pain", "Hip Pain", "Obesity", "Overweight", "High Cholesterol", "Joint Stiffness"],
    "contraindications": ["Skin Rash", "Eczema"], // Chlorine can severely trigger eczema/rashes
    "videoTag": "water_aerobics"
  },
  {
    "exercise": "Standing Calf Raises",
    "profile": "Lower Leg Strength",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Chair or Wall",
    "note": "Acts as a 'second heart' to pump blood back up the legs, reducing swelling and strengthening the ankles.",
    "symptoms": ["Poor Circulation", "Edema", "Swelling", "Balance Issues", "Plantar Fasciitis"],
    "contraindications": ["Leg Cramps", "Sprain", "Strain"], // Avoid during acute cramping
    "videoTag": "calf_raises"
  },

  // --- CORE STABILITY (Back Pain Prevention) ---
  {
    "exercise": "Modified Plank (Incline or Knees)",
    "profile": "Foundational Core",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Mat or Sturdy Chair",
    "note": "Builds anti-extension core strength to protect the spine, modified to protect the lower back.",
    "symptoms": ["Weak Core", "Poor Posture", "Muscle Weakness", "Obesity", "Slouching"],
    "contraindications": ["Carpal Tunnel", "Shoulder Pain", "Pregnancy Discomfort"],
    "videoTag": "modified_plank"
  },
  {
    "exercise": "Dead Bug",
    "profile": "Core Stability",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Mat",
    "note": "Trains the core to remain stable while the limbs move, highly recommended by physical therapists for back pain.",
    "symptoms": ["Weak Core", "Back Pain", "Slouching", "Balance Issues", "Sciatica"],
    "contraindications": ["Pregnancy Discomfort", "Postpartum Recovery"], // Can cause coning/doming in early postpartum
    "videoTag": "dead_bug"
  },

  // --- POSTURE & DESK REHAB (Upper Body) ---
  {
    "exercise": "Thoracic Extension (Over Chair)",
    "profile": "Spinal Mobility",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Chair",
    "note": "Reverses the forward-hunch of desk work by gently mobilizing the mid-back.",
    "symptoms": ["Poor Posture", "Slouching", "Back Pain", "Neck Pain", "Shoulder Pain"],
    "contraindications": ["Osteoporosis", "Frozen Shoulder"], // Do not force extension on osteoporotic spines
    "videoTag": "thoracic_extension"
  },
  {
    "exercise": "Resistance Band Pull-Aparts",
    "profile": "Postural Strength",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Resistance Band",
    "note": "Strengthens the rhomboids and rear deltoids to naturally pull the shoulders back into alignment.",
    "symptoms": ["Poor Posture", "Slouching", "Shoulder Pain", "Muscle Weakness", "Neck Pain"],
    "contraindications": ["Frozen Shoulder", "Carpal Tunnel"],
    "videoTag": "band_pull_aparts"
  },
  {
    "exercise": "Seated Neck Stretches (Upper Traps & Levator Scapulae)",
    "profile": "Tension Relief",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Relieves tension headaches and stiffness caused by staring at screens.",
    "symptoms": ["Neck Pain", "Headache", "Migraine", "Joint Stiffness", "Eye Strain"],
    "contraindications": ["Vertigo", "Fainting / Passing Out"], // Moving the head can trigger dizzy spells
    "videoTag": "neck_stretches"
  },

  // --- DIGESTIVE & RECOVERY ---
  {
    "exercise": "Seated Spinal Twist (Ardha Matsyendrasana)",
    "profile": "Mobility & Digestion",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Wrings out tension in the spine while gently compressing the abdomen to stimulate digestion.",
    "symptoms": ["Back Pain", "Joint Stiffness", "Constipation", "Indigestion", "Bloating"],
    "contraindications": ["Pregnancy Discomfort", "Hip Pain", "Sciatica"],
    "videoTag": "seated_twist"
  },
  {
    "exercise": "Foam Rolling (Legs & Back)",
    "profile": "Myofascial Release",
    "gender": "All",
    "age": "All",
    "intensity": "Low to Moderate",
    "equipment": "Foam Roller",
    "note": "Self-massage technique that improves tissue elasticity and flushes out metabolic waste post-workout.",
    "symptoms": ["Recovery Fatigue", "Overtraining", "Muscle Weakness", "Leg Pain", "Back Pain"],
    "contraindications": ["Bruising Easily", "Varicose Veins", "Osteoporosis"], // Rolling over fragile veins/bones is dangerous
    "videoTag": "foam_rolling"
  },

  // --- RESPIRATORY & NEUROLOGICAL ---
  {
    "exercise": "Alternate Nostril Breathing (Nadi Shodhana)",
    "profile": "Breathwork & Nervous System",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Balances the left and right hemispheres of the brain, rapidly lowering heart rate and clearing mental fog.",
    "symptoms": ["Stress", "Anxiety", "Brain Fog", "Poor Concentration", "Headache", "High Blood Pressure", "Heart Palpitations"],
    "contraindications": ["Sinus Congestion", "Cold"], // Impossible to do if congested
    "videoTag": "alternate_nostril"
  },
  {
    "exercise": "Chair Pose (Utkatasana)",
    "profile": "Isometric Strength",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "None",
    "note": "A powerful standing posture that builds heat, core stability, and deep leg strength.",
    "symptoms": ["Muscle Weakness", "Balance Issues", "Low Energy", "Overweight", "Poor Posture"],
    "contraindications": ["Knee Pain", "Arthritis", "Hip Pain"],
    "videoTag": "chair_pose"
  },
  {
    "exercise": "Gentle Walking (Nature / Green Space)",
    "profile": "Mental & Physical Baseline",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Unstructured outdoor walking without tracking metrics; proven to lower cortisol and improve mood.",
    "symptoms": ["Depression", "Burnout", "Stress", "Anxiety", "Insomnia", "Low Energy", "Emotional Eating"],
    "contraindications": ["Plantar Fasciitis", "Severe Knee Pain", "Fever"], // Avoid if actively ill or in acute foot pain
    "videoTag": "nature_walk"
  },
  // --- DESK WORKER: OCULAR & WRIST REHAB ---
  {
    "exercise": "Palming (Eye Yoga)",
    "profile": "Ocular Relief",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Rests the optic nerve and relieves ciliary muscle tension from prolonged screen time.",
    "symptoms": ["Eye Strain", "Eye Dryness", "Headache", "Migraine", "Blurry Vision", "Brain Fog"],
    "contraindications": ["Skin Rash", "Skin Acne"], // Avoid touching face if acute skin conditions exist
    "videoTag": "eye_palming"
  },
  {
    "exercise": "Wrist Rolls & Finger Extensions",
    "profile": "Joint Care",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Flushes synovial fluid into the wrist joints and stretches contracted finger tendons.",
    "symptoms": ["Carpal Tunnel", "Joint Stiffness", "Numbness or Tingling", "Sweaty Hands"],
    "contraindications": ["Arthritis", "Sprain", "Strain"], // Avoid during an acute arthritis flare-up
    "videoTag": "wrist_rolls"
  },

  // --- METABOLIC & FOUNDATIONAL STRENGTH ---
  {
    "exercise": "Farmer's Walk (Loaded Carries)",
    "profile": "Full Body Strength & Core",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate to High",
    "equipment": "Dumbbells or Heavy Bags",
    "note": "A highly functional movement that builds grip, core stability, and cardiovascular endurance.",
    "symptoms": ["Muscle Weakness", "Weak Core", "Osteoporosis", "Poor Posture", "Obesity", "Insulin Resistance"],
    "contraindications": ["Sciatica", "Recent Surgery / Injury", "Hernia", "High Blood Pressure"],
    "videoTag": "farmers_walk"
  },
  {
    "exercise": "Incline Push-Ups (Counter or Table)",
    "profile": "Foundational Strength",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Sturdy Table/Counter",
    "note": "Builds chest and core strength safely without the heavy joint load of floor push-ups.",
    "symptoms": ["Muscle Weakness", "Osteoporosis", "Weak Core", "Slouching", "Low Energy"],
    "contraindications": ["Shoulder Pain", "Frozen Shoulder", "Carpal Tunnel", "Sprain"],
    "videoTag": "incline_pushup"
  },
  {
    "exercise": "Step-Ups",
    "profile": "Lower Body Strength",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Stairs or Low Stool",
    "note": "Builds unilateral leg strength and improves daily functional mobility.",
    "symptoms": ["Muscle Weakness", "Balance Issues", "Poor Circulation", "Diabetes", "Leg Pain"],
    "contraindications": ["Plantar Fasciitis", "Knee Pain", "Vertigo", "Balance Issues"], // Contraindicated if balance is severely compromised
    "videoTag": "step_ups"
  },

  // --- PELVIC, LOWER BACK & SPINAL RELIEF ---
  {
    "exercise": "Deep Squat (Malasana / Yogi Squat)",
    "profile": "Pelvic Health & Mobility",
    "gender": "All",
    "age": "All",
    "intensity": "Low to Moderate",
    "equipment": "None",
    "note": "Relaxes the pelvic floor, opens the hips, and naturally assists with bowel movements.",
    "symptoms": ["Constipation", "Hemorrhoids", "Menstrual Pain", "Pregnancy Discomfort", "Hip Pain"],
    "contraindications": ["Knee Pain", "Sciatica", "Recent Surgery / Injury"],
    "videoTag": "yogi_squat"
  },
  {
    "exercise": "Supine 90/90 Leg Rest",
    "profile": "Lower Back Relief",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Chair or Couch",
    "note": "Lying on the back with calves resting on a chair places the spine in a truly neutral, zero-gravity position.",
    "symptoms": ["Back Pain", "Sciatica", "Leg Pain", "Fatigue", "Recovery Fatigue", "Muscle Weakness"],
    "contraindications": ["Acid Reflux"], // Lying flat can trigger reflux
    "videoTag": "supine_90_90"
  },
  {
    "exercise": "Supported Downward Dog (Hands on Wall/Chair)",
    "profile": "Gentle Decompression",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Wall or Chair",
    "note": "Lengthens the spine and hamstrings without the shoulder strain or blood pressure spikes of a full inversion.",
    "symptoms": ["Back Pain", "Stress", "Fatigue", "Shoulder Pain", "Leg Cramps", "Joint Stiffness"],
    "contraindications": ["Vertigo", "Fainting / Passing Out", "Glaucoma"],
    "videoTag": "supported_down_dog"
  },
  {
    "exercise": "Crocodile Breathing (Prone Belly Breathing)",
    "profile": "Core & Nervous System",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Mat",
    "note": "Lying face down while breathing deeply provides tactile feedback to properly engage the diaphragm.",
    "symptoms": ["Weak Core", "Stress", "Anxiety", "Insomnia", "Back Pain", "Shallow Breathing"],
    "contraindications": ["Pregnancy Discomfort", "Acid Reflux", "Recent Surgery / Injury"],
    "videoTag": "crocodile_breathing"
  },

  // --- DIGESTIVE & VAGAL TONE (Nervous System) ---
  {
    "exercise": "Voo Breathing (Vocal Toning)",
    "profile": "Vagal Tone Stimulation",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Using deep vocal vibrations (humming or chanting 'Voo') physically stimulates the vagus nerve to calm the gut-brain axis.",
    "symptoms": ["Irritable Bowel Syndrome", "Stress", "Anxiety", "Acid Reflux", "Nausea", "Heart Palpitations"],
    "contraindications": ["Shortness of Breath", "Chronic Cough", "Bronchitis"],
    "videoTag": "voo_breathing"
  },
  {
    "exercise": "Gentle Seated Forward Fold (Paschimottanasana)",
    "profile": "Nervous System & Hamstrings",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Mat",
    "note": "A highly restorative pose that stretches the entire posterior chain and signals the brain to cool down.",
    "symptoms": ["Stress", "Anxiety", "High Blood Pressure", "Back Pain", "Insomnia"],
    "contraindications": ["Sciatica", "Recent Surgery / Injury"], // Can aggravate sciatica if done improperly
    "videoTag": "seated_forward_fold"
  },

  // --- CARDIOVASCULAR, COGNITIVE & CIRCADIAN ---
  {
    "exercise": "Morning Sunlight Walk (10-15 mins)",
    "profile": "Circadian Rhythm",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Combines light movement with early photon exposure to reset the biological clock and boost serotonin.",
    "symptoms": ["Insomnia", "Depression", "Fatigue", "Low Energy", "Mood Swings", "Brain Fog", "Osteoporosis"],
    "contraindications": ["Heat Intolerance", "Fever", "Severe Allergies"],
    "videoTag": "morning_sun_walk"
  },
  {
    "exercise": "Shadow Boxing / Light Sparring (Seated or Standing)",
    "profile": "Cognitive Cardio",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate to High",
    "equipment": "None",
    "note": "Cross-body movements elevate heart rate while forcing the left and right brain hemispheres to communicate.",
    "symptoms": ["Brain Fog", "Low Energy", "Overweight", "High Cholesterol", "Poor Concentration"],
    "contraindications": ["High Blood Pressure", "Fainting / Passing Out", "Joint Stiffness", "Shoulder Pain"],
    "videoTag": "shadow_boxing"
  },
  {
    "exercise": "Standing Side Bends",
    "profile": "Lateral Mobility",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Stretches the intercostal muscles between the ribs, opening up the ribcage for deeper, more efficient breathing.",
    "symptoms": ["Slouching", "Poor Posture", "Shortness of Breath", "Back Pain"],
    "contraindications": ["Vertigo", "Balance Issues", "Recent Surgery / Injury"],
    "videoTag": "standing_side_bends"
  },
  {
    "exercise": "Resistance Band Rows",
    "profile": "Postural Strength",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "Resistance Band",
    "note": "Strengthens the latissimus dorsi and rhomboids to combat the 'rounded shoulder' posture.",
    "symptoms": ["Slouching", "Poor Posture", "Neck Pain", "Shoulder Pain", "Muscle Weakness"],
    "contraindications": ["Frozen Shoulder", "Sprain", "Strain"],
    "videoTag": "band_rows"
  },
  // --- SHOULDER & CERVICAL REHAB ---
  {
    "exercise": "Pendulum Swings",
    "profile": "Shoulder Rehab",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Chair or Table (for support)",
    "note": "Uses gravity to gently separate the joint surfaces and relieve pain in a stiff shoulder.",
    "symptoms": ["Frozen Shoulder", "Shoulder Pain", "Joint Stiffness", "Recovery Fatigue"],
    "contraindications": ["Recent Surgery / Injury"], // Safety override for acute tears
    "videoTag": "pendulum_swings"
  },
  {
    "exercise": "Scapular Wall Slides",
    "profile": "Postural Mobility",
    "gender": "All",
    "age": "All",
    "intensity": "Low to Moderate",
    "equipment": "Wall",
    "note": "Retrains the shoulder blades to move correctly, reducing neck strain and correcting the 'slouch'.",
    "symptoms": ["Poor Posture", "Slouching", "Shoulder Pain", "Neck Pain", "Muscle Weakness"],
    "contraindications": ["Frozen Shoulder", "Sprain"], // Too much active range of motion for frozen shoulder
    "videoTag": "wall_slides"
  },
  {
    "exercise": "Slow Neck Circles & Isometrics",
    "profile": "Cervical Mobility",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Restores range of motion to the cervical spine and relieves tension headaches.",
    "symptoms": ["Neck Pain", "Joint Stiffness", "Poor Posture", "Headache", "Migraine", "Jaw Pain"],
    "contraindications": ["Vertigo", "Fainting / Passing Out", "Numbness or Tingling"], // Tingling indicates nerve compression, avoid circles
    "videoTag": "neck_isometrics"
  },

  // --- LYMPHATIC, IMMUNE & CIRCULATION ---
  {
    "exercise": "Lymphatic Dry Brushing (Limbs toward Heart)",
    "profile": "Circulation & Immune Support",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Dry Brush or Towel",
    "note": "A physical therapy technique that stimulates the lymphatic system to clear metabolic waste and reduce fluid retention.",
    "symptoms": ["Edema", "Swelling", "Poor Circulation", "Immune Weakness", "Frequent Infections", "Recovery Fatigue"],
    "contraindications": ["Eczema", "Psoriasis", "Skin Rash", "Skin Acne", "Bruising Easily"], // Strict skin safety block
    "videoTag": "dry_brushing"
  },
  {
    "exercise": "Ankle Alphabets",
    "profile": "Lower Leg Rehab",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Tracing the alphabet with your big toe flushes swelling out of the foot and strengthens the stabilizing ligaments.",
    "symptoms": ["Poor Circulation", "Swelling", "Edema", "Plantar Fasciitis", "Leg Cramps", "Joint Stiffness", "Foot Pain", "Toe Pain"],
    "contraindications": ["Sprain", "Strain", "Recent Surgery / Injury"], // Blocked for acute ankle sprains
    "videoTag": "ankle_alphabets"
  },

  // --- SLEEP ARCHITECTURE & OROPHARYNGEAL ---
  {
    "exercise": "Myofascial Jaw Release (Masseter Massage)",
    "profile": "Tension Relief",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Releases the powerful jaw muscles that hold stress, reducing teeth grinding and tension headaches.",
    "symptoms": ["Jaw Pain", "Headache", "Migraine", "Stress", "Anxiety", "Dental Pain", "Insomnia"],
    "contraindications": ["Recent Surgery / Injury"],
    "videoTag": "jaw_release"
  },
  {
    "exercise": "Oropharyngeal (Throat & Tongue) Exercises",
    "profile": "Sleep Apnea & Airway Support",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Clinically proven to tone the muscles of the airway, significantly reducing snoring and mild sleep apnea.",
    "symptoms": ["Snoring", "Fatigue", "Insomnia", "Low Energy", "Brain Fog", "Overweight"],
    "contraindications": ["Cold", "Fever", "Bronchitis"], // Uncomfortable to perform when sick
    "videoTag": "throat_exercises"
  },
  {
    "exercise": "Progressive Muscle Relaxation (PMR)",
    "profile": "Deep Rest",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "A systematic tensing and releasing of muscle groups that overrides the physical symptoms of anxiety.",
    "symptoms": ["Insomnia", "Restlessness", "Stress", "Anxiety", "Muscle Weakness", "Recovery Fatigue", "Heart Palpitations"],
    "contraindications": ["High Blood Pressure"], // Tensing muscles spikes blood pressure slightly
    "videoTag": "pmr_relaxation"
  },

  // --- METABOLIC CARDIO & JOINT-SAFE STRENGTH ---
  {
    "exercise": "Seated Marching",
    "profile": "Senior / Accessible Cardio",
    "gender": "All",
    "age": "All",
    "intensity": "Low to Moderate",
    "equipment": "Chair",
    "note": "Elevates heart rate and improves hip flexor strength without carrying body weight or risking a fall.",
    "symptoms": ["Muscle Weakness", "Balance Issues", "Obesity", "Poor Circulation", "Diabetes", "Osteoporosis", "Knee Pain"],
    "contraindications": ["Chest Pain", "Shortness of Breath", "Fainting / Passing Out"],
    "videoTag": "seated_marching"
  },
  {
    "exercise": "Low-Impact Step Jacks",
    "profile": "Metabolic Cardio",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate",
    "equipment": "None",
    "note": "Provides the cardiovascular and metabolic benefits of a jumping jack without the jarring impact on joints.",
    "symptoms": ["Obesity", "Overweight", "High Cholesterol", "Low Energy", "Insulin Resistance", "Depression"],
    "contraindications": ["Knee Pain", "Plantar Fasciitis", "Arthritis", "Chest Pain"],
    "videoTag": "step_jacks"
  },
  {
    "exercise": "Static Lunge (Split Squat Hold)",
    "profile": "Isometric Leg Strength",
    "gender": "All",
    "age": "All",
    "intensity": "Moderate to High",
    "equipment": "Chair/Wall (for balance)",
    "note": "Builds dense muscle tissue in the legs and glutes to improve insulin sensitivity and stabilize the knee.",
    "symptoms": ["Muscle Weakness", "Balance Issues", "Osteoporosis", "Overweight", "Low Energy"],
    "contraindications": ["Knee Pain", "Hip Pain", "Arthritis", "Recent Surgery / Injury"],
    "videoTag": "static_lunge"
  },

  // --- PELVIC FLOOR & DIGESTIVE ---
  {
    "exercise": "Happy Baby Pose (Ananda Balasana)",
    "profile": "Pelvic Floor Relaxation",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Mat",
    "note": "Stretches the inner groins and actively relaxes a hypertonic (over-tight) pelvic floor and lower back.",
    "symptoms": ["Constipation", "Back Pain", "Irritable Bowel Syndrome", "Sciatica", "Stress", "Pregnancy Discomfort"],
    "contraindications": ["Recent Surgery / Injury", "Knee Pain"], // Hard to grab feet with bad knees
    "videoTag": "happy_baby"
  },
  {
    "exercise": "Diaphragmatic Belly Massage",
    "profile": "Gut Health",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Using the hands to gently massage the abdomen in a clockwise direction to encourage bowel motility.",
    "symptoms": ["Constipation", "Bloating", "Irritable Bowel Syndrome", "Indigestion", "Gut Health"],
    "contraindications": ["Pregnancy Discomfort", "Postpartum Recovery", "Ulcer", "Hernia"],
    "videoTag": "belly_massage"
  },

  // --- HORMONAL & NERVOUS SYSTEM ---
  {
    "exercise": "Legs on a Chair (Constructive Rest)",
    "profile": "Nervous System Reset",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Chair",
    "note": "Offloads the psoas muscle entirely, instantly signaling safety to the nervous system to lower cortisol.",
    "symptoms": ["Burnout", "Stress", "Fatigue", "Back Pain", "PCOS", "Menstrual Pain", "Hot Flashes"],
    "contraindications": ["Acid Reflux"], // Flat positions trigger reflux
    "videoTag": "constructive_rest"
  },
  {
    "exercise": "Lion's Breath (Simhasana)",
    "profile": "Tension & Emotional Release",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "A forceful exhalation that relieves tension in the chest and face while acting as a healthy emotional release valve.",
    "symptoms": ["Stress", "Anxiety", "Irritability", "Mood Swings", "Jaw Pain", "Asthma"],
    "contraindications": ["Chronic Cough", "Bronchitis", "Cold"], // Will trigger violent coughing fits
    "videoTag": "lions_breath"
  },
  // --- ENDOCRINE & HORMONAL ---
  {
    "exercise": "Supported Bridge Pose (with Block)",
    "profile": "Endocrine & Restorative",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Yoga Block or Thick Book",
    "note": "A gentle inversion that stimulates blood flow to the thyroid gland and rests the heart.",
    "symptoms": ["Thyroid Disorder", "Menopause Symptoms", "Fatigue", "Stress", "Back Pain", "Burnout"],
    "contraindications": ["Neck Pain", "Recent Surgery / Injury", "Glaucoma"],
    "videoTag": "supported_bridge"
  },

  // --- RESPIRATORY, IMMUNE & ALLERGY ---
  {
    "exercise": "Bhramari Pranayama (Humming Bee Breath)",
    "profile": "Sinus & Nervous System",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "The humming vibration acts as a sonic cleanser for the sinuses and instantly soothes the vagus nerve.",
    "symptoms": ["Sinus Congestion", "Allergies", "Stress", "Anxiety", "High Blood Pressure", "Insomnia", "Brain Fog"],
    "contraindications": ["Ringing in Ears", "Cold"], // Humming can aggravate severe tinnitus or acute ear/cold infections
    "videoTag": "bhramari_breath"
  },
  {
    "exercise": "Gentle Heel Drops",
    "profile": "Bone Density & Lymphatic Flush",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Lifting the heels and dropping them to the floor creates a micro-impact that builds bone density and pumps lymphatic fluid.",
    "symptoms": ["Osteoporosis", "Immune Weakness", "Frequent Infections", "Low Energy", "Cold Intolerance", "Edema"],
    "contraindications": ["Knee Pain", "Plantar Fasciitis", "Sprain", "Strain", "Vertigo"],
    "videoTag": "heel_drops"
  },

  // --- METABOLIC & DIGESTIVE ---
  {
    "exercise": "10-Minute Post-Meal Stroll",
    "profile": "Metabolic & Digestion",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "A slow, relaxed walk immediately after eating. Uses glucose in the bloodstream, blunting insulin spikes and aiding digestion.",
    "symptoms": ["Diabetes", "Sugar Cravings", "Indigestion", "Acid Reflux", "Weight Loss", "Obesity"],
    "contraindications": ["Plantar Fasciitis", "Fatigue"], // Do not walk if suffering acute foot pain
    "videoTag": "post_meal_stroll"
  },
  {
    "exercise": "Sufi Grinds (Seated Torso Circles)",
    "profile": "Core & Gut Health",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Rotating the torso in wide circles massages the internal organs and loosens up a stiff lower back.",
    "symptoms": ["Constipation", "Bloating", "Irritable Bowel Syndrome", "Joint Stiffness", "Back Pain", "Loss of Appetite"],
    "contraindications": ["Sciatica", "Recent Surgery / Injury"],
    "videoTag": "sufi_grinds"
  },

  // --- NEURO-VISUAL & VESTIBULAR ---
  {
    "exercise": "Ocular Tracking & Convergence Drills",
    "profile": "Neuro-Visual Rehab",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "A Pen or Pencil",
    "note": "Trains the eyes to focus near and far, reducing digital eye strain and assisting vestibular (balance) habituation.",
    "symptoms": ["Eye Strain", "Blurry Vision", "Brain Fog", "Vertigo", "Poor Concentration", "Balance Issues"],
    "contraindications": ["Migraine", "Headache"], // Eye tracking can trigger nausea during an active migraine
    "videoTag": "ocular_tracking"
  },

  // --- POSTURE & SPINAL MOBILITY ---
  {
    "exercise": "Sphinx Pose (Salamba Bhujangasana)",
    "profile": "Postural & Respiratory",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Mat",
    "note": "A supported backbend that counteracts the 'desk hunch', opening the chest for deeper lung expansion.",
    "symptoms": ["Slouching", "Poor Posture", "Asthma", "Shortness of Breath", "Low Energy", "Depression"],
    "contraindications": ["Back Pain", "Pregnancy Discomfort", "Recent Surgery / Injury"], // Avoid if extension hurts the lower back
    "videoTag": "sphinx_pose"
  },
  {
    "exercise": "Standing Qigong Torso Twist",
    "profile": "Spinal Mobility & Energy",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "None",
    "note": "Allowing the arms to gently tap the lower back and abdomen while twisting stimulates the kidneys and wakes up the spine.",
    "symptoms": ["Joint Stiffness", "Low Energy", "Constipation", "Stress", "Fatigue", "Poor Circulation"],
    "contraindications": ["Sciatica", "Vertigo", "Balance Issues"],
    "videoTag": "qigong_twist"
  },

  // --- FULL BODY INTEGRATION & WARM-UP ---
  {
    "exercise": "Dynamic Leg Swings (Forward & Lateral)",
    "profile": "Hip Mobility & Circulation",
    "gender": "All",
    "age": "All",
    "intensity": "Low to Moderate",
    "equipment": "Wall or Chair (for balance)",
    "note": "Actively lubricates the hip joint capsule and pumps blood into the legs, perfect for waking up or pre-workout.",
    "symptoms": ["Hip Pain", "Leg Pain", "Cold Intolerance", "Poor Circulation", "Recovery Fatigue", "Muscle Weakness"],
    "contraindications": ["Balance Issues", "Sprain", "Strain", "Sciatica"],
    "videoTag": "leg_swings"
  },
  {
    "exercise": "Modified Chair Sun Salutation (Surya Namaskar)",
    "profile": "Full Body Awakening",
    "gender": "All",
    "age": "All",
    "intensity": "Low",
    "equipment": "Chair",
    "note": "A highly accessible version of the classic yoga flow that links breath with movement to oxygenate the entire body.",
    "symptoms": ["Joint Stiffness", "Depression", "Low Energy", "Overweight", "Poor Circulation", "Muscle Weakness", "Burnout"],
    "contraindications": ["Fainting / Passing Out", "Vertigo", "High Blood Pressure"], // Avoid rapid up/down head movements
    "videoTag": "chair_sun_salutation"
  }
];
