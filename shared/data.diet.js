// shared/data.diet.js
// KYH Dietary Engine
// -------------------------------------------------------
// Contains:
// 1. window.dietaryDiagnostics   (original)
// 2. window.DIET                 (original large calorie/macro table)
// 3. window.NUTRIENTS            (new ranked priorities)
// 4. window.FOOD_QUALITY         (new)
// 5. window.PREF_FOOD_EXAMPLES   (new)
// 6. window.CUISINE_EXTRAS       (new)
// -------------------------------------------------------

/* ============================================================
   1. ORIGINAL – Clinical Diagnostics Map
   ============================================================ */
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



/* ============================================================
   3. NEW – Food Quality Markers
   ============================================================ */
window.FOOD_QUALITY = [
  { id: "fruits",               label: "Fruits",                        type: "protective", nutrientsBoosted: ["Fibre","Potassium","Vitamin C"] },
  { id: "leafy_greens",         label: "Green / leafy vegetables",      type: "protective", nutrientsBoosted: ["Magnesium","Calcium","Fibre","Iron","Folate"] },
  { id: "legumes",              label: "Legumes, lentils & pulses",     type: "protective", nutrientsBoosted: ["Protein","Fibre","Iron","Magnesium","Zinc"] },
  { id: "nuts_seeds",           label: "Nuts & seeds",                  type: "protective", nutrientsBoosted: ["Fats","Magnesium","Zinc","Protein","Fibre"] },
  { id: "fried_ultraprocessed", label: "Fried / Ultra-processed",       type: "harmful",    nutrientsBoosted: ["Added Sugars / Refined Carbohydrates"] },
  { id: "sugary_drinks",        label: "Sugary drinks / sodas",         type: "harmful",    nutrientsBoosted: ["Added Sugars / Refined Carbohydrates"] }
];

window.FOOD_QUALITY_OPTIONS = ["Daily", "3-5x/Wk", "1-2x/Wk", "Rarely"];

/* ============================================================
   4. NEW – Nutrient Priorities (used for ranking on diet.html)
   ============================================================ */
