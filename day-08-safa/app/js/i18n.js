// English is the key. French is looked up; anything missing falls back to English.
import { S } from './store.js';

export const lang = () => (S.lang === 'fr' || (S.lang !== 'en' && /^fr\b/i.test(navigator.language || ''))) ? 'fr' : 'en';
export const L = () => lang() === 'fr' ? 'fr-FR' : 'en-GB';
export function t(k, v) {
  let s = (lang() === 'fr' && FR[k]) || k;
  if (v) s = s.replace(/\{(\w+)\}/g, (m, x) => (v[x] != null ? v[x] : m));
  return s;
}
export function applyLang() { document.documentElement.lang = lang(); document.title = 'safa.'; }

const FR = {
  // tabs + common
  'Today': "Aujourd'hui", 'Quran': 'Coran', 'Duas': 'Douas', 'Track': 'Suivi',
  'Back': 'Retour', 'Main': 'Principal', 'Settings': 'Réglages', 'About': 'À propos', 'Loading…': 'Chargement…',
  'Copied': 'Copié', 'Copy is not available here': 'Copie impossible ici',
  'This screen could not load. If you are offline, open it once with a connection and it will stay available.': "Cet écran n'a pas pu se charger. Hors ligne ? Ouvre-le une fois avec une connexion et il restera disponible.",
  'Back to Today': "Retour à Aujourd'hui",
  'Evening adhkar. A few verses. Tick today.': 'Adhkar du soir. Quelques versets. Coche ta journée.',
  'No city found. Try a bigger city nearby.': 'Aucune ville trouvée. Essaie une grande ville proche.',

  // onboarding
  'Clear time.<br>Clear soul<i>.</i>': 'Le temps clair.<br>L’âme claire<i>.</i>',
  'No ads': 'Zéro pub', 'No account, no tracking': 'Sans compte, sans pistage', 'Works offline': 'Fonctionne hors ligne',
  'Set my city': 'Choisir ma ville', 'Step 2 of 2': 'Étape 2 sur 2', 'Where do you pray?': 'Où pries-tu ?',
  'Used on this device to compute prayer times and the Qibla. It is never sent anywhere.': "Utilisé sur cet appareil pour calculer les horaires et la Qibla. Jamais envoyé ailleurs.",
  'Use my location once': 'Utiliser ma position une fois', 'or': 'ou', 'Type your city': 'Tape ta ville',
  'Calculation method': 'Méthode de calcul', 'Pre-selected for your country. You can change it any time.': 'Présélectionnée pour ton pays. Modifiable à tout moment.',
  "Show today's times": 'Voir les horaires du jour', 'Locating…': 'Localisation…', 'Location set · {c}': 'Position définie · {c}',
  'Location unavailable. Type your city instead.': 'Position indisponible. Tape plutôt ta ville.', 'Location unavailable.': 'Position indisponible.',

  // today
  'Next · {p} · {t}': 'Prochaine · {p} · {t}', 'Mark {p} as prayed': 'Marquer {p} comme faite', '{p} prayed': '{p} faite',
  'Pause mode is on. Nothing to log today.': "Mode pause activé. Rien à noter aujourd'hui.", 'Adjusted manually': 'Ajusté à la main',
  'Resume reading': 'Reprendre la lecture', 'Start reading': 'Commencer la lecture', 'Friday': 'Vendredi', 'Read Al-Kahf': 'Lire Al-Kahf',
  'Morning adhkar': 'Adhkar du matin', 'Evening adhkar': 'Adhkar du soir', 'Words of remembrance': "Paroles d'évocation",
  'Qibla': 'Qibla', 'Travel': 'Voyage', 'Flight mode': 'Mode avion', '{p} prayed?': '{p} faite ?',

  // qibla
  'from north · {c}': 'depuis le nord · {c}',
  'Turn on the compass, hold the phone flat and rotate until the orange dot reaches the top mark.': "Active la boussole, tiens le téléphone à plat et tourne jusqu'à ce que le point orange touche le repère du haut.",
  'Turn on compass': 'Activer la boussole', 'You are facing the Qibla.': 'Tu es face à la Qibla.',
  'Turn right · {d}° to go': 'Tourne à droite · encore {d}°', 'Turn left · {d}° to go': 'Tourne à gauche · encore {d}°',
  'No compass sensor found on this device. Face {d}° from north using any compass.': "Pas de boussole sur cet appareil. Oriente-toi à {d}° depuis le nord avec n'importe quelle boussole.",
  'Compass access was not granted. Face {d}° from north using any compass.': "Accès à la boussole refusé. Oriente-toi à {d}° depuis le nord avec n'importe quelle boussole.",

  // flight
  'Flight &amp; travel': 'Vol et voyage', 'From': 'Départ', 'To': 'Arrivée', 'Departure city': 'Ville de départ', 'Arrival city': "Ville d'arrivée",
  'Take-off · local time at departure': 'Décollage · heure locale de départ', 'Hours': 'Heures', 'Minutes': 'Minutes',
  'Pick your arrival city to see the prayers during the flight.': "Choisis ta ville d'arrivée pour voir les prières pendant le vol.",
  'Add a take-off time and a duration.': 'Ajoute une heure de décollage et une durée.',
  'Fajr begins.': 'Début de Fajr.', 'Sunrise. Fajr time ends.': 'Lever du soleil. Fin du temps de Fajr.', 'Dhuhr begins.': 'Début de Dhuhr.',
  'Asr begins.': "Début de l'Asr.", 'Sunset. Maghrib begins.': 'Coucher du soleil. Début de Maghrib.', 'Isha begins.': "Début de l'Isha.",
  '{h} h {m} after take-off.': '{h} h {m} après le décollage.', 'None in flight': 'Aucune en vol',
  'No prayer time begins during this flight. Check the prayer due at take-off and the next one on landing.': "Aucune heure de prière ne commence pendant ce vol. Vérifie la prière due au décollage et la suivante à l'atterrissage.",
  '<b>Travelling.</b> Most scholars allow shortening four-unit prayers to two (Qasr) and combining Dhuhr with Asr, and Maghrib with Isha (Jam\'). Conditions differ between schools. Ask someone of knowledge.': "<b>En voyage.</b> La plupart des savants permettent de raccourcir les prières de quatre rakats à deux (Qasr) et de regrouper Dhuhr avec Asr, Maghrib avec Isha (Jam'). Les conditions varient selon les écoles. Demande à une personne de science.",
  'Estimate only. Straight great-circle route, constant speed, sea-level horizon: at cruising altitude sunset comes a few minutes later. Uses your method ({m}).': "Estimation. Route en ligne droite sur le globe, vitesse constante, horizon au niveau de la mer : en altitude, le coucher arrive quelques minutes plus tard. Utilise ta méthode ({m}).",

  // quran list
  'Surah, 2:255, or a word': 'Sourate, 2:255 ou un mot', 'Search the Quran': 'Chercher dans le Coran', 'Surahs': 'Sourates', 'Juz': 'Juz', 'Favourites': 'Favoris',
  '{n} verses': '{n} versets', 'Meccan': 'Mecquoise', 'Medinan': 'Médinoise', 'Go to verse': 'Aller au verset', 'Searching…': 'Recherche…',
  'Verses · {n}': 'Versets · {n}', 'Nothing found. Try a surah name, a verse like 2:255, or a word.': 'Rien trouvé. Essaie un nom de sourate, un verset comme 2:255 ou un mot.',
  'Starts at {s}': 'Commence à {s}', 'No favourites yet. Open a verse menu and tap Favourite.': "Pas encore de favoris. Ouvre le menu d'un verset et touche Favori.",
  'Resume': 'Reprendre', 'Start here': 'Commencer ici', 'Al-Fatihah · The Opener': "Al-Fatiha · L'Ouverture", 'Al-Kahf · The Cave': 'Al-Kahf · La Caverne',

  // reader
  'This surah is not saved on this device yet. Connect once and it will stay available offline.': "Cette sourate n'est pas encore sur l'appareil. Connecte-toi une fois et elle restera disponible hors ligne.",
  'Back to list': 'Retour à la liste', 'Word by word': 'Mot à mot', 'Reader settings': 'Réglages de lecture', '{n} vv': '{n} vv',
  'Verse {v} options': 'Options du verset {v}', 'Pause': 'Pause', 'Play': 'Lire', 'Stop': 'Arrêter', 'Playback speed': 'Vitesse de lecture',
  'Hide words to test your memory': 'Masquer des mots pour réviser', 'Hide': 'Masquer', 'Hide ⅓': 'Masquer ⅓', 'Hide ½': 'Masquer ½', 'Hide all': 'Tout masquer',
  ' · looping verse': ' · verset en boucle', ' · loop {a}–{b}': ' · boucle {a}–{b}', 'Tap a hidden word to reveal it': 'Touche un mot masqué pour le révéler', 'Tap a word to hear it': "Touche un mot pour l'écouter",
  'Context &amp; tafsir · {k}': 'Contexte et tafsir · {k}', 'Explanation · Al-Mukhtasar': 'Explication · Al-Mukhtasar', 'No short explanation for this verse.': "Pas d'explication courte pour ce verset.",
  'Circumstances of revelation · Al-Wahidi': 'Circonstances de la révélation · Al-Wahidi', 'Not saved on this device yet. Connect once to keep it offline.': "Pas encore sur l'appareil. Connecte-toi une fois pour le garder hors ligne.",
  'Explanations are in English for now.': "Les explications sont en anglais pour l'instant.",
  'Play from here': "Lire à partir d'ici", 'Loop this verse': 'Répéter ce verset', 'Loop from {v} to': 'Boucle du verset {v} au', 'Last verse of the loop': 'Dernier verset de la boucle', 'Start': 'Lancer',
  'Context &amp; tafsir': 'Contexte et tafsir', 'Remove from favourites': 'Retirer des favoris', 'Add to favourites': 'Ajouter aux favoris', 'Copy verse': 'Copier le verset',
  'Removed': 'Retiré', 'Saved to favourites': 'Ajouté aux favoris', 'Reader': 'Lecture',
  'Arabic, transliteration and meaning under each word': 'Arabe, translittération et sens sous chaque mot', 'Word meanings are in English for now.': "Le sens des mots est en anglais pour l'instant.",
  'Mushaf flow': 'Mode Mushaf', 'Continuous Arabic, no translation': 'Arabe en continu, sans traduction', 'Verse transliteration': 'Translittération des versets',
  'Translation': 'Traduction', 'Arabic size': "Taille de l'arabe", 'Reciter': 'Récitateur',
  'Audio saved for offline ✓': 'Audio enregistré hors ligne ✓', "Save this surah's audio for offline": "Enregistrer l'audio de cette sourate", 'Saving… {a} / {b}': 'Enregistrement… {a} / {b}',
  'Could not save. Check your connection and retry.': 'Échec. Vérifie ta connexion et réessaie.',
  'Text, translation and tafsir are stored on the device. Audio streams unless you save it.': "Le texte, la traduction et le tafsir sont stockés sur l'appareil. L'audio est en streaming sauf si tu l'enregistres.",
  'Audio needs a connection, or a download in reader settings.': "L'audio demande une connexion, ou un téléchargement dans les réglages de lecture.",
  'Audio needs a connection.': "L'audio demande une connexion.",
  'Rashid Maash (clear French)': 'Rashid Maash (français clair)', 'Hamidullah (classic French)': 'Hamidullah (français classique)',
  'Talal Itani (clear English)': 'Talal Itani (anglais clair)', 'Pickthall (classic English)': 'Pickthall (anglais classique)', 'No translation': 'Sans traduction',

  // duas
  'Hisnul Muslim · Fortress of the Muslim': 'Hisnul Muslim · La Citadelle du Musulman',
  'How do you feel? anxious, travelling…': 'Comment te sens-tu ? anxieux, en voyage…', 'Search duas by feeling or situation': 'Chercher une doua par ressenti ou situation',
  '{n} invocation': '{n} invocation', '{n} invocations': '{n} invocations',
  'No favourites yet. Tap the star on any dua.': "Pas encore de favoris. Touche l'étoile d'une doua.",
  'Nothing found. Try “sleep”, “travel” or “anxious”.': 'Rien trouvé. Essaie « sommeil », « voyage » ou « anxieux ».',
  'Morning': 'Matin', 'Evening': 'Soir', 'On waking': 'Au réveil', 'When you wake up': 'Au réveil', 'Tonight': 'Ce soir', 'Before sleeping': 'Avant de dormir',
  'All chapters · {n}': 'Tous les chapitres · {n}', 'Transliteration': 'Translittération', 'Listen': 'Écouter', 'Favourite': 'Favori', 'Count repetitions': 'Compter les répétitions',
  'Hisnul Muslim · ch. {n}': 'Hisnul Muslim · ch. {n}', 'English only': 'En anglais uniquement',
  "Text from Hisnul Muslim by Sa'id al-Qahtani. Source references are matched automatically and still need review by a person of knowledge.": "Texte de la Citadelle du Musulman de Sa'id al-Qahtani. Les références sont rattachées automatiquement et doivent encore être vérifiées par une personne de science.",
  'Anxiety': 'Anxiété', 'Sleep': 'Sommeil', 'Decision': 'Décision', 'Gratitude': 'Gratitude', 'Illness & grief': 'Maladie et deuil', 'Forgiveness': 'Pardon',
  'Morning & evening': 'Matin et soir', 'After prayer': 'Après la prière', 'Food & home': 'Repas et maison', 'Mosque & prayer': 'Mosquée et prière',

  // track
  'Pause mode': 'Mode pause', 'Periods, illness, hard days. Tracking freezes. Nothing is counted against you.': "Règles, maladie, jours difficiles. Le suivi se fige. Rien n'est compté contre toi.",
  'Previous week': 'Semaine précédente', 'Next week': 'Semaine suivante', 'Quran reading': 'Lecture du Coran', 'Adhkar': 'Adhkar', ', paused': ', en pause',
  'You showed up on <b>{a} of {b}</b> days': 'Tu as été présent <b>{a} jours sur {b}</b>', ' and opened the Quran on <b>{n}</b>': ' et tu as ouvert le Coran <b>{n} fois</b>',
  'This week is paused.': 'Cette semaine est en pause.', 'Paused days are left out.': 'Les jours en pause ne comptent pas.',
  'Evening check-in': 'Bilan du soir', 'One gentle reminder a day. Nothing else.': 'Un rappel doux par jour. Rien de plus.', 'Time': 'Heure',
  'Add it to my calendar': 'Ajouter à mon agenda',
  'A web app cannot ring while it is closed. The calendar file gives you a reliable daily reminder; the in-app notice only shows while safa. is open.': "Une app web ne peut pas sonner quand elle est fermée. Le fichier agenda te donne un rappel quotidien fiable ; l'avis dans l'app n'apparaît que si safa. est ouverte.",
  'Method, offsets, audio, backup': 'Méthode, ajustements, audio, sauvegarde', 'About &amp; support': 'À propos et soutien', 'Sources, promise, Sadaqah Jariyah': 'Sources, promesse, Sadaqah Jariyah',
  'Notifications are off for this browser. Use the calendar reminder.': "Les notifications sont bloquées sur ce navigateur. Utilise le rappel d'agenda.",
  'safa. · evening check-in': 'safa. · bilan du soir',

  // settings
  'Language': 'Langue', 'Automatic': 'Automatique', 'Place': 'Lieu', 'Now: <b>{c}</b>, {p}. Stored on this device only.': 'Actuellement : <b>{c}</b>, {p}. Stocké uniquement sur cet appareil.',
  'Change city': 'Changer de ville', 'City set · {c}': 'Ville définie · {c}', 'Prayer times': 'Horaires de prière', 'Asr': 'Asr',
  "Standard · Shafi'i, Maliki, Hanbali": "Standard · chaféite, malikite, hanbalite", 'Hanafi': 'Hanafite', 'Match your mosque · minutes': 'Caler sur ta mosquée · minutes',
  '{p} minus one minute': '{p} moins une minute', '{p} plus one minute': '{p} plus une minute', 'Hijri date adjustment': 'Ajustement de la date hégirienne',
  '{n} day': '{n} jour', '{n} days': '{n} jours', '24-hour clock': 'Format 24 heures', 'Add 30 days of prayer times to my calendar': "Ajouter 30 jours d'horaires à mon agenda",
  'Offline': 'Hors ligne', '{n} MB used on this device': '{n} Mo utilisés sur cet appareil', 'Save the whole Quran text for offline': 'Enregistrer tout le Coran hors ligne',
  'Saved audio: {x}': 'Audio enregistré : {x}', 'none': 'aucun', 'surah {s} · {r}': 'sourate {s} · {r}', 'Delete saved audio': "Supprimer l'audio enregistré", 'Saved audio deleted': 'Audio supprimé',
  'Saving… {n} / 114': 'Enregistrement… {n} / 114', 'Whole Quran saved for offline ✓': 'Tout le Coran est enregistré hors ligne ✓', 'Stopped at {n} / 114. Tap to retry.': 'Arrêté à {n} / 114. Touche pour réessayer.',
  'Backup': 'Sauvegarde', 'No account, so no cloud. Keep a file and restore it on any device.': "Pas de compte, donc pas de cloud. Garde un fichier et restaure-le sur n'importe quel appareil.",
  'Export backup': 'Exporter', 'Import backup': 'Importer', 'Erase everything on this device': 'Tout effacer sur cet appareil', 'Tap again to erase everything': 'Touche encore pour tout effacer',
  'Backup restored': 'Sauvegarde restaurée', 'This file is not a safa. backup.': "Ce fichier n'est pas une sauvegarde safa.",

  // about
  'The silent spiritual instrument.': "L'instrument spirituel silencieux.", 'The promise': 'La promesse',
  'No ads. Ever.': 'Zéro pub. Jamais.', 'No account. No analytics. No tracker.': 'Pas de compte. Pas de statistiques. Pas de pisteur.',
  'Your place, your prayers and your reading stay on this device.': 'Ta position, tes prières et ta lecture restent sur cet appareil.',
  'No pop-up will ever stand between you and the Qibla, the times or the Quran.': 'Aucune fenêtre ne se mettra jamais entre toi et la Qibla, les horaires ou le Coran.',
  'No streak to lose. No guilt.': 'Pas de série à perdre. Pas de culpabilité.', 'Support · Sadaqah Jariyah': 'Soutien · Sadaqah Jariyah',
  'Everything here is free. Contributions are not open yet: there is nothing to pay and nothing locked. If safa. helps you, share it with one person. That is the support for now.': "Tout est gratuit ici. Les contributions ne sont pas encore ouvertes : rien à payer, rien de bloqué. Si safa. t'aide, partage-la avec une personne. C'est le soutien pour l'instant.",
  'Sources': 'Sources',
  'safa. is a tool, not a religious authority. Times are calculations and can differ by a minute or two from your mosque. For rulings, ask a person of knowledge.': "safa. est un outil, pas une autorité religieuse. Les horaires sont des calculs et peuvent différer d'une minute ou deux de ta mosquée. Pour les avis religieux, demande à une personne de science.",
  'Version 1.0 · a prototype from The Unfinished 30': 'Version 1.0 · un prototype de The Unfinished 30',


  // sources
  "<b>Prayer times, Qibla:</b> adhan-js by Batoul Apps (MIT), computed on device.": "<b>Horaires, Qibla :</b> adhan-js de Batoul Apps (MIT), calculés sur l'appareil.",
  "<b>Quran text:</b> Uthmani Hafs text from the Noble Qur'an Encyclopedia, via quran-json (CC BY 4.0).": "<b>Texte du Coran :</b> texte uthmani (Hafs) de l'Encyclopédie du Noble Coran, via quran-json (CC BY 4.0).",
  "<b>Word-by-word meanings and word audio:</b> Quran.com / Quranic Arabic Corpus data.": "<b>Sens mot à mot et audio par mot :</b> données Quran.com / Quranic Arabic Corpus (en anglais).",
  "<b>Translations:</b> Rashid Maash and Muhammad Hamidullah (French), Talal Itani (ClearQuran) and M. M. Pickthall (English), via fawazahmed0/quran-api.": "<b>Traductions :</b> Rashid Maash et Muhammad Hamidullah (français), Talal Itani et M. M. Pickthall (anglais), via fawazahmed0/quran-api.",
  "<b>French duas:</b> La Citadelle du Musulman, French text and transliteration via AleaToir3/hisnul-muslim-api-json.": "<b>Douas en français :</b> La Citadelle du Musulman, texte et translittération via AleaToir3/hisnul-muslim-api-json.",
  "<b>Explanation:</b> Al-Mukhtasar, Tafsir Center for Quranic Studies. <b>Circumstances of revelation:</b> Al-Wahidi. Both via spa5k/tafsir_api.": "<b>Explication :</b> Al-Mukhtasar, Tafsir Center for Quranic Studies. <b>Circonstances de la révélation :</b> Al-Wahidi. Les deux en anglais, via spa5k/tafsir_api.",
  "<b>Recitations:</b> streamed from everyayah.com.": "<b>Récitations :</b> en streaming depuis everyayah.com.",
  "<b>Duas:</b> Hisnul Muslim by Sa'id bin Ali bin Wahf al-Qahtani, text and audio from hisnmuslim.com.": "<b>Douas :</b> Hisnul Muslim de Sa'id bin Ali bin Wahf al-Qahtani, texte et audio de hisnmuslim.com.",
  "<b>Cities:</b> city-timezones (MIT).": "<b>Villes :</b> city-timezones (MIT).",
  // prayer names + methods
  'Sunrise': 'Chourouq', 'Muslim World League': 'Ligue islamique mondiale', 'France · UOIF': 'France · UOIF', 'North America · ISNA': 'Amérique du Nord · ISNA',
  'Umm Al-Qura · Makkah': 'Umm Al-Qura · La Mecque', 'Egyptian General Authority': 'Autorité générale égyptienne', 'Karachi · Univ. of Islamic Sciences': 'Karachi · Univ. des sciences islamiques',
  'Morocco · Habous': 'Maroc · Habous', 'Algeria · Religious Affairs': 'Algérie · Affaires religieuses', 'Tunisia · Religious Affairs': 'Tunisie · Affaires religieuses',
  'Turkey · Diyanet': 'Turquie · Diyanet', 'Singapore · Malaysia · Indonesia': 'Singapour · Malaisie · Indonésie', 'Dubai': 'Dubaï', 'Kuwait': 'Koweït', 'Qatar': 'Qatar',
  'Tehran · Institute of Geophysics': 'Téhéran · Institut de géophysique', 'Moonsighting Committee': 'Moonsighting Committee', '18° / 18°, seasonal': '18° / 18°, saisonnier'
};
