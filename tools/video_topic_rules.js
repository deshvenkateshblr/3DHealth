/* Rules that map a video's title / tags to the app's own topics (the 130 symptoms in
   shared/data.symptoms.js plus the profile-derived context tags). Reviewed and edited by hand;
   `node tools/build_video_topics.js` turns them into shared/data.videotopics.js and an audit CSV.

   kw  : regex sources. A match must START at a word boundary (so stems like "diabet" work);
         add \\b at the end where a whole word is needed (e.g. "ibs\\b").
   not : if any of these match the same text, the keyword match is ignored (disambiguation).
   basis: 'text' (the words say so) or 'tradition' (yoga-pose-name knowledge; needs an expert's check).
*/
const R = {};
const add = (topic, kw, opts) => { R[topic] = Object.assign({ kw }, opts || {}); };
const alias = (topic, other) => { R[topic] = R[other]; };

/* ---- Known conditions ---- */
add('High Blood Pressure', ['high bp\\b', 'high blood pressure', 'hypertension', 'blood pressure', 'lower bp\\b', 'bp control']);
add('Low Blood Pressure', ['low blood pressure', 'hypotension', 'low bp\\b']);
add('Diabetes', ['diabet', 'prediabet', 'hba1c', 'beta-cell', 'type 2']);
add('High Cholesterol', ['cholesterol', '\\bldl\\b', 'blood lipid', 'triglycerid', '\\bstatin']);
add('Thyroid Disorder', ['thyroid', 'hashimoto', '\\btsh\\b']);
add('Vitamin D Deficiency', ['vitamin d\\b', 'vitamin-d']);
add('Iron Deficiency', ['iron deficien', 'anemi', 'anaemi', 'low iron', 'iron-rich', 'iron rich', 'haemoglobin', 'hemoglobin']);
add('B12 Deficiency', ['\\bb12\\b', 'vitamin b12']);
add('Calcium Deficiency', ['calcium']);

/* ---- Energy, sleep & mood ---- */
add('Insomnia', ['insomnia', 'sleepless', "can'?t sleep", 'trouble sleeping', '(better|good|deep|restful|quality|healthy) sleep', 'sleep (better|quality|routine|hygiene|tips|aid)', 'fall asleep', 'bedtime (routine|yoga|stretch|ritual)', 'bed ?time yoga', 'yoga nidra', 'sleep cycle', 'sleep schedule'], { not: ['sleep position', 'sleep apnea'] });
alias('Sleep', 'Insomnia');
add('Fatigue', ['fatigue', '\\btired', 'low energy', 'energy level', 'boost (your )?energy', 'energy boost', 'exhaust', 'sluggish', 'wake up fresh', 'vitality'], { not: ['recovery fatigue'] });
alias('Low Energy', 'Fatigue');
add('Restlessness', ['restless']);
add('Stress', ['stress relief', 'stress\\b', '\\bcalm\\b', 'relaxation', '\\brelax', 'cortisol', 'wind down', 'tension relief'], { not: ['stress test', 'stress fracture', 'stress incontinence'] });
add('Anxiety', ['anxiety', 'anxious', 'panic', 'vagus', 'vagal', 'nervous system', 'trauma recovery', 'voo breath']);
add('Depression', ['depress', 'low mood', 'mental health']);
add('Mood Swings', ['mood swing', 'emotional regulation', 'mood\\b']);
add('Irritability', ['irritab', 'anger']);
add('Burnout', ['burnout', 'burn out']);
add('Snoring', ['snor', 'sleep apnea', 'oropharyngeal']);

