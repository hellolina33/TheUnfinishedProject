// Each step points to material already available in Safa.
const lesson = (fact, title, practice, to = `journey/facts/${fact}`, check) => ({ fact, title, practice, to, check });

export const PATH_THEMES = [
  ['prayer',['Prière et purification','Prayer and purification','الصلاة والطهارة']],
  ['foundations',['Coran et foi','Quran and faith','القرآن والإيمان']],
  ['daily',['Vie quotidienne','Everyday life','الحياة اليومية']],
  ['occasions',['Ramadan et voyage','Ramadan and travel','رمضان والسفر']],
];

export function resumeLearning(path, stored) {
  if (!stored) return { current:0, completed:[], at:0 };
  const total=path.steps.length;
  const completed=[...new Set(stored.completed || [])].filter(index=>Number.isInteger(index)&&index>=0&&index<total);
  const previousTotal=stored.total ?? path.previousLength ?? total;
  const expanded=previousTotal<total;
  const oldPathFinished=expanded&&Array.from({length:previousTotal},(_,i)=>i).every(i=>completed.includes(i));
  const current=oldPathFinished?previousTotal:Math.max(0,Math.min(stored.current||0,total-1));
  return { ...stored,current,completed };
}
export const PATHS = [
  {
    id: 'first-prayer', theme: 'prayer', previousLength: 3, image: 'covers/prayer', icon: 'prayerMat',
    title: ['Ma première prière','My first prayer','صلاتي الأولى'],
    intro: ['Des préparatifs à l’après-prière, avec Fajr en exemple.','From preparation to after the prayer, using Fajr as your example.','من الاستعداد إلى ما بعد الصلاة، مع الفجر مثالًا.'],
    steps: [
      { fact: 11, to: 'journey/before-prayer', title: ['Se préparer','Get ready','الاستعداد'] },
      { fact: 16, to: 'learn/wudu', title: ['Faire les ablutions','Make wudu','الوضوء'] },
      { fact: 12, to: 'journey/prayer/fajr', title: ['Apprendre Fajr','Learn Fajr','تعلّم صلاة الفجر'],
        check: {
          prompt: ['Combien de rakʿat compte la prière obligatoire de Fajr ?','How many units are in the obligatory Fajr prayer?','كم ركعة في فرض الفجر؟'],
          options: [['Deux','Two','ركعتان'],['Trois','Three','ثلاث ركعات'],['Quatre','Four','أربع ركعات']], correct: 0,
        } },
      lesson(34,['Comprendre la récitation de Fajr','Understand Fajr recitation','فهم القراءة في الفجر'],
        ['Repère les deux lignes de Fajr dans le tableau de récitation.','Find both Fajr rows in the recitation table.','حدّد سطري الفجر في جدول القراءة.'],'journey/prayer/fajr'),
      lesson(37,['Revoir les deux prosternations','Review the two prostrations','مراجعة السجدتين'],
        ['Sur l’illustration, repère l’assise entre les deux prosternations.','In the illustrations, find the sitting between the two prostrations.','لاحظ الجلوس بين السجدتين في الرسوم.'],'journey/prayer/fajr'),
      lesson(41,['Après le salam','After the salam','بعد السلام'],
        ['Ouvre le guide et choisis un rappel à relire tranquillement après la prière.','Open the guide and choose a remembrance to revisit after prayer.','افتح الدليل واختر ذكرًا تراجعه بعد الصلاة.'],'journey/after-prayer'),
    ],
  },
  {
    id: 'quran-start', theme: 'foundations', previousLength: 3, image: 'covers/quran', icon: 'quran',
    title: ['Découvrir le Coran','Discover the Quran','التعرّف على القرآن'],
    intro: ['Comprendre ce que tu lis, écouter Al-Fatiha et explorer une sourate courte.','Understand what you read, listen to Al-Fatihah and explore a short surah.','افهم ما تقرأ، واستمع إلى الفاتحة، وتعرّف على سورة قصيرة.'],
    steps: [
      { fact: 3, to: 'journey/facts/3', title: ['Découvrir le texte','Discover the text','التعرّف على النص'] },
      { fact: 32, to: 'quran/1', title: ['Écouter Al-Fatiha','Listen to Al-Fatihah','الاستماع إلى الفاتحة'] },
      { fact: 33, to: 'quran/112', title: ['Explorer Al-Ikhlas','Explore Al-Ikhlas','التعرّف على الإخلاص'] },
      lesson(3,['Relire un verset dans son contexte','Read a verse in context','قراءة آية في سياقها'],
        ['Ouvre le contexte d’un verset dans le lecteur, puis reviens au texte.','Open the context of a verse in the reader, then return to the text.','افتح سياق آية في القارئ ثم عُد إلى النص.'],'quran/1/1'),
      lesson(50,['Choisir un moment de lecture','Choose a time to read','اختيار وقت للقراءة'],
        ['Choisis un moment réaliste pour relire ou réécouter un court passage.','Choose a realistic time to reread or listen again to a short passage.','اختر وقتًا مناسبًا لإعادة قراءة مقطع قصير أو الاستماع إليه.'],'quran/112'),
    ],
  },
  {
    id: 'daily', theme: 'daily', previousLength: 3, image: 'life/daily', icon: 'today',
    title: ['La foi au quotidien','Faith in daily life','الإيمان في الحياة اليومية'],
    intro: ['Des repères concrets, du réveil au coucher.','Practical references, from waking to bedtime.','أدلة عملية من الاستيقاظ إلى النوم.'],
    steps: [
      { fact: 61, to: 'journey/morning', title: ['Au réveil','When you wake','عند الاستيقاظ'] },
      { fact: 63, to: 'journey/meals', title: ['À table','At mealtimes','عند الطعام'] },
      { fact: 62, to: 'journey/evening', title: ['Avant de dormir','Before sleep','قبل النوم'] },
      lesson(66,['Tenir ses engagements','Keep your commitments','الوفاء بالالتزامات'],
        ['Repère un engagement de cette semaine et décide quand y donner suite.','Pick one commitment this week and decide when to follow through.','اختر التزامًا هذا الأسبوع وحدّد متى ستفي به.'],'journey/work'),
      lesson(69,['Prendre soin de ses voisins','Care for your neighbours','الإحسان إلى الجيران'],
        ['Choisis un petit service que tu peux rendre aujourd’hui.','Choose one small way to help today.','اختر مساعدة بسيطة تستطيع تقديمها اليوم.']),
    ],
  },
  {
    id: 'ramadan', theme: 'occasions', previousLength: 3, image: 'life/ramadan', icon: 'moon',
    title: ['Se préparer à Ramadan','Prepare for Ramadan','الاستعداد لرمضان'],
    intro: ['Le jeûne, le suhur, les dispenses et les dix dernières nuits.','Fasting, suhur, exemptions and the last ten nights.','الصيام والسحور والرخص والعشر الأواخر.'],
    steps: [
      { fact: 72, to: 'journey/ramadan', title: ['Comprendre le jeûne','Understand fasting','فهم الصيام'] },
      { fact: 74, to: 'journey/facts/74', title: ['De l’aube au coucher du soleil','From dawn to sunset','من الفجر إلى الغروب'],
        check: {
          prompt: ['À quel moment se termine la journée de jeûne ?','When does the day of fasting end?','متى ينتهي صيام اليوم؟'],
          options: [['À midi','At noon','عند الظهر'],['Au coucher du soleil','At sunset','عند غروب الشمس']], correct: 1,
        } },
      { fact: 76, to: 'journey/facts/76', title: ['Connaître les dispenses','Learn about exemptions','معرفة الرخص'] },
      lesson(73,['Préparer le suhur','Prepare for suhur','الاستعداد للسحور'],
        ['Vérifie l’heure locale de Fajr et note ce que tu veux préparer la veille.','Check your local Fajr time and note what you want to prepare the night before.','تحقق من وقت الفجر المحلي وحدّد ما ستجهّزه في الليلة السابقة.']),
      lesson(77,['Les dix dernières nuits','The last ten nights','العشر الأواخر'],
        ['Choisis un moment réaliste pour une lecture ou une doua.','Choose a realistic time for a reading or a dua.','اختر وقتًا مناسبًا للقراءة أو الدعاء.']),
    ],
  },
  {
    id: 'returning', theme: 'prayer', previousLength: 3, image: 'life/mosque', icon: 'pathway',
    title: ['Reprendre la prière','Return to prayer','العودة إلى الصلاة'],
    intro: ['Retrouver les gestes, la récitation et un rythme tenable.','Rediscover the postures, recitation and a pace you can keep.','استعد معرفة الهيئات والقراءة، واختر إيقاعًا يناسبك.'],
    steps: [
      { fact: 46, to: 'journey/return', title: ['Après une interruption','After a break','بعد انقطاع'] },
      { fact: 34, to: 'journey/prayer', title: ['Revoir la récitation','Review the recitation','مراجعة القراءة'] },
      { fact: 50, to: 'journey/facts/50', title: ['Reprendre à son rythme','Return at your own pace','العودة على مهل'] },
      lesson(45,['Une prière oubliée ou dormie','A prayer missed through forgetfulness or sleep','صلاة فاتت بنسيان أو نوم'],
        ['Lis la réponse sur les oublis et repère ce qui s’applique à cette situation précise.','Read the answer about forgetfulness and identify what applies to this specific situation.','اقرأ جواب النسيان وحدّد ما ينطبق على هذه الحالة.'],'journey/faq/26'),
      lesson(99,['Savoir à qui demander','Know whom to ask','معرفة من تسأل'],
        ['Si un point reste flou, note une question précise à poser à une personne qualifiée.','If something remains unclear, write down one precise question for a qualified person.','إذا بقي أمر غير واضح، دوّن سؤالًا محددًا لطرحه على شخص مؤهّل.'],'journey/faq/32'),
    ],
  },
  {
    id:'wudu', theme:'prayer', image:'covers/wudu', icon:'droplet',
    title:['Les ablutions en détail','Wudu in detail','الوضوء بالتفصيل'],
    intro:['Comprendre l’intention, revoir les gestes et savoir quoi faire en cas de doute.','Understand intention, review the motions and know what to do when unsure.','افهم النية وراجع الخطوات وتعلّم ما تفعل عند الشك.'],
    steps:[
      lesson(21,['Se préparer et poser l’intention','Prepare and make the intention','الاستعداد والنية'],
        ['Ouvre le guide illustré et repère où commencent les ablutions.','Open the illustrated guide and find where wudu starts.','افتح الدليل المصوّر وحدّد بداية الوضوء.'],'learn/wudu'),
      lesson(26,['Du visage aux coudes','From face to elbows','من الوجه إلى المرفقين'],
        ['Repère les étapes du visage et des bras dans le guide.','Find the face and arm steps in the guide.','حدّد خطوتي غسل الوجه والذراعين في الدليل.'],'learn/wudu'),
      lesson(28,['De la tête aux chevilles','From head to ankles','من الرأس إلى الكعبين'],
        ['Compare dans les illustrations l’essuyage de la tête et le lavage des pieds.','Compare wiping the head and washing the feet in the illustrations.','قارن في الرسوم بين مسح الرأس وغسل القدمين.'],'learn/wudu'),
      lesson(30,['Quand un doute survient','When doubt arises','عند حدوث الشك'],
        ['Lis l’exemple dans la FAQ avant de reprendre les gestes.','Read the example in the FAQ before repeating the motions.','اقرأ المثال في الأسئلة الشائعة قبل إعادة الخطوات.'],'journey/faq/27',{
          prompt:['Un doute seul annule-t-il des ablutions dont tu es certain ?','Does doubt alone cancel wudu you are sure you performed?','هل يبطل الشك وحده وضوءًا تتيقّن منه؟'],
          options:[['Oui','Yes','نعم'],['Non','No','لا']],correct:1,
        }),
    ],
  },
  {
    id:'faith-basics', theme:'foundations', image:'life/learning', icon:'book',
    title:['Les bases de l’islam','The foundations of Islam','أساسيات الإسلام'],
    intro:['Tawhid, piliers, articles de foi et rôle de la Sunna.','Tawhid, pillars, articles of faith and the role of Sunnah.','التوحيد والأركان وأصول الإيمان ودور السنة.'],
    steps:[
      lesson(1,['Comprendre le tawhid','Understand tawhid','فهم التوحيد'],['Explique l’idée d’unicité en une phrase.','Explain the idea of oneness in one sentence.','اشرح معنى التوحيد في جملة واحدة.']),
      lesson(5,['Situer les cinq piliers','Place the five pillars','التعرّف على الأركان الخمسة'],['Essaie de les nommer avant de rouvrir le repère.','Try naming them before opening the reference again.','حاول ذكرها قبل العودة إلى المعلومة.'],undefined,{
        prompt:['Combien de piliers sont présentés dans ce repère ?','How many pillars does this reference list?','كم ركنًا يذكر هذا الدليل؟'],
        options:[['Cinq','Five','خمسة'],['Six','Six','ستة']],correct:0,
      }),
      lesson(6,['Découvrir les articles de foi','Discover the articles of faith','التعرّف على أصول الإيمان'],['Compare la liste des articles de foi à celle des piliers.','Compare the articles of faith with the list of pillars.','قارن بين أصول الإيمان وأركان الإسلام.']),
      lesson(4,['Comprendre la Sunna et les hadiths','Understand Sunnah and hadith','فهم السنة والحديث'],['Ouvre une source citée et repère sa référence.','Open one cited source and locate its reference.','افتح مصدرًا مذكورًا وحدّد مرجعه.']),
    ],
  },
  {
    id:'giving', theme:'daily', image:'life/giving', icon:'duas',
    title:['Donner et prendre soin','Give and care','العطاء والرعاية'],
    intro:['Distinguer zakat et générosité du quotidien, puis choisir une action concrète.','Distinguish zakat from everyday generosity, then choose a practical action.','ميّز بين الزكاة والعطاء اليومي، ثم اختر عملًا عمليًا.'],
    steps:[
      lesson(78,['Comprendre la zakat','Understand zakat','فهم الزكاة'],['Note les conditions à vérifier avant tout calcul.','Note the conditions to verify before calculating.','دوّن الشروط التي ينبغي التحقّق منها قبل الحساب.'],'journey/wealth'),
      lesson(89,['Donner autrement','Other ways to give','طرق أخرى للعطاء'],['Trouve une aide que tu peux apporter sans argent.','Think of help you could give without money.','فكّر في مساعدة يمكنك تقديمها دون مال.']),
      lesson(69,['Commencer près de chez soi','Start close to home','ابدأ من محيطك'],['Pense à quelqu’un à qui proposer un service concret.','Think of someone you could offer practical help to.','فكّر في شخص تستطيع تقديم مساعدة عملية له.']),
      lesson(88,['Aider avec délicatesse','Give with care','المساعدة برفق'],['Avant d’agir, demande à la personne ce qui lui serait réellement utile.','Before acting, ask what would actually help the person.','قبل العمل اسأل الشخص عمّا يفيده فعلاً.']),
    ],
  },
  {
    id:'travel', theme:'occasions', image:'life/travel', icon:'bag',
    title:['Prier en voyage','Pray while travelling','الصلاة في السفر'],
    intro:['Préparer les horaires et la Qibla, puis lire les repères sur les dispenses.','Prepare your prayer times and Qibla, then read about concessions.','استعد للمواقيت والقبلة ثم اقرأ عن الرخص.'],
    steps:[
      lesson(11,['Vérifier les horaires','Check the prayer times','التحقق من المواقيت'],['Avant de partir, note une heure de prière à ta destination.','Before leaving, note one prayer time at your destination.','قبل الانطلاق دوّن وقت صلاة في وجهتك.'],'journey/travel'),
      lesson(13,['Repérer la Qibla','Find the Qibla','تحديد القبلة'],['Repère la direction et l’endroit où tu pourras prier.','Work out the direction and where you can pray.','حدّد الاتجاه والمكان الذي يمكنك الصلاة فيه.']),
      lesson(91,['Comprendre le raccourcissement','Understand shortening','فهم قصر الصلاة'],['Relis la distinction entre raccourcissement et regroupement.','Read the distinction between shortening and combining.','راجع الفرق بين القصر والجمع.'],'journey/travel',{
        prompt:['D’après ce repère, le nombre de rakʿat de Fajr change-t-il en voyage ?','According to this reference, does the number of Fajr units change during travel?','بحسب هذا الدليل، هل يتغيّر عدد ركعات الفجر في السفر؟'],
        options:[['Non','No','لا'],['Oui','Yes','نعم']],correct:0,
      }),
      lesson(99,['Préparer une question si besoin','Prepare a question if needed','جهّز سؤالًا عند الحاجة'],['Si ta situation est particulière, note le trajet et la durée avant de demander un avis.','For a specific situation, note your route and duration before asking for guidance.','إن كانت حالتك خاصة، دوّن مسار الرحلة ومدتها قبل أن تسأل.']),
    ],
  },
  {
    id:'family', theme:'daily', image:'life/family', icon:'duas',
    title:['Grandir en famille','Grow as a family','النمو داخل الأسرة'],
    intro:['Des repères sur les parents, les enfants et la transmission par l’exemple.','Guidance on parents, children and teaching by example.','معالم حول الوالدين والأطفال والتعليم بالقدوة.'],
    steps:[
      lesson(68,['Être présent pour ses parents','Be there for your parents','الإحسان إلى الوالدين'],['Choisis une attention simple à offrir cette semaine.','Choose one small act of care this week.','اختر لفتة بسيطة هذا الأسبوع.']),
      lesson(84,['Prendre soin de l’enfant','Care for children','رعاية الطفل'],['Identifie un besoin concret de l’enfant à traiter en priorité.','Identify one concrete need of a child to prioritise.','حدّد حاجة عملية للطفل تعطيها الأولوية.']),
      lesson(86,['Transmettre par l’exemple','Teach by example','التعليم بالقدوة'],['Choisis une habitude que tu peux montrer et pratiquer ensemble.','Choose a habit you can model and practise together.','اختر عادة تستطيع إظهارها وممارستها مع الطفل.'],'journey/growing'),
      lesson(66,['Parler et tenir parole','Speak honestly and keep your word','الصدق والوفاء بالوعد'],['Choisis une promesse concrète et réaliste à tenir à la maison.','Pick one concrete, realistic promise to keep at home.','اختر وعدًا واقعيًا ومحددًا تفي به في البيت.']),
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
