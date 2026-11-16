// Prayer times (adhan-js, on device), Hijri date, Qibla, in-flight prayer scan.
import * as adhan from '../vendor/adhan.js';
import { S } from './store.js';

const custom = (f, i) => () => { const p = adhan.CalculationMethod.Other(); p.fajrAngle = f; p.ishaAngle = i; return p; };
const M = adhan.CalculationMethod;
export const METHODS = {
  MWL: { n: 'Muslim World League', d: '18° / 17°', p: () => M.MuslimWorldLeague() },
  UOIF: { n: 'France · UOIF', d: '12° / 12°', p: custom(12, 12) },
  ISNA: { n: 'North America · ISNA', d: '15° / 15°', p: () => M.NorthAmerica() },
  UQ: { n: 'Umm Al-Qura · Makkah', d: '18.5° / 90 min', p: () => M.UmmAlQura() },
  EG: { n: 'Egyptian General Authority', d: '19.5° / 17.5°', p: () => M.Egyptian() },
  KAR: { n: 'Karachi · Univ. of Islamic Sciences', d: '18° / 18°', p: () => M.Karachi() },
  MA: { n: 'Morocco · Habous', d: '19° / 17°', p: custom(19, 17) },
  DZ: { n: 'Algeria · Religious Affairs', d: '18° / 17°', p: custom(18, 17) },
  TN: { n: 'Tunisia · Religious Affairs', d: '18° / 18°', p: custom(18, 18) },
  TR: { n: 'Turkey · Diyanet', d: '18° / 17°', p: () => M.Turkey() },
  SG: { n: 'Singapore · Malaysia · Indonesia', d: '20° / 18°', p: () => M.Singapore() },
  DXB: { n: 'Dubai', d: '18.2° / 18.2°', p: () => M.Dubai() },
  KW: { n: 'Kuwait', d: '18° / 17.5°', p: () => M.Kuwait() },
  QA: { n: 'Qatar', d: '18° / 90 min', p: () => M.Qatar() },
  TEH: { n: 'Tehran · Institute of Geophysics', d: '17.7° / 14°', p: () => M.Tehran() },
  MSC: { n: 'Moonsighting Committee', d: '18° / 18°, seasonal', p: () => M.MoonsightingCommittee() }
};
const BY_COUNTRY = { FR: 'UOIF', BE: 'UOIF', US: 'ISNA', CA: 'ISNA', SA: 'UQ', YE: 'UQ', BH: 'UQ', OM: 'UQ', AE: 'DXB', KW: 'KW', QA: 'QA', EG: 'EG', SD: 'EG', LY: 'EG', SY: 'EG', LB: 'EG', JO: 'EG', IQ: 'EG', PS: 'EG', PK: 'KAR', IN: 'KAR', BD: 'KAR', AF: 'KAR', SG: 'SG', MY: 'SG', ID: 'SG', BN: 'SG', TR: 'TR', IR: 'TEH', MA: 'MA', DZ: 'DZ', TN: 'TN', GB: 'MSC', IE: 'MSC' };
export const methodFor = iso2 => BY_COUNTRY[iso2] || 'MWL';

export const ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const NAMES = { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
export const AR = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };

function params() {
  const p = (METHODS[S.method] || METHODS.MWL).p();
  p.madhab = S.madhab === 'hanafi' ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  const c = new adhan.Coordinates(S.loc.lat, S.loc.lng);
  p.highLatitudeRule = adhan.HighLatitudeRule.recommended(c);
  p.adjustments = { fajr: S.offsets.fajr || 0, sunrise: 0, dhuhr: S.offsets.dhuhr || 0, asr: S.offsets.asr || 0, maghrib: S.offsets.maghrib || 0, isha: S.offsets.isha || 0 };
  return { p, c };
}
// key: 'YYYY-MM-DD' in the city's own calendar. Returns absolute instants (ms).
export function timesFor(key) {
  const [y, m, d] = key.split('-').map(Number);
  const { p, c } = params();
  const t = new adhan.PrayerTimes(c, new Date(y, m - 1, d), p);
  const o = {};
  for (const k of ORDER) { const v = t[k] && t[k].getTime(); o[k] = Number.isFinite(v) ? v : null; }
  return o;
}
export function methodAngles() {
  const p = (METHODS[S.method] || METHODS.MWL).p();
  return { angles: [p.fajrAngle || 18, p.ishaAngle || 17], ishaMin: p.ishaInterval || 0, asr: S.madhab === 'hanafi' ? 2 : 1 };
}
export const qiblaBearing = (lat, lng) => adhan.Qibla(new adhan.Coordinates(lat, lng));

