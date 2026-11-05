// Publish at 08:00 in Bangkok. Add an entry when a prototype is ready.
export const START = '2026-11-02T08:00:00+07:00';
export const TOTAL_DAYS = 30;

export const DAYS = [
  { n: 1, name: 'WhichOneAreYou', line: 'Drop a WhatsApp export and find out which role everyone really plays: the Firefighter, the Ghost, the Night Owl…', tags: ['WhatsApp', 'Couples & groups', 'English & French'],
    img: 'images/day-01-card.webp', alt: 'Five playful cards representing different group-chat roles',
    app: '/day-01-whichoneareyou/', download: ['/day-01-whichoneareyou/', 'whichoneareyou.html'], post: '',
    todo: "No accounts and no saved history: close the tab and the analysis is gone. Built and tested on WhatsApp exports in English and French; other formats may read badly. The roles are playful patterns from message stats, not a diagnosis. The AI chat needs your own API key." },
  { n: 2, name: 'How Many Weeks', line: 'Your life in weeks: how many are left, and what can still fit into them. Summers, books, days with your parents, the things you want to finish.', tags: ['Life in weeks', 'No account', 'English & French'],
    img: 'images/day-02-card.svg', alt: 'A grid of life weeks with most squares filled in and a smiling hourglass beside it',
    app: '/day-02-howmanyweeks/', download: ['/day-02-howmanyweeks/app/', 'how-many-weeks.html'], post: '',
    todo: "Life expectancy is an estimate. Your changes stay in this browser. Export a JSON backup to move them to another device." },
  { n: 3, name: 'Office Filter', line: 'Type what you really think at work. Get three versions you can actually send: diplomatic, direct, firm. Your no stays a no.', tags: ['Work', 'Your own AI key', 'English & French'],
    img: 'images/day-03-card.svg', alt: 'An angry spiky bubble goes through a smiling funnel and comes out as three calm message bubbles',
    app: '/day-03-officefilter/', download: ['/day-03-officefilter/', 'office-filter.html'], post: '',
    todo: "Three versions and one revision at a time, no history. The AI can still miss the tone in a sensitive situation: read before you send. Browser calls depend on each provider; a custom endpoint may need your own proxy. Tested with simulated AI answers, not with every model." },
  { n: 4, name: 'Productivity Library', line: '50 practical frameworks to prioritise, organise, focus, decide and review. Find the right tool, learn it, and take an editable slide deck.', tags: ['50 frameworks', '8 editable slides', 'PPTX & PDF'],
    img: 'images/day-04-card.svg', alt: 'An illustrated toolbox of 50 productivity frameworks',
    app: '/day-04-productivity-library/', post: '',
    todo: "Some framework attributions still need checking. Download a worksheet backup before closing the tab if you want to keep your answers. The studio also offers a complete HTML download for offline use." },
  { n: 5, name: 'Rain Room', line: 'Build a soundscape from rain, café chatter and other recordings. Pick a tape, mix in live music and set a focus timer.', tags: ['Ambient audio', 'Focus timer', 'English & French'],
    img: 'images/day-05-card.svg', alt: 'A cream cassette with an orange label in front of a rainy window and a green audio meter',
    app: '/day-05-rainroom/', post: '',
    todo: "Audio starts when you press play. Recordings and instrument samples load as you use them, so the hosted version needs a connection to fetch those files." },
];