window.NUTRIENTS = [
  {
    nutrient: "Protein",
    profile: "Low Risk;Metabolic;Mixed",
    note: "Essential amino acids for muscle repair, enzymes, immune function and satiety",
    symptoms: ["Fatigue", "Low Energy", "Muscle Weakness", "Hair Loss", "Underweight", "Recovery Fatigue", "Immune Weakness"],
    direction: "optimize"
  },
  {
    nutrient: "Carbohydrates",
    profile: "Low Risk;Metabolic",
    note: "Primary fuel source; fibre quality matters more than total grams",
    symptoms: ["Fatigue", "Low Energy", "Bloating", "Sugar Cravings", "Brain Fog", "Poor Concentration"],
    direction: "optimize"
  },
  {
    nutrient: "Fats",
    profile: "Low Risk;Metabolic;Cardiovascular",
    note: "Hormone production, cell membranes and fat-soluble vitamin absorption",
    symptoms: ["Dry Skin", "Fatigue", "Inflammation", "Brain Fog", "Hair Loss", "Mood Swings"],
    direction: "optimize"
  },
  {
    nutrient: "Fibre",
    profile: "Low Risk;Metabolic",
    note: "Gut motility, microbiome diversity and blood-sugar buffering",
    symptoms: ["Bloating", "Constipation", "Sugar Cravings", "High Cholesterol", "Gut Health"],
    direction: "optimize"
  },
  {
    nutrient: "Added Sugars / Refined Carbohydrates",
    profile: "Metabolic;Mixed",
    note: "Limit for blood-sugar stability, inflammation control and gut health",
    symptoms: ["Sugar Cravings", "Emotional Eating", "Fatigue", "Bloating", "Brain Fog", "Overweight", "Obesity"],
    direction: "limit"
  },
  {
    nutrient: "Vitamin D",
    profile: "Low Risk;Metabolic;Mixed",
    note: "Bone health, immune modulation, mood and muscle function",
    symptoms: ["Fatigue", "Low Energy", "Muscle Weakness", "Depression", "Brain Fog", "Back Pain", "Joint Stiffness"],
    direction: "optimize"
  },
  {
    nutrient: "Magnesium",
    profile: "Low Risk;Metabolic;Mixed",
    note: "Sleep, stress response, muscle relaxation and glucose metabolism",
    symptoms: ["Fatigue", "Low Energy", "Insomnia", "Anxiety", "Constipation", "Brain Fog", "Muscle Weakness", "Leg Cramps"],
    direction: "optimize"
  },
  {
    nutrient: "Iron",
    profile: "Low Risk;Mixed",
    note: "Oxygen transport and energy production",
    symptoms: ["Fatigue", "Low Energy", "Hair Loss", "Brain Fog", "Cold Intolerance"],
    direction: "optimize"
  },
  {
    nutrient: "Vitamin B12",
    profile: "Low Risk;Mixed",
    note: "Nerve health, red blood cell formation and energy metabolism",
    symptoms: ["Fatigue", "Low Energy", "Brain Fog", "Poor Concentration", "Numbness or Tingling", "Memory Loss"],
    direction: "optimize"
  },
  {
    nutrient: "Omega-3 (EPA/DHA)",
    profile: "Low Risk;Cardiovascular;Metabolic",
    note: "Anti-inflammatory support for brain, eyes and cardiovascular health",
    symptoms: ["Inflammation", "Brain Fog", "Mood Swings", "Dry Skin", "Joint Stiffness", "High Cholesterol"],
    direction: "optimize"
  },
  {
    nutrient: "Zinc",
    profile: "Low Risk;Mixed",
    note: "Immune function, skin, hair and hormone support",
    symptoms: ["Hair Loss", "Immune Weakness", "Frequent Infections", "Skin Acne", "Low Energy"],
    direction: "optimize"
  },
  {
    nutrient: "Calcium",
    profile: "Low Risk;Metabolic",
    note: "Bone density, muscle contraction and nerve signalling",
    symptoms: ["Muscle Weakness", "Back Pain", "Osteoporosis", "Leg Cramps", "Joint Stiffness"],
    direction: "optimize"
  },
  {
    nutrient: "Potassium",
    profile: "Low Risk;Cardiovascular;Metabolic",
    note: "Blood pressure regulation and muscle function",
    symptoms: ["Muscle Weakness", "Fatigue", "High Blood Pressure", "Leg Cramps"],
    direction: "optimize"
  },
  {
    nutrient: "Chromium",
    profile: "Metabolic",
    note: "Insulin sensitivity and glucose handling",
    symptoms: ["Sugar Cravings", "Fatigue", "Emotional Eating"],
    direction: "optimize"
  }
];

/* ============================================================
   5. NEW – Food examples by dietary preference
   ============================================================ */
