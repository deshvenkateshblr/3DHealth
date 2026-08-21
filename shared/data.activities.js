// shared/data.activities.js
// MET (Metabolic Equivalent of Task) Database for KYH App

window.ACTIVITIES = [
  // --- REST & PASSIVE (The Baselines) ---
  { id: "act_011", category: "Rest & Passive", name: "Sleeping", met: 0.9 },
  { id: "act_012", category: "Rest & Passive", name: "Watching TV / Lying Down", met: 1.0 },
  { id: "act_017", category: "Rest & Passive", name: "Sitting (Idle / Relaxing)", met: 1.0 },
  { id: "act_013", category: "Rest & Passive", name: "Sitting (Passenger in vehicle)", met: 1.3 },

  // --- ROUTINE & CHORES ---
  { id: "act_015", category: "Routine & Chores", name: "Office Work (Desk/Typing)", met: 1.5 },
  { id: "act_018", category: "Routine & Chores", name: "Reading / Studying", met: 1.3 },
  { id: "act_022", category: "Routine & Chores", name: "Standing (Active / Desk)", met: 1.8 },
  { id: "act_014", category: "Routine & Chores", name: "Driving a Car (Traffic)", met: 2.0 },
  { id: "act_002", category: "Routine & Chores", name: "Cooking or Meal Prep", met: 2.0 },
  { id: "act_004", category: "Routine & Chores", name: "Light Cleaning (Dusting)", met: 2.5 },
  { id: "act_023", category: "Routine & Chores", name: "Childcare (Active)", met: 3.0 },
  { id: "act_005", category: "Routine & Chores", name: "Heavy Cleaning (Mopping)", met: 3.3 },
  { id: "act_016", category: "Routine & Chores", name: "Personal Care (Bathing, Dressing)", met: 2.0 },

  // --- WALKING & MOBILITY ---
  { id: "act_101", category: "Walking & Mobility", name: "Strolling (Leisurely)", met: 2.0 },
  { id: "act_026", category: "Walking & Mobility", name: "Shopping / Errands", met: 2.3 },
  { id: "act_025", category: "Walking & Mobility", name: "Walking the Dog", met: 3.0 },
  { id: "act_102", category: "Walking & Mobility", name: "Walking (Moderate pace)", met: 3.3 },
  { id: "act_103", category: "Walking & Mobility", name: "Brisk Walking", met: 5.0 },
  { id: "act_501", category: "Walking & Mobility", name: "Wheelchair (Manual)", met: 2.0 },

  // --- MIND & BODY ---
  { id: "act_211", category: "Mind & Body", name: "Meditation", met: 1.0 },
    { id: "act_203", category: "Mind & Body", name: "Stretching (Light)", met: 2.3 },
  { id: "act_208", category: "Mind & Body", name: "Yoga (Hatha / Restorative)", met: 2.5 },
  { id: "act_210", category: "Mind & Body", name: "Pilates (Mat)", met: 3.0 },
  { id: "act_209", category: "Mind & Body", name: "Yoga (Vinyasa / Power)", met: 4.0 },
  { id: "act_212", category: "Mind & Body", name: "Social / Community time", met: 1.8 },

  // --- SPORTS & AGILITY ---
  { id: "act_412", category: "Sports & Agility", name: "Table Tennis", met: 4.0 },
  { id: "act_206", category: "Sports & Agility", name: "Golf (Walking)", met: 4.3 },
  { id: "act_401", category: "Sports & Agility", name: "Basketball (Casual)", met: 4.5 },
  { id: "act_405", category: "Sports & Agility", name: "Tennis (Doubles)", met: 5.0 },
  { id: "act_403", category: "Sports & Agility", name: "Soccer (Casual)", met: 7.0 },
  { id: "act_406", category: "Sports & Agility", name: "Tennis (Singles)", met: 8.0 },
  { id: "act_404", category: "Sports & Agility", name: "Soccer (Competitive)", met: 10.0 },

  // --- GYM & VIGOROUS ---
  { id: "act_207", category: "Gym & Vigorous", name: "Weightlifting (Light)", met: 3.0 },
  { id: "act_301", category: "Gym & Vigorous", name: "Weightlifting (Heavy)", met: 6.0 },
  { id: "act_303", category: "Gym & Vigorous", name: "Swimming (Moderate)", met: 5.8 },
  { id: "act_311", category: "Gym & Vigorous", name: "Rowing Machine", met: 4.8 },
  { id: "act_305", category: "Gym & Vigorous", name: "Aerobics / High Impact", met: 7.3 },
  { id: "act_307", category: "Gym & Vigorous", name: "Running (Jogging)", met: 8.3 },
  { id: "act_314", category: "Gym & Vigorous", name: "Martial Arts / Boxing", met: 9.0 },
  { id: "act_309", category: "Gym & Vigorous", name: "Running (Vigorous)", met: 11.8 },


];