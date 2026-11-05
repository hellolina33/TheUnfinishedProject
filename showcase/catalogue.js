import { DAYS, START, TOTAL_DAYS } from './prototypes.js';

const select = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
}[char]));
const formatDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', timeZone: 'Asia/Bangkok'
});
const firstRelease = Date.parse(START);
// Bangkok uses UTC+07 throughout the challenge, regardless of the viewer's time zone.
const releaseTime = day => firstRelease + (day - 1) * 86_400_000;
const now = Date.now();
const published = new Map(DAYS
  .filter(day => now >= releaseTime(day.n))
  .map(day => [day.n, day]));
const latest = Math.max(0, ...published.keys());
const upcoming = DAYS.find(day => now < releaseTime(day.n));

function cover(day, loading = 'lazy') {
  return `<img src="${escape(day.img)}" alt="${escape(day.alt)}" width="1672" height="941" loading="${loading}" decoding="async">`;
}

function card(day) {
  const featured = day.n === latest;
  const download = day.download
    ? `<a href="${escape(day.download[0])}" download="${escape(day.download[1])}">Download HTML</a>`
    : '';
  const story = day.post
    ? `<a href="${escape(day.post)}" target="_blank" rel="noopener">Read the story</a>`
    : '';
  return `<article class="day${featured ? ' featured' : ''}" id="day-${day.n}" tabindex="-1" aria-labelledby="title-${day.n}">
    <div class="face">${cover(day, featured ? 'eager' : 'lazy')}</div>
    <div class="bd">
      <p class="dn">Day ${day.n}${featured ? ' · Latest release' : ''}</p>
      <h3 id="title-${day.n}">${escape(day.name)}</h3>
      <p>${escape(day.line)}</p>
      <ul class="tags" aria-label="Highlights">${day.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul>
      <details class="note"><summary>What’s unfinished</summary><p>${escape(day.todo)}</p></details>
      <div class="acts">
        <a class="open" href="${escape(day.app)}" aria-label="Open ${escape(day.name)}">Open prototype</a>
        ${download}${story}
      </div>
    </div>
  </article>`;
}

function calendarDay(n) {
  const day = published.get(n);
  const date = formatDate.format(releaseTime(n));
  const label = `Day ${n}, ${date}`;
  if (!day) {
    return `<li class="unreleased"><span aria-label="${label}, unreleased"><b>${n}</b><small>${date}</small></span></li>`;
  }
  const isLatest = n === latest;
  return `<li class="${isLatest ? 'latest' : 'published'}">
    <a href="#day-${n}" aria-label="${label}, ${escape(day.name)}${isLatest ? ', latest release' : ''}"><b>${n}</b><small>${date}</small></a>
  </li>`;
}

select('#release-count').textContent = `${published.size} of ${TOTAL_DAYS} prototypes published`;
select('#days-list').innerHTML = published.size
  ? [...published.values()].sort((a, b) => b.n - a.n).map(card).join('')
  : '<p>The first prototype is coming soon. See the release calendar below.</p>';
select('#release-calendar').innerHTML = Array.from({ length: TOTAL_DAYS }, (_, i) => calendarDay(i + 1)).join('');

if (upcoming) {
  select('#next-release').innerHTML = `<article class="next">
    ${cover(upcoming)}
    <div>
      <p>Next up · Day ${upcoming.n} · ${formatDate.format(releaseTime(upcoming.n))}</p>
      <h3>${escape(upcoming.name)}</h3>
      <p>${escape(upcoming.line)}</p>
    </div>
  </article>`;
}