window.PREF_FOOD_EXAMPLES = {
  "Vegan": {
    "Protein": "tofu, tempeh, lentils, chickpeas, edamame, seitan",
    "Carbohydrates": "oats, quinoa, brown rice, millets, sweet potato",
    "Fats": "walnuts, flaxseed, chia seeds, olive oil, avocado",
    "Fibre": "lentils, chickpeas, oats, chia, vegetables, berries",
    "Added Sugars / Refined Carbohydrates": "limit sugary drinks, desserts, white bread, packaged snacks",
    "Vitamin D": "fortified plant milks, UV-exposed mushrooms, sunlight",
    "Magnesium": "pumpkin seeds, almonds, spinach, black beans",
    "Iron": "lentils, tofu, pumpkin seeds, spinach + vitamin C source",
    "Vitamin B12": "fortified plant milk, nutritional yeast, fortified cereals",
    "Omega-3 (EPA/DHA)": "flaxseed, chia seeds, walnuts, algae oil",
    "Zinc": "pumpkin seeds, lentils, chickpeas, cashews",
    "Calcium": "fortified plant milk, calcium-set tofu, sesame seeds, tahini",
    "Potassium": "banana, sweet potato, spinach, avocado, coconut water",
    "Chromium": "broccoli, green beans, whole grains"
  },
  "Vegetarian": {
    "Protein": "paneer, curd/yogurt, lentils, chickpeas, beans, milk",
    "Carbohydrates": "oats, brown rice, millets, whole wheat, quinoa",
    "Fats": "nuts, seeds, ghee (moderation), olive oil, avocado",
    "Fibre": "lentils, oats, vegetables, fruit, whole grains",
    "Added Sugars / Refined Carbohydrates": "limit sweets, sugary drinks, refined flour items",
    "Vitamin D": "milk, curd, fortified cereals, sunlight",
    "Magnesium": "pumpkin seeds, almonds, spinach, yogurt",
    "Iron": "lentils, beans, paneer, spinach + vitamin C",
    "Vitamin B12": "milk, curd, paneer, fortified cereals",
    "Omega-3 (EPA/DHA)": "flaxseed, chia, walnuts (consider algae oil)",
    "Zinc": "pumpkin seeds, lentils, cashews, dairy",
    "Calcium": "milk, curd, paneer, sesame seeds",
    "Potassium": "banana, yogurt, spinach, coconut water, potato",
    "Chromium": "broccoli, whole grains"
  },
  "Eggetarian": {
    "Protein": "eggs, paneer, curd, lentils, chickpeas",
    "Carbohydrates": "oats, brown rice, millets, whole wheat, quinoa",
    "Fats": "egg yolk, nuts, seeds, olive oil, ghee (moderation)",
    "Fibre": "lentils, oats, vegetables, fruit",
    "Added Sugars / Refined Carbohydrates": "limit sweets, sugary drinks, refined snacks",
    "Vitamin D": "egg yolk, milk, curd, fortified cereals, sunlight",
    "Magnesium": "pumpkin seeds, almonds, spinach, yogurt",
    "Iron": "eggs, lentils, spinach + vitamin C",
    "Vitamin B12": "eggs, milk, curd, paneer",
    "Omega-3 (EPA/DHA)": "eggs (omega-3 enriched if available), flax, chia, walnuts",
    "Zinc": "eggs, pumpkin seeds, lentils, dairy",
    "Calcium": "milk, curd, paneer, sesame seeds",
    "Potassium": "banana, yogurt, spinach, potato",
    "Chromium": "broccoli, whole grains, egg yolk"
  },
  "Jain": {
    "Protein": "milk, curd, paneer, split lentils (dhals), beans (no root vegetables)",
    "Carbohydrates": "rice, whole wheat, millets, oats, quinoa",
    "Fats": "nuts, seeds, ghee, olive oil",
    "Fibre": "split lentils, oats, allowable vegetables and fruit",
    "Added Sugars / Refined Carbohydrates": "limit sweets, sugary drinks, refined flour",
    "Vitamin D": "milk, curd, paneer, sunlight",
    "Magnesium": "pumpkin seeds, almonds, allowable greens, dairy",
    "Iron": "lentils, sesame seeds + vitamin C",
    "Vitamin B12": "milk, curd, paneer",
    "Omega-3 (EPA/DHA)": "flaxseed, chia seeds, walnuts",
    "Zinc": "pumpkin seeds, lentils, dairy, cashews",
    "Calcium": "milk, curd, paneer, sesame seeds",
    "Potassium": "banana, yogurt, allowable fruits & vegetables",
    "Chromium": "whole grains, allowable vegetables"
  },
  "Pescatarian": {
    "Protein": "fish, seafood, eggs, lentils, paneer, yogurt",
    "Carbohydrates": "brown rice, oats, millets, quinoa, whole wheat",
    "Fats": "fatty fish, nuts, seeds, olive oil",
    "Fibre": "lentils, oats, vegetables, fruit",
    "Added Sugars / Refined Carbohydrates": "limit sugary drinks, desserts, refined snacks",
    "Vitamin D": "fatty fish, egg yolk, fortified milk, sunlight",
    "Magnesium": "pumpkin seeds, almonds, spinach, fish",
    "Iron": "fish, lentils, spinach + vitamin C",
    "Vitamin B12": "fish, seafood, eggs, dairy",
    "Omega-3 (EPA/DHA)": "salmon, sardines, mackerel, anchovies",
    "Zinc": "fish, pumpkin seeds, lentils, dairy",
    "Calcium": "milk, curd, yogurt, fish with soft bones (sardines)",
    "Potassium": "banana, yogurt, spinach, fish, potato",
    "Chromium": "broccoli, whole grains"
  },
  "Non-Vegetarian": {
    "Protein": "chicken, fish, eggs, lean meat, lentils, paneer",
    "Carbohydrates": "brown rice, whole wheat, oats, millets, quinoa",
    "Fats": "fatty fish, nuts, seeds, olive oil, egg yolk",
    "Fibre": "lentils, oats, vegetables, fruit, whole grains",
    "Added Sugars / Refined Carbohydrates": "limit sugary drinks, desserts, processed snacks",
    "Vitamin D": "fatty fish, egg yolk, fortified milk, sunlight",
    "Magnesium": "pumpkin seeds, almonds, spinach, fish, yogurt",
    "Iron": "red meat (moderation), chicken, fish, lentils + vitamin C",
    "Vitamin B12": "meat, fish, eggs, dairy",
    "Omega-3 (EPA/DHA)": "salmon, sardines, mackerel, walnuts, flax",
    "Zinc": "meat, pumpkin seeds, lentils, dairy",
    "Calcium": "milk, curd, yogurt, fish with bones, sesame",
    "Potassium": "banana, yogurt, spinach, potato, meat",
    "Chromium": "broccoli, whole grains"
  }
};

