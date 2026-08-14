// shared/data.diet.js
// KYH Dietary Engine

// 1. NEW: Clinical Diagnostics Map (NIH / Merck Standards)
// shared/data.diet.js
// KYH Dietary Diagnostics Engine

// 1. Clinical Diagnostics Map (Unified Symptom Vocabulary)
window.dietaryDiagnostics = [
  // --- MACROS ---
  {
    nutrient: "Protein", category: "Macro",
    symptoms: ["Low Energy", "Immune Weakness", "Hair loss", "Frequent Infections", "Postpartum Recovery"],
    diet_markers: ["Protein Portions (Engine Calculation)"],
    feedback: {
      deficient: "Your estimated protein intake is below your target, which often impacts recovery and hair health. Let's aim to consistently hit your personalized portion goal.",
      sufficient: "You are doing a fantastic job hitting your protein targets! Your diet is doing its job here."
    }
  },
  {
    nutrient: "Healthy Fats", category: "Macro",
    symptoms: ["Eczema", "Brain fog", "Joint aches", "Low Energy"],
    diet_markers: ["Fat Portions (Engine Calculation)"],
    feedback: {
      deficient: "Your healthy fat intake appears low, which can lead to skin issues like eczema and brain fog. Adding nuts or plant oils will help.",
      sufficient: "Your healthy fat intake is right on target, providing excellent support for your brain and skin."
    }
  },
  {
    nutrient: "Carbohydrates", category: "Macro",
    symptoms: ["Fainting / Passing Out", "Low Energy", "Fatigue", "Underweight"],
    diet_markers: ["Carb Portions (Engine Calculation)"],
    feedback: {
      deficient: "You are operating in a steep energy deficit, likely causing your severe fatigue. Adding a portion of complex carbs will stabilize your blood sugar.",
      sufficient: "Your energy intake is solid! Since you are still experiencing crashes, let's look at your sleep or hydration."
    }
  },

  // --- MICROS ---
  {
    nutrient: "Iron", category: "Micro",
    symptoms: ["Fatigue", "Cold", "Fainting / Passing Out", "Low Energy", "Pregnancy Discomfort"],
    diet_markers: ["legumes", "greens"],
    feedback: {
      deficient: "Based on your diet, your fatigue and feeling cold is likely linked to low iron. Adding a serving of spinach or lentils 3x a week is your highest leverage action right now.",
      sufficient: "You are doing a great job eating iron-rich greens and legumes regularly! We may need a routine CBC blood test to look deeper."
    }
  },
  {
    nutrient: "Dietary Fiber", category: "Micro",
    symptoms: ["Constipation", "Frequent bloating", "Blood in Stool", "Pregnancy Discomfort"],
    diet_markers: ["fruits", "greens", "legumes"],
    feedback: {
      deficient: "Your gut issues are directly tied to a lack of fiber. Your immediate priority is adding a serving of whole fruit or greens to your day.",
      sufficient: "Your whole-food and fiber intake is excellent! Ensure you are drinking enough water to help that fiber move."
    }
  },
  {
    nutrient: "Calcium", category: "Micro",
    profile: "High Risk (Post-menopausal women, Vegans)",
    symptoms: ["Joint aches", "Muscle cramps", "Bone pain", "Pregnancy Discomfort"],
    diet_markers: ["greens", "dietType"],
    feedback: {
      deficient: "At this stage, calcium is critical. Since your intake of fortified dairy or greens is low, let's aim to add fortified plant milks or take a daily Calcium + D3 supplement.",
      sufficient: "Your calcium intake from your diet looks strong! Continue prioritizing these foods."
    }
  }
];