export function fmtTime(ms, tz = S.loc && S.loc.tz) {
  if (ms == null) return '--:--';
  return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: S.h24 ? 'h23' : 'h12' }).format(new Date(ms)).replace(/\s?(am|pm)/i, (m, a) => ' ' + a.toUpperCase());
}
export function hijri(ms, tz = S.loc && S.loc.tz) {
  try { return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ms + (S.hijriAdj || 0) * 86400000)).replace(/\s?AH$/, ' AH'); } catch (e) { return ''; }
}
export const gregorian = (ms, tz = S.loc && S.loc.tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(ms));
export const weekday = (ms, tz = S.loc && S.loc.tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long' }).format(new Date(ms));

/* ---------- Flight scan: sun position along a great-circle route ---------- */
const RAD = Math.PI / 180, DEG = 180 / Math.PI;
function sun(ms, lat, lon) {
  const d = ms / 86400000 + 2440587.5 - 2451545.0;
  const g = (357.529 + 0.98560028 * d) * RAD, q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD, e = (23.439 - 0.00000036 * d) * RAD;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) * DEG, dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24;
  const ha = ((gmst * 15 + lon - ra) % 360 + 540) % 360 - 180;
  const alt = Math.asin(Math.sin(lat * RAD) * Math.sin(dec) + Math.cos(lat * RAD) * Math.cos(dec) * Math.cos(ha * RAD)) * DEG;
  return { alt, ha, dec: dec * DEG };
}
function gc(a, b, f) {
  const toV = (la, lo) => [Math.cos(la * RAD) * Math.cos(lo * RAD), Math.cos(la * RAD) * Math.sin(lo * RAD), Math.sin(la * RAD)];
  const A = toV(a[0], a[1]), B = toV(b[0], b[1]);
  const w = Math.acos(Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])));
  if (w < 1e-9) return a;
  const s1 = Math.sin((1 - f) * w) / Math.sin(w), s2 = Math.sin(f * w) / Math.sin(w);
  const v = [0, 1, 2].map(i => s1 * A[i] + s2 * B[i]);
  return [Math.atan2(v[2], Math.hypot(v[0], v[1])) * DEG, Math.atan2(v[1], v[0]) * DEG];
}
export function distanceKm(a, b) {
  const dφ = (b[0] - a[0]) * RAD, dλ = (b[1] - a[1]) * RAD;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(a[0] * RAD) * Math.cos(b[0] * RAD) * Math.sin(dλ / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
function tzOffset(ms, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
}
export function localToUtc(str, tz) {
  const [dt, tm] = str.split('T'); const [y, m, d] = dt.split('-').map(Number); const [h, mi] = tm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi); let u = guess - tzOffset(guess, tz); u = guess - tzOffset(u, tz); return u;
}
// from/to: [lat, lng]. Returns [[name, utcMs, [lat,lng]], ...] for prayer times that begin in flight.
export function flightPrayers(from, to, depUtc, durMin, o) {
  const [fa, ia] = o.angles, out = [];
  const posAt = t => gc(from, to, (t - depUtc) / (durMin * 60000));
  let pp = posAt(depUtc), ps = sun(depUtc, pp[0], pp[1]);
  for (let k = 1; k <= durMin; k++) {
    const t = depUtc + k * 60000, p = posAt(t), s = sun(t, p[0], p[1]), a0 = ps.alt, a1 = s.alt;
    const asrAlt = Math.atan(1 / (o.asr + Math.tan(Math.abs(p[0] - s.dec) * RAD))) * DEG, pm = s.ha > 0;
    if (a0 < -fa && a1 >= -fa && !pm) out.push(['fajr', t, p]);
    if (a0 < -0.833 && a1 >= -0.833 && !pm) out.push(['sunrise', t, p]);
    if (ps.ha < 0 && s.ha >= 0 && a1 > 0) out.push(['dhuhr', t, p]);
    if (a0 > asrAlt && a1 <= asrAlt && pm) out.push(['asr', t, p]);
    if (a0 > -0.833 && a1 <= -0.833 && pm) { out.push(['maghrib', t, p]); if (o.ishaMin && t + o.ishaMin * 60000 <= depUtc + durMin * 60000) out.push(['isha', t + o.ishaMin * 60000, posAt(t + o.ishaMin * 60000)]); }
    if (!o.ishaMin && a0 > -ia && a1 <= -ia && pm) out.push(['isha', t, p]);
    pp = p; ps = s;
  }
  // A westbound plane can chase the sun and cross the same threshold twice within minutes: keep the first.
  const seen = {}; return out.sort((a, b) => a[1] - b[1]).filter(e => { const dup = seen[e[0]] != null && e[1] - seen[e[0]] < 6 * 3600000; if (!dup) seen[e[0]] = e[1]; return !dup; });
}

/* ---------- Cities ---------- */
export function nearestCity(cities, lat, lng) {
  let best = null, bd = Infinity;
  for (const c of cities) { const d = (c[3] - lat) ** 2 + ((c[4] - lng) * Math.cos(lat * RAD)) ** 2; if (d < bd) { bd = d; best = c; } }
  return best;
}
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export function searchCities(cities, q, n = 8) {
  q = fold(q.trim()); if (q.length < 2) return [];
  const a = [], b = [];
  for (const c of cities) { const name = fold(c[0]); if (name.startsWith(q)) a.push(c); else if (name.includes(q) || fold(c[1]).startsWith(q)) b.push(c); if (a.length >= n) break; }
  return a.concat(b).slice(0, n);
}
