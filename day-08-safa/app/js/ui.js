import { data } from './store.js';
import { searchCities } from './prayer.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const pad = (n, l = 2) => String(n).padStart(l, '0');
export const arNum = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

const I = (p, w = 1.5) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
export const icon = {
  today: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  quran: I('<path d="M4 5.5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6.5v13"/>'),
  duas: I('<path d="M7 20v-5.5c0-2 1-3 2-3V5.5c0-1.2 2-1.2 2 0V11M17 20v-5.5c0-2-1-3-2-3V5.5c0-1.2-2-1.2-2 0V11"/>'),
  track: I('<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
  back: I('<path d="M15 5l-7 7 7 7"/>', 1.8),
  gear: I('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>'),
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
  stop: I('<path d="M6 6l12 12M18 6L6 18"/>', 1.8),
  star: I('<path d="M12 4l2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8z"/>'),
  more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2),
  compass: I('<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'),
  plane: I('<path d="M3 13l18-7-7 18-2.5-7.5z"/>'),
  search: I('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
  book: I('<path d="M6 4h11a1 1 0 011 1v15H7a1.5 1.5 0 010-3h11"/>'),
  chev: I('<path d="M9 5l7 7-7 7"/>', 1.6)
};
export const LOGO = `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="22" fill="#080808"/><mask id="lg"><rect width="100" height="100" fill="#fff"/><circle cx="58" cy="42" r="25" fill="#000"/></mask><circle cx="46" cy="52" r="28" fill="#fff" mask="url(#lg)"/><circle cx="72" cy="30" r="7" fill="#E85D2A"/></svg>`;

let toastT;
export function toast(msg) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
}

// Bottom sheet. Non-blocking by design: tap outside or Escape closes it.
export function sheet(html, opts = {}) {
  closeSheet();
  const wrap = document.createElement('div'); wrap.className = 'sheet-wrap' + (opts.dark ? ' dark' : '');
  wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(opts.label || 'Options')}"><div class="grab" aria-hidden="true"></div>${html}</div>`;
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add('on'));
  wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('[data-close]')) closeSheet(); });
  const f = wrap.querySelector('button,input,select,a'); if (f && !opts.noFocus) f.focus({ preventScroll: true });
  return wrap.firstElementChild;
}
export function closeSheet() { $$('.sheet-wrap').forEach(w => w.remove()); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

export function download(name, text, type = 'application/json') {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// City search field. onPick receives [name, country, iso2, lat, lng, tz].
export function cityField(root, { placeholder = 'Search a city', onPick, value = '' }) {
  root.innerHTML = `<div class="cityf"><input type="search" class="inp" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off" autocapitalize="words" aria-label="${esc(placeholder)}"><div class="cityr" role="listbox"></div></div>`;
  const inp = $('input', root), res = $('.cityr', root); let list = [];
  inp.addEventListener('input', async () => {
    const cities = await data('cities.json');
    list = searchCities(cities, inp.value);
    res.innerHTML = list.map((c, i) => `<button type="button" role="option" data-i="${i}"><b>${esc(c[0])}</b><span>${esc(c[1])}</span></button>`).join('') || (inp.value.trim().length >= 2 ? '<p class="mono pad">No city found. Try a bigger city nearby.</p>' : '');
  });
  res.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const c = list[+b.dataset.i]; inp.value = c[0]; res.innerHTML = ''; onPick(c); });
  return inp;
}