/* ---- Musculoskeletal & joints ---- */
add('Back Pain', ['back pain', 'backache', 'lower back', 'upper back', 'spine', 'spinal', 'lumbar', 'sphinx pose']);
add('Neck Pain', ['neck pain', 'neck stiff', 'stiff neck', 'neck stretch', 'cervical', 'neck movement', 'neck exercise', '\\bneck\\b']);
add('Shoulder Pain', ['shoulder pain', 'shoulder movement', 'shoulder mobility', 'rotator', 'pendulum', 'shoulder stretch', 'shoulder exercise']);
add('Knee Pain', ['knee pain', 'knee strength', 'knee movement', 'knee exercise', '\\bknees?\\b']);
add('Hip Pain', ['hip pain', 'hip mobility', 'hip stretch', 'hip exercise', 'clam ?shell', '90 ?/? ?90']);
add('Leg Pain', ['leg pain', 'calf pain', 'pair mein dard', 'pain in (the )?legs?', 'leg pain gets worse'], { not: ['leg ulcer'] });
add('Foot Pain', ['foot pain', 'heel pain', 'plantar', 'foot (stretch|exercise)', 'towel scrunch']);
add('Toe Pain', ['toe pain', 'bunion']);
add('Leg Cramps', ['leg cramp', 'night cramp', 'muscle cramp', 'charley horse']);
add('Sciatica', ['sciatic']);
add('Arthritis', ['arthritis', 'rheumat', 'osteoarth']);
add('Osteoporosis', ['osteopor', 'bone density', 'bone strength', 'strengthen bone', 'strong bones', 'bone health', 'heel drop']);
add('Carpal Tunnel', ['carpal', 'wrist']);
add('Frozen Shoulder', ['frozen shoulder', 'adhesive capsulitis']);
add('Joint Stiffness', ['joint pain', 'joint stiff', 'stiff joint', 'joint mobility', 'stiff body', 'stiffness', 'joint relief', 'body pain relief', 'trunk movement', 'knee movement', 'shoulder movement', 'neck movement'], { basis: 'text' });
add('Poor Posture', ['posture', 'postural', 'wall angel', 'chin tuck', 'scapular', 'rounded shoulder', 'tadasana'], { basis: 'text' });
add('Slouching', ['slouch', 'rounded shoulder', 'hunch']);
add('Weak Core', ['core strength', 'core stability', 'core workout', 'dead bug', '\\bplank', 'bird.?dog', 'transverse abdominis']);
add('Muscle Weakness', ['muscle weakness', 'weak muscle', 'sarcopeni', 'build muscle', 'muscle mass', 'legs? get weak', 'weak legs', 'strength training', 'strength routine', 'farmers? carry', 'resistance band', 'step-?ups?', 'wall sit']);
add('Balance Issues', ['balance', 'fall prevention', 'single leg', 'tai chi', 'one leg', 'vrikshasana', 'vrikshaasan', 'weight shift']);
add('Sports Injury', ['sports injur', 'injury prevention', 'injury rehab', '\\brehab']);
add('Sprain', ['sprain', 'ankle alphabet']);
add('Strain', ['muscle strain', 'pulled muscle', 'hamstring strain']);
add('Recovery Fatigue', ['workout recovery', 'recovery day', 'active recovery', 'foam roll']);
add('Overtraining', ['overtrain', 'over-train']);
add('Plantar Fasciitis', ['plantar fasci', 'heel pain']);

/* ---- Digestive ---- */
add('Indigestion', ['indigestion', 'digestion', 'digestive', 'dyspepsia', 'vajrasana', 'pavanamukt', 'pawanmukt']);
add('Acid Reflux', ['acid reflux', '\\bgerd\\b', 'heartburn', 'acidity']);
add('Constipation', ['constipation', 'bowel movement', 'regular bowel', 'pavanamukt', 'pawanmukt']);
add('Diarrhea', ['diarrh', 'loose motion']);
add('Bloating', ['bloat', 'flatulence', 'abdominal pain', 'pavanamukt', 'pawanmukt', 'gas relief']);
add('Irritable Bowel Syndrome', ['\\bibs\\b', 'irritable bowel']);
add('Gastritis', ['gastritis', 'stomach lining']);
add('Ulcer', ['peptic ulcer', 'stomach ulcer', 'gastric ulcer', 'duodenal ulcer', 'stomach (sore|lining)'], { not: ['leg ulcer', 'venous ulcer', 'foot ulcer', 'diabetic ulcer', 'wound'] });
add('Nausea', ['nausea', 'nauseous']);
add('Vomiting', ['vomit']);
add('Gut Health', ['gut health', '\\bgut\\b', 'microbiome', 'probiotic', 'fermented', 'digestive health']);
add('Hemorrhoids', ['hemorrhoid', 'haemorrhoid', '\\bpiles\\b']);
add('Loss of Appetite', ['appetite']);
add('Blood in Stool', ['blood in (the )?stool', 'rectal bleeding']);

/* ---- Heart & circulation ---- */
add('Heart Palpitations', ['palpitation', 'irregular heart', '\\bafib', 'arrhythmia', 'heart rate']);
add('Chest Pain', ['chest pain', 'angina', 'heart attack']);
add('Poor Circulation', ['circulation', 'blood flow', 'blocked arter', 'blocked leg', 'peripheral arter', 'peripheral vascular', '\\barteries\\b', '\\bartery\\b', '\\bdvt\\b', 'blood clot', 'vascular (health|disease|problem)', 'blood vessel', 'wound hasn']);
add('Varicose Veins', ['varicose', 'spider vein', 'venous insufficiency', 'vein (laser|treatment|doctor)', 'compression stocking']);
add('Edema', ['edema', 'oedema', 'swollen', 'swelling', 'legs? swell', 'heavy legs']);
alias('Swelling', 'Edema');
add('Fainting / Passing Out', ['faint', 'syncope', 'passing out']);

/* ---- Weight & metabolic ---- */
add('Obesity', ['obesity', 'obese']);
add('Overweight', ['overweight', 'weight gain', 'belly fat', 'fat loss', 'lose weight', 'weight loss', 'fat burn', 'flat belly', 'burn fat']);
add('Weight Loss', ['weight loss', 'lose weight', 'fat loss', 'fat burn', 'burn fat', 'belly fat', 'flat belly', 'weight management', 'healthy weight', 'body weight', 'liss', 'cardio']);
add('Underweight', ['underweight', 'gain weight', 'healthy weight gain']);
add('Sugar Cravings', ['sugar craving', 'cravings', 'sweet tooth', 'sugar addiction']);
add('Sugar', ['sugar\\b', 'sugary', 'sweetener', 'sugar alternative']);
add('Emotional Eating', ['emotional eating', 'overeating', 'binge', 'stress eating']);
add('Excessive Thirst', ['excessive thirst', '\\bthirst']);
add('Belly Fat', ['belly fat', 'flat belly', 'visceral fat', 'abdominal fat', 'tummy', '\\bwaist']);
add('Blood Sugar', ['blood sugar', 'glucose', 'glycemic', '\\bcgm\\b', 'sugar spike', 'blood-sugar']);
add('Insulin Resistance', ['insulin resist', 'insulin sensitiv', 'insulin\\b', 'beta-cell']);
add('Ultra-Processed Foods', ['ultra-?processed', '\\bupf\\b', 'processed food', 'junk food', 'packaged food']);
add('Healthy Eating', ['healthy eating', 'healthy diet', 'balanced diet', 'nutrition', 'diet plan', 'what to eat', 'superfood', 'in your diet', 'daily diet', 'recipes?', 'eating habits']);

/* ---- Hormonal & reproductive ---- */
add('PCOS', ['pcos', 'pcod', 'polycystic']);
add('Menstrual Pain', ['period pain', 'menstrual', 'period cramp', 'dysmenorr']);
add('Menopause Symptoms', ['menopaus']);
alias('Menopause', 'Menopause Symptoms');
add('Hot Flashes', ['hot flash', 'hot flush']);
add('Night Sweats', ['night sweat']);
add('Infertility', ['infertil', 'fertility', 'conceive', 'conception', 'trying to get pregnant']);
add('Pregnancy Discomfort', ['pregnan', 'prenatal', 'expecting mother']);
add('Postpartum Recovery', ['postpartum', 'post-partum', 'postnatal', 'post-natal', 'after delivery']);

/* ---- Head & neurological ---- */
add('Migraine', ['migraine']);
add('Headache', ['headache', 'head ache']);
add('Vertigo', ['vertigo', 'dizz']);
add('Memory Loss', ['memory', 'forgetful']);
add('Poor Concentration', ['concentration', 'focus\\b', 'mental clarity', 'brain exercise']);
add('Brain Fog', ['brain fog', 'mental clarity', 'brain exercise']);
add('Cognitive Decline', ['cognitive', 'dementia', 'alzheimer', 'brain health', 'brain exercise']);
add('Numbness or Tingling', ['numb', 'tingling', 'neuropath', 'nerve pain', 'pins and needles', 'nerve, artery']);

/* ---- Respiratory & allergy ---- */
add('Asthma', ['asthma']);
add('Bronchitis', ['bronchitis']);
add('Shortness of Breath', ['shortness of breath', 'breathless', 'lung capacity', 'lung health', 'pulmonary (rehab|function)', 'pursed.?lip', 'breathing (exercise|workshop)', 'better breathing', 'diaphragmatic', 'belly breathing']);
add('Allergies', ['allerg', 'hay fever']);
add('Cold', ['cold and cough', 'common cold', 'cold remed', 'cold relief', 'cough and cold', '\\bflu\\b', 'seasonal flu']);
add('Sinus Congestion', ['sinus', 'nasal congestion', 'blocked nose', 'stuffy nose']);
add('Chronic Cough', ['chronic cough', '\\bcough']);