/* ============================================================
   6. NEW – Cuisine extras
   ============================================================ */
window.CUISINE_EXTRAS = {
  "Indian": {
    "Protein": "dal, sambar, idli, dosa (with sambar/chutney), paneer, curd, sprouts",
    "Carbohydrates": "rice, idli, dosa, poori (occasional), whole-wheat roti, millets",
    "Fats": "ghee (moderation), groundnut oil, sesame, coconut (regional)",
    "Fibre": "sabji, sambar, dal, salads, millets",
    "Added Sugars / Refined Carbohydrates": "limit sweetened coffee, mithai, sugary drinks, maida snacks",
    "Magnesium": "dal, leafy sabji, seeds, nuts, millets",
    "Iron": "dal, sambar, dark leafy sabji + lemon/amla",
    "Calcium": "curd, buttermilk, raita, sesame (til), paneer",
    "Omega-3 (EPA/DHA)": "flaxseed (alsi), walnuts",
    "Zinc": "dal, seeds, nuts, whole grains",
    "Potassium": "coconut water, banana, sabji, curd, potato",
    "Vitamin D": "sunlight + fortified milk / curd",
    "Vitamin B12": "milk, curd, paneer",
    "Chromium": "whole grains, broccoli"
  },
  "Mediterranean": {
    "Protein": "Greek yogurt, lentils, chickpeas, fish",
    "Fats": "extra-virgin olive oil, olives, tahini",
    "Omega-3 (EPA/DHA)": "sardines, mackerel, anchovies"
  },
  "East Asian": {
    "Protein": "tofu, edamame, fish",
    "Fats": "sesame oil, sesame seeds",
    "Calcium": "calcium-set tofu, fortified soy milk"
  },
  "Middle Eastern": {
    "Protein": "labneh, lentils, chickpeas, fava",
    "Fats": "tahini, olive oil"
  },
  "Western / Continental": {
    "Protein": "Greek yogurt, cottage cheese, eggs, chicken/fish",
    "Fats": "olive oil, avocado, nuts"
  }
};

