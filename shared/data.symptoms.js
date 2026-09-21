// JavaScript source code
// shared/data.symptoms.js

window.SYMPTOM_CATEGORIES = [
  {
    name: 'Known conditions', 
    items: [
      'High Blood Pressure', 'Low Blood Pressure', 'Diabetes', 
      'High Cholesterol', 'Thyroid Disorder', 
      // Newly added mapped conditions from flagged labs:
      'Vitamin D Deficiency', 'Iron Deficiency', 'B12 Deficiency', 'Calcium Deficiency'
    ]
  },
  {
    name: 'Energy, Sleep & Mood', 
    items: ['Insomnia', 'Fatigue', 'Low Energy', 'Restlessness', 'Stress', 'Anxiety', 'Depression', 'Mood Swings', 'Irritability', 'Burnout', 'Snoring']
  },
  {
    name: 'Musculoskeletal & Joints', 
    items: ['Back Pain', 'Neck Pain', 'Shoulder Pain', 'Knee Pain', 'Hip Pain', 'Leg Pain', 'Foot Pain', 'Toe Pain', 'Leg Cramps', 'Sciatica', 'Arthritis', 'Osteoporosis', 'Carpal Tunnel', 'Frozen Shoulder', 'Joint Stiffness', 'Poor Posture', 'Slouching', 'Weak Core', 'Muscle Weakness', 'Balance Issues', 'Sports Injury', 'Sprain', 'Strain', 'Recovery Fatigue', 'Overtraining', 'Plantar Fasciitis']
  },
  {
    name: 'Digestive', 
    items: ['Indigestion', 'Acid Reflux', 'Constipation', 'Diarrhea', 'Bloating', 'Irritable Bowel Syndrome', 'Gastritis', 'Ulcer', 'Nausea', 'Vomiting', 'Gut Health', 'Hemorrhoids', 'Loss of Appetite', 'Blood in Stool']
  },
  {
    name: 'Heart & Circulation', 
    items: ['Heart Palpitations', 'Chest Pain', 'Poor Circulation', 'Varicose Veins', 'Edema', 'Swelling', 'Fainting / Passing Out']
  },
  {
    name: 'Weight & Metabolic', 
    items: ['Obesity', 'Overweight', 'Underweight', 'Weight Loss', 'Sugar Cravings', 'Emotional Eating', 'Excessive Thirst']
  },
  {
    name: 'Hormonal & Reproductive', 
    items: ['PCOS', 'Menstrual Pain', 'Menopause Symptoms', 'Hot Flashes', 'Night Sweats', 'Infertility', 'Pregnancy Discomfort', 'Postpartum Recovery']
  },
  {
    name: 'Head & Neurological', 
    items: ['Migraine', 'Headache', 'Vertigo', 'Memory Loss', 'Poor Concentration', 'Brain Fog', 'Cognitive Decline', 'Numbness or Tingling']
  },
  {
    name: 'Respiratory & Allergy', 
    items: ['Asthma', 'Bronchitis', 'Shortness of Breath', 'Allergies', 'Cold', 'Sinus Congestion', 'Chronic Cough']
  },
  {
    name: 'Skin & Hair', 
    items: ['Skin Acne', 'Eczema', 'Psoriasis', 'Dry Skin', 'Hair Loss', 'Dandruff', 'Itching', 'Skin Rash', 'Bruising Easily', 'Sweaty Hands']
  },
  {
    name: 'Urinary, Liver & Kidney', 
    items: ['Urinary Tract Infection', 'Kidney Stones', 'Frequent Urination', 'Liver Disorder', 'Fatty Liver', 'Gallstones', 'Pancreatitis']
  },
  {
    name: 'Eyes, Ears & Mouth', 
    items: ['Eye Strain', 'Eye Dryness', 'Watery Eyes', 'Hearing Loss', 'Dental Pain', 'Mouth Ulcers', 'Jaw Pain', 'Blurry Vision', 'Ringing in Ears']
  },
  {
    name: 'Immune & General', 
    items: ['Immune Weakness', 'Frequent Infections', 'Fever', 'Inflammation', 'Cold Intolerance', 'Heat Intolerance', 'Palpable Lump']
  }
];

window.FEMALE_ONLY_SYMPTOMS = new Set([
  'PCOS', 'Menstrual Pain', 'Menopause Symptoms', 'Pregnancy Discomfort', 'Postpartum Recovery'
]);