/* ---- Skin & hair ---- */
add('Skin Acne', ['acne', 'pimple']);
add('Eczema', ['eczema']);
add('Psoriasis', ['psoria']);
add('Dry Skin', ['dry skin', 'skin glow', 'glowing skin', 'skincare', 'skin care']);
add('Hair Loss', ['hair fall', 'hair loss', 'hair growth', 'haircare', 'hair care', 'hair health']);
add('Dandruff', ['dandruff']);
add('Itching', ['\\bitch']);
add('Skin Rash', ['\\brash']);
add('Bruising Easily', ['bruis']);
add('Sweaty Hands', ['sweaty hands', 'hyperhidrosis']);

/* ---- Urinary, liver & kidney ---- */
add('Urinary Tract Infection', ['urinary tract', '\\buti\\b']);
add('Kidney Stones', ['kidney stone']);
add('Frequent Urination', ['frequent urination', 'urinary frequency', 'bladder']);
add('Liver Disorder', ['liver', 'hepat']);
add('Fatty Liver', ['fatty liver', 'nafld', 'liver fat']);
add('Gallstones', ['gallstone', 'gall bladder', 'gallbladder']);
add('Pancreatitis', ['pancrea']);

/* ---- Eyes, ears & mouth ---- */
add('Eye Strain', ['eye strain', 'eye yoga', 'eye exercise', 'screen time', 'palming', 'convergence']);
add('Eye Dryness', ['dry eye']);
add('Watery Eyes', ['watery eye']);
add('Hearing Loss', ['hearing']);
add('Dental Pain', ['dental', 'tooth', 'teeth', '\\bgum']);
add('Mouth Ulcers', ['mouth ulcer', 'canker']);
add('Jaw Pain', ['jaw', '\\btmj\\b', 'masseter']);
add('Blurry Vision', ['blurry vision', 'eyesight', 'vision problem']);
add('Ringing in Ears', ['tinnitus', 'ringing in']);

/* ---- Immune & general ---- */
add('Immune Weakness', ['immun']);
add('Frequent Infections', ['infection', 'get(ting)? sick', 'avoid getting sick']);
add('Fever', ['fever', 'dengue', 'typhoid']);
add('Inflammation', ['inflammat']);
add('Cold Intolerance', ['cold intolerance']);
add('Heat Intolerance', ['heat intolerance']);
add('Palpable Lump', ['\\blump\\b', 'nodule', '\\bcyst\\b']);

/* ---- Context-only tags the app derives from the profile ---- */
add('Beginner Workout', ['beginner', 'no equipment', 'easy workout', 'chair yoga', 'gentle', 'low impact', 'low-impact', 'zero-minute']);

/* ---- Yoga-tradition associations (pose / practice name -> usual teaching). Need an expert's check. ---- */
const T = (topic, kw) => { if (!R[topic]) add(topic, []); R[topic].tradition = (R[topic].tradition || []).concat(kw); };
T('Stress',         ['bhramari', 'nadi ?sho', 'nadisho', 'anuloma', 'sheetali', 'shav?asana', 'shawasana', 'makarasana', 'dhyan', 'meditation']);
T('Anxiety',        ['bhramari', 'nadi ?sho', 'nadisho', 'anuloma']);
T('Insomnia',       ['shav?asana', 'shawasana', 'makarasana', 'yoga nidra']);
T('Back Pain',      ['bhujang', 'shalabhasana', 'setubandh', 'ardha chakrasana', 'ustrasana', 'ushtrasana', 'trunk movement', 'uttana padasana', 'ardhahalasana']);
T('Poor Posture',   ['tadasana', 'trikon', 'ardha chakrasana']);
T('Balance Issues', ['vriksh']);
T('Indigestion',    ['vajrasana', 'vakrasana', 'ardha matsyendrasana', 'pavanamukt', 'pawanmukt']);
T('Bloating',       ['pavanamukt', 'pawanmukt']);
T('Constipation',   ['pavanamukt', 'pawanmukt', 'vakrasana', 'ardha matsyendrasana', 'padahastasana', 'padhastasana']);
T('Neck Pain',      ['neck movement']);
T('Shoulder Pain',  ['shoulder movement', 'sholder movement']);
T('Knee Pain',      ['knee movement']);
T('Joint Stiffness',['trunk movement', 'sholder movement', 'neck movement', 'knee movement']);

module.exports = R;