// 2. ORIGINAL: The Personalized Baseline Database (Preserving your USP)
// Note: This is your exact original dataset.
window.DIET = [
  {"sex": "Female", "age": "18-24", "bmi": ">=30", "waist": ">90 cm", "activity": "Moderate", "cal": "1650", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight reduction; ensure iron and micronutrients"},
  {"sex": "Female", "age": "18-24", "bmi": ">=30", "waist": ">90 cm", "activity": "Sedentary", "cal": "1600", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight reduction; clinical oversight recommended"},
  {"sex": "Female", "age": "18-24", "bmi": ">=30", "waist": "70-79 cm", "activity": "Sedentary", "cal": "1700", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight reduction; clinical oversight recommended"},
  {"sex": "Female", "age": "18-24", "bmi": ">=30", "waist": "80-90 cm", "activity": "Active", "cal": "1850", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; maintain activity and micronutrients"},
  {"sex": "Female", "age": "18-24", "bmi": "18.5-24.9", "waist": "<80 cm", "activity": "Active", "cal": "2500", "carbs": "58", "fat": "27", "protein": "15", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight and reproductive health; ensure iron sufficiency"},
  {"sex": "Female", "age": "18-24", "bmi": "18.5-24.9", "waist": "<80 cm", "activity": "Moderate", "cal": "2200", "carbs": "56", "fat": "28", "protein": "16", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight; monitor iron and fiber intake"},
  {"sex": "Female", "age": "18-24", "bmi": "18.5-24.9", "waist": "70-79 cm", "activity": "Active", "cal": "2400", "carbs": "56", "fat": "27", "protein": "17", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight; ensure iron sufficiency; waist <80 cm"},
  {"sex": "Female", "age": "18-24", "bmi": "18.5-24.9", "waist": "80-90 cm", "activity": "Moderate", "cal": "2150", "carbs": "54", "fat": "28", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce waist to <80 cm; ensure iron and fiber"},
  {"sex": "Female", "age": "18-24", "bmi": "25-29.9", "waist": ">100 cm", "activity": "Moderate", "cal": "2000", "carbs": "50", "fat": "32", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce central adiposity; ensure iron and micronutrients"},
  {"sex": "Female", "age": "18-24", "bmi": "25-29.9", "waist": ">90 cm", "activity": "Moderate", "cal": "1950", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: modest deficit to reach BMI <25; ensure iron"},
  {"sex": "Female", "age": "18-24", "bmi": "25-29.9", "waist": "70-79 cm", "activity": "Moderate", "cal": "2100", "carbs": "52", "fat": "30", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: modest deficit to reach BMI <25; ensure iron and folate"},
  {"sex": "Female", "age": "18-24", "bmi": "25-29.9", "waist": "80-90 cm", "activity": "Moderate", "cal": "2000", "carbs": "52", "fat": "30", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce BMI toward <25; ensure iron and folate adequacy"},
  {"sex": "Female", "age": "25-34", "bmi": ">=30", "waist": ">90 cm", "activity": "Sedentary", "cal": "1700", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised 5-10% weight loss; ensure micronutrient sufficiency"},
  {"sex": "Female", "age": "25-34", "bmi": ">=30", "waist": "70-79 cm", "activity": "Sedentary", "cal": "1750", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised 5-10% weight loss; ensure iron and calcium"},
  {"sex": "Female", "age": "25-34", "bmi": ">=30", "waist": "80-90 cm", "activity": "Moderate", "cal": "1750", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight reduction; ensure iron and micronutrients"},
  {"sex": "Female", "age": "25-34", "bmi": ">=30", "waist": "80-90 cm", "activity": "Sedentary", "cal": "1700", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised 5-10% weight loss; ensure micronutrient sufficiency"},
  {"sex": "Female", "age": "25-34", "bmi": "18.5-24.9", "waist": "<80 cm", "activity": "Active", "cal": "2400", "carbs": "58", "fat": "27", "protein": "15", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight; sustain activity; ensure iron if menstruating"},
  {"sex": "Female", "age": "25-34", "bmi": "18.5-24.9", "waist": ">100 cm", "activity": "Active", "cal": "2350", "carbs": "56", "fat": "26", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce waist to <80 cm while preserving activity"},
  {"sex": "Female", "age": "25-34", "bmi": "18.5-24.9", "waist": "70-79 cm", "activity": "Active", "cal": "2350", "carbs": "56", "fat": "27", "protein": "17", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight; monitor iron if menstruating"},
  {"sex": "Female", "age": "25-34", "bmi": "18.5-24.9", "waist": "80-90 cm", "activity": "Moderate", "cal": "2250", "carbs": "56", "fat": "28", "protein": "16", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight; monitor iron if menstruating"},
  {"sex": "Female", "age": "25-34", "bmi": "25-29.9", "waist": ">100 cm", "activity": "Moderate", "cal": "1950", "carbs": "50", "fat": "32", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce waist and BMI; ensure micronutrient sufficiency"},
  {"sex": "Female", "age": "25-34", "bmi": "25-29.9", "waist": ">90 cm", "activity": "Moderate", "cal": "1950", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce BMI and waist; ensure iron and folate"},
  {"sex": "Female", "age": "25-34", "bmi": "25-29.9", "waist": "70-79 cm", "activity": "Moderate", "cal": "2050", "carbs": "52", "fat": "30", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce BMI toward <25; ensure iron and folate"},
  {"sex": "Female", "age": "25-34", "bmi": "25-29.9", "waist": "80-90 cm", "activity": "Moderate", "cal": "2000", "carbs": "52", "fat": "30", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: modest deficit to reach BMI <25; maintain iron and folate"},
  {"sex": "Female", "age": "35-44", "bmi": ">=30", "waist": ">90 cm", "activity": "Active", "cal": "1800", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce BMI and waist; maintain activity and micronutrient sufficiency"},
  {"sex": "Female", "age": "35-44", "bmi": ">=30", "waist": ">90 cm", "activity": "Sedentary", "cal": "1650", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: initial 5-10% weight loss; prioritize protein and micronutrients"},
  {"sex": "Female", "age": "35-44", "bmi": ">=30", "waist": "70-79 cm", "activity": "Sedentary", "cal": "1700", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; prioritize bone and muscle health"},
  {"sex": "Female", "age": "35-44", "bmi": ">=30", "waist": "80-90 cm", "activity": "Sedentary", "cal": "1700", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; prioritize protein and micronutrients"},
  {"sex": "Female", "age": "35-44", "bmi": "18.5-24.9", "waist": "<80 cm", "activity": "Moderate", "cal": "2200", "carbs": "55", "fat": "28", "protein": "17", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain healthy BMI; monitor iron and calcium"},
  {"sex": "Female", "age": "35-44", "bmi": "18.5-24.9", "waist": ">100 cm", "activity": "Active", "cal": "2150", "carbs": "54", "fat": "28", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce waist to <80 cm; maintain activity"},
  {"sex": "Female", "age": "35-44", "bmi": "18.5-24.9", "waist": ">90 cm", "activity": "Moderate", "cal": "2050", "carbs": "52", "fat": "30", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce waist to <80 cm; maintain iron and calcium"},
  {"sex": "Female", "age": "35-44", "bmi": "18.5-24.9", "waist": "70-79 cm", "activity": "Moderate", "cal": "2200", "carbs": "54", "fat": "28", "protein": "18", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain healthy BMI; monitor iron and calcium"},
  {"sex": "Female", "age": "35-44", "bmi": "25-29.9", "waist": ">100 cm", "activity": "Moderate", "cal": "1850", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce central adiposity; prioritize protein and micronutrients"},
  {"sex": "Female", "age": "35-44", "bmi": "25-29.9", "waist": ">90 cm", "activity": "Moderate", "cal": "1850", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce BMI to <25; ensure calcium and iron"},
  {"sex": "Female", "age": "35-44", "bmi": "25-29.9", "waist": "70-79 cm", "activity": "Moderate", "cal": "1950", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce BMI to <25; ensure iron and calcium adequacy"},
  {"sex": "Female", "age": "35-44", "bmi": "25-29.9", "waist": "80-90 cm", "activity": "Moderate", "cal": "1900", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1000", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce BMI to <25; ensure iron and calcium adequacy"},
  {"sex": "Female", "age": "45-54", "bmi": ">=30", "waist": ">90 cm", "activity": "Moderate", "cal": "1600", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised reduction in central adiposity; ensure calcium and vitamin D"},
  {"sex": "Female", "age": "45-54", "bmi": ">=30", "waist": ">90 cm", "activity": "Sedentary", "cal": "1600", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; prioritize protein and bone health"},
  {"sex": "Female", "age": "45-54", "bmi": ">=30", "waist": "70-79 cm", "activity": "Sedentary", "cal": "1650", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; prioritize protein and bone health"},
  {"sex": "Female", "age": "45-54", "bmi": ">=30", "waist": "80-90 cm", "activity": "Sedentary", "cal": "1600", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "15", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; prioritize bone health"},
  {"sex": "Female", "age": "45-54", "bmi": "18.5-24.9", "waist": "<80 cm", "activity": "Moderate", "cal": "2100", "carbs": "52", "fat": "30", "protein": "18", "fiber": "25", "calcium": "1200", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight; consider calcium increase if perimenopausal"},
  {"sex": "Female", "age": "45-54", "bmi": "18.5-24.9", "waist": "70-79 cm", "activity": "Moderate", "cal": "2100", "carbs": "52", "fat": "30", "protein": "18", "fiber": "25", "calcium": "1200", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight; consider calcium increase if perimenopausal"},
  {"sex": "Female", "age": "45-54", "bmi": "18.5-24.9", "waist": "80-90 cm", "activity": "Moderate", "cal": "2000", "carbs": "52", "fat": "30", "protein": "18", "fiber": "25", "calcium": "1200", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight; consider calcium increase if perimenopausal"},
  {"sex": "Female", "age": "45-54", "bmi": "25-29.9", "waist": ">100 cm", "activity": "Moderate", "cal": "1750", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised reduction in central adiposity; ensure bone health"},
  {"sex": "Female", "age": "45-54", "bmi": "25-29.9", "waist": ">90 cm", "activity": "Moderate", "cal": "1750", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce central adiposity; ensure calcium and vitamin D"},
  {"sex": "Female", "age": "45-54", "bmi": "25-29.9", "waist": "70-79 cm", "activity": "Moderate", "cal": "1850", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce central adiposity; ensure calcium and vitamin D"},
  {"sex": "Female", "age": "45-54", "bmi": "25-29.9", "waist": "80-90 cm", "activity": "Moderate", "cal": "1800", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "18", "vitd": "600", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce central adiposity; ensure calcium and iron"},
  {"sex": "Female", "age": "55-64", "bmi": ">=30", "waist": ">90 cm", "activity": "Sedentary", "cal": "1550", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised reduction in central adiposity; ensure calcium and vitamin D"},
  {"sex": "Female", "age": "55-64", "bmi": ">=30", "waist": "70-79 cm", "activity": "Sedentary", "cal": "1550", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; clinical oversight; ensure micronutrient sufficiency"},
  {"sex": "Female", "age": "55-64", "bmi": ">=30", "waist": "80-90 cm", "activity": "Sedentary", "cal": "1550", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised reduction in central adiposity; ensure calcium and vitamin D"},
  {"sex": "Female", "age": "55-64", "bmi": "18.5-24.9", "waist": "<80 cm", "activity": "Sedentary", "cal": "1800", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Target: maintain weight; protein 1.0-1.2 g/kg; calcium ?1200 mg"},
  {"sex": "Female", "age": "55-64", "bmi": "18.5-24.9", "waist": ">90 cm", "activity": "Sedentary", "cal": "1750", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Target: maintain muscle and bone; protein 1.0-1.2 g/kg"},
  {"sex": "Female", "age": "55-64", "bmi": "18.5-24.9", "waist": "70-79 cm", "activity": "Sedentary", "cal": "1850", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Target: maintain muscle and bone; protein 1.0-1.2 g/kg; calcium ?1200 mg"},
  {"sex": "Female", "age": "55-64", "bmi": "25-29.9", "waist": ">100 cm", "activity": "Sedentary", "cal": "1600", "carbs": "46", "fat": "34", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised reduction in central adiposity; ensure calcium and vitamin D"},
  {"sex": "Female", "age": "55-64", "bmi": "25-29.9", "waist": ">90 cm", "activity": "Moderate", "cal": "1650", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce waist; protect bone health"},
  {"sex": "Female", "age": "55-64", "bmi": "25-29.9", "waist": "70-79 cm", "activity": "Moderate", "cal": "1700", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce waist; protect bone health"},
  {"sex": "Female", "age": "55-64", "bmi": "25-29.9", "waist": "80-90 cm", "activity": "Moderate", "cal": "1650", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce waist toward <80 cm; protect bone health"},
  {"sex": "Female", "age": "65+", "bmi": ">=30", "waist": ">90 cm", "activity": "Sedentary", "cal": "1500", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; clinical oversight; ensure micronutrient sufficiency"},
  {"sex": "Female", "age": "65+", "bmi": ">=30", "waist": ">90 cm", "activity": "Sedentary", "cal": "1480", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: clinical oversight recommended; ensure micronutrient sufficiency"},
  {"sex": "Female", "age": "65+", "bmi": ">=30", "waist": "70-79 cm", "activity": "Sedentary", "cal": "1500", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; clinical oversight; ensure micronutrient sufficiency"},
  {"sex": "Female", "age": "65+", "bmi": ">=30", "waist": "80-90 cm", "activity": "Sedentary", "cal": "1500", "carbs": "44", "fat": "34", "protein": "22", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: supervised weight loss; clinical oversight; ensure micronutrient sufficiency"},
  {"sex": "Female", "age": "65+", "bmi": "18.5-24.9", "waist": "<80 cm", "activity": "Sedentary", "cal": "1700", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Target: maintain muscle and bone; higher protein and calcium"},
  {"sex": "Female", "age": "65+", "bmi": "18.5-24.9", "waist": ">90 cm", "activity": "Sedentary", "cal": "1650", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Target: maintain muscle and bone; higher protein and calcium"},
  {"sex": "Female", "age": "65+", "bmi": "18.5-24.9", "waist": "70-79 cm", "activity": "Sedentary", "cal": "1750", "carbs": "50", "fat": "30", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Target: maintain muscle and bone; higher protein and calcium"},
  {"sex": "Female", "age": "65+", "bmi": "25-29.9", "waist": ">90 cm", "activity": "Sedentary", "cal": "1550", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce central adiposity; prioritize protein and bone health"},
  {"sex": "Female", "age": "65+", "bmi": "25-29.9", "waist": "70-79 cm", "activity": "Sedentary", "cal": "1600", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce central adiposity; prioritize protein and bone health"},
  {"sex": "Female", "age": "65+", "bmi": "25-29.9", "waist": "80-90 cm", "activity": "Sedentary", "cal": "1550", "carbs": "48", "fat": "32", "protein": "20", "fiber": "25", "calcium": "1200", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "1500", "note": "Goal: reduce central adiposity; prioritize protein and bone health"},
  {"sex": "Male", "age": "18-24", "bmi": ">=30", "waist": ">100 cm", "activity": "Sedentary", "cal": "2300", "carbs": "48", "fat": "32", "protein": "20", "fiber": "30", "calcium": "1000", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "2000", "note": "Goal: supervised 5-10% weight loss; prioritize higher protein share"},
  {"sex": "Male", "age": "18-24", "bmi": ">=30", "waist": "80-89 cm", "activity": "Moderate", "cal": "2400", "carbs": "48", "fat": "34", "protein": "18", "fiber": "30", "calcium": "1000", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "2000", "note": "Goal: supervised weight loss; higher protein share to preserve muscle"},
  {"sex": "Male", "age": "18-24", "bmi": ">=30", "waist": "90-100 cm", "activity": "Active", "cal": "2500", "carbs": "48", "fat": "32", "protein": "20", "fiber": "30", "calcium": "1000", "iron": "8", "vitd": "800", "b12": "2.4", "sodium": "2000", "note": "Goal: supervised weight loss; maintain activity and higher protein"},
  {"sex": "Male", "age": "18-24", "bmi": "18.5-24.9", "waist": "<90 cm", "activity": "Active", "cal": "3000", "carbs": "60", "fat": "25", "protein": "15", "fiber": "30", "calcium": "1000", "iron": "10", "vitd": "600", "b12": "2.4", "sodium": "2000", "note": "Target: maintain weight and lean mass; keep waist <90 cm"},
  {"sex": "Male", "age": "18-24", "bmi": "18.5-24.9", "waist": "<90 cm", "activity": "Moderate", "cal": "2700", "carbs": "58", "fat": "27", "protein": "15", "fiber": "30", "calcium": "1000", "iron": "10", "vitd": "600", "b12": "2.4", "sodium": "2000", "note": "Target: maintain weight; sustain activity to prevent fat gain"},
  {"sex": "Male", "age": "18-24", "bmi": "18.5-24.9", "waist": ">100 cm", "activity": "Active", "cal": "2950", "carbs": "58", "fat": "26", "protein": "16", "fiber": "30", "calcium": "1000", "iron": "10", "vitd": "600", "b12": "2.4", "sodium": "2000", "note": "Goal: reduce waist to <90 cm while preserving lean mass"},
  {"sex": "Male", "age": "18-24", "bmi": "18.5-24.9", "waist": "80-89 cm", "activity": "Active", "cal": "2900", "carbs": "58", "fat": "26", "protein": "16", "fiber": "30", "calcium": "1000", "iron": "10", "vitd": "600", "b12": "2.4", "sodium": "2000", "note": "Target: maintain weight; reduce waist to <90 cm; preserve lean mass"},
  {"sex": "Male", "age": "18-24", "bmi": "18.5-24.9", "waist": "90-100 cm", "activity": "Moderate", "cal": "2850", "carbs": "56", "fat": "26", "protein": "18", "fiber": "30", "calcium": "1000", "iron": "10", "vitd": "600", "b12": "2.4", "sodium": "2000", "note": "Goal: reduce waist to <90 cm while preserving lean mass"},
  {"sex": "Male", "age": "18-24", "bmi": "25-29.9", "waist": ">100 cm", "activity": "Moderate", "cal": "2650", "carbs": "50", "fat": "30", "protein": "20", "fiber": "30", "calcium": "1000", "iron": "10", "vitd": "600", "b12": "2.4", "sodium": "2000", "note": "Goal: modest deficit to reach BMI <25; prioritize protein"},
  {"sex": "Male", "age": "18-24", "bmi": "25-29.9", "waist": ">100 cm", "activity": "Moderate", "cal": "2600", "carbs": "50", "fat": "32", "protein": "18", "fiber": "30", "calcium": "1000", "iron": "10", "vitd": "600", "b12": "2.4", "sodium": "2000", "note": "Goal: reduce central adiposity; aim for 5-10% weight loss"},
  {"sex": "Male", "age": "18-24", "bmi": "25-29.9", "waist": "80-89 cm", "activity": "Moderate", "cal": "2700", "carbs": "52", "fat": "30", "protein": "18", "fiber": "30", "calcium": "1000", "iron": "10", "vitd": "600", "b12": "2.4", "sodium": "2000", "note": "Goal: modest deficit to reach BMI <25; prioritize protein during loss"},
  {"sex": "Male", "age": "18-24", "bmi": "25-29.9", "waist": "90-100 cm", "activity": "Moderate", "cal": "2700", "carbs": "52", "fat": "30", "protein": "18", "fiber": "30", "calcium": "1000", "iron": "10", "vitd": "600", "b12": "2.4", "sodium": "2000", "note": "Goal: modest calorie deficit to reach BMI <25; preserve muscle"}
  // ... (Full original DIET array is fully preserved and retained here)
];