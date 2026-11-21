// Each step points to material already available in Safa.
export const PATHS = [
  {
    id: 'first-prayer', image: 'covers/prayer', icon: 'prayerMat',
    title: ['Ma première prière','My first prayer','صلاتي الأولى'],
    intro: ['De la préparation aux deux rakʿat de Fajr, à ton rythme.','From getting ready to the two units of Fajr, at your own pace.','من الاستعداد إلى ركعتي الفجر، على مهل.'],
    steps: [
      { fact: 11, to: 'journey/before-prayer', title: ['Se préparer','Get ready','الاستعداد'] },
      { fact: 16, to: 'learn/wudu', title: ['Faire les ablutions','Make wudu','الوضوء'] },
      { fact: 12, to: 'journey/prayer/fajr', title: ['Apprendre Fajr','Learn Fajr','تعلّم صلاة الفجر'],
        check: {
          prompt: ['Combien de rakʿat compte la prière obligatoire de Fajr ?','How many units are in the obligatory Fajr prayer?','كم ركعة في فرض الفجر؟'],
          options: [['Deux','Two','ركعتان'],['Trois','Three','ثلاث ركعات'],['Quatre','Four','أربع ركعات']], correct: 0,
        } },
    ],
  },
  {
    id: 'quran-start', image: 'covers/quran', icon: 'quran',
    title: ['Découvrir le Coran','Discover the Quran','التعرّف على القرآن'],
    intro: ['Comprendre ce que tu lis, écouter Al-Fatiha et explorer une sourate courte.','Understand what you read, listen to Al-Fatihah and explore a short surah.','افهم ما تقرأ، واستمع إلى الفاتحة، وتعرّف على سورة قصيرة.'],
    steps: [
      { fact: 3, to: 'journey/facts/3', title: ['Découvrir le texte','Discover the text','التعرّف على النص'] },
      { fact: 32, to: 'quran/1', title: ['Écouter Al-Fatiha','Listen to Al-Fatihah','الاستماع إلى الفاتحة'] },
      { fact: 33, to: 'quran/112', title: ['Explorer Al-Ikhlas','Explore Al-Ikhlas','التعرّف على الإخلاص'] },
    ],
  },
  {
    id: 'daily', image: 'life/daily', icon: 'today',
    title: ['La foi au quotidien','Faith in daily life','الإيمان في الحياة اليومية'],
    intro: ['Des repères concrets, du réveil au coucher.','Practical references, from waking to bedtime.','أدلة عملية من الاستيقاظ إلى النوم.'],
    steps: [
      { fact: 61, to: 'journey/morning', title: ['Au réveil','When you wake','عند الاستيقاظ'] },
      { fact: 63, to: 'journey/meals', title: ['À table','At mealtimes','عند الطعام'] },
      { fact: 62, to: 'journey/evening', title: ['Avant de dormir','Before sleep','قبل النوم'] },
    ],
  },
  {
    id: 'ramadan', image: 'life/ramadan', icon: 'moon',
    title: ['Se préparer à Ramadan','Prepare for Ramadan','الاستعداد لرمضان'],
    intro: ['Les bases du jeûne, le rythme de la journée et les dispenses.','The basics of fasting, the daily rhythm and exemptions.','أساسيات الصيام وإيقاع اليوم والرخص.'],
    steps: [
      { fact: 72, to: 'journey/ramadan', title: ['Comprendre le jeûne','Understand fasting','فهم الصيام'] },
      { fact: 74, to: 'journey/facts/74', title: ['De l’aube au coucher du soleil','From dawn to sunset','من الفجر إلى الغروب'],
        check: {
          prompt: ['À quel moment se termine la journée de jeûne ?','When does the day of fasting end?','متى ينتهي صيام اليوم؟'],
          options: [['À midi','At noon','عند الظهر'],['Au coucher du soleil','At sunset','عند غروب الشمس']], correct: 1,
        } },
      { fact: 76, to: 'journey/facts/76', title: ['Connaître les dispenses','Learn about exemptions','معرفة الرخص'] },
    ],
  },
  {
    id: 'returning', image: 'life/mosque', icon: 'pathway',
    title: ['Reprendre la prière','Return to prayer','العودة إلى الصلاة'],
    intro: ['Retrouver les gestes, la récitation et un rythme tenable.','Rediscover the postures, recitation and a pace you can keep.','استعد معرفة الهيئات والقراءة، واختر إيقاعًا يناسبك.'],
    steps: [
      { fact: 46, to: 'journey/return', title: ['Après une interruption','After a break','بعد انقطاع'] },
      { fact: 34, to: 'journey/prayer', title: ['Revoir la récitation','Review the recitation','مراجعة القراءة'] },
      { fact: 50, to: 'journey/facts/50', title: ['Reprendre à son rythme','Return at your own pace','العودة على مهل'] },
    ],
  },
];

// All existing questions remain available through “All questions”.
export const FAQ_TOPICS = [
  { id:'prayer', title:['Prière et ablutions','Prayer and wudu','الصلاة والوضوء'], icon:'prayerMat', image:'covers/wudu', ids:[21,22,23,24,25,26,27,31,32] },
  { id:'belief', title:['Foi et croyances','Faith and beliefs','الإيمان والعقيدة'], icon:'quran', image:'life/learning', ids:[11,16,17,20] },
  { id:'daily', title:['Vie quotidienne','Everyday life','الحياة اليومية'], icon:'today', image:'life/daily', ids:[7,8,9,10,13,14] },
  { id:'family', title:['Famille et santé','Family and health','الأسرة والصحة'], icon:'duas', image:'life/family', ids:[5,6,15,28,29,30] },
  { id:'society', title:['Société et histoire','Society and history','المجتمع والتاريخ'], icon:'guide', image:'life/mosque', ids:[1,2,3,4,12,18,19] },
];
