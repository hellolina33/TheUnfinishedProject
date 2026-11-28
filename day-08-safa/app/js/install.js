// "Install safa." on the phone's home screen, on Android, iPhone and desktop.
// Android/Chrome/Edge/Samsung give a native prompt (beforeinstallprompt).
// iPhone never does: we show the exact Safari (or Chrome iOS) steps instead.
import { sheet, closeSheet, toast, icon } from './ui.js';
import { t } from './i18n.js';

let bip = null;
const listeners = new Set();
const ping = () => listeners.forEach(f => { try { f(); } catch (e) { /* ignore */ } });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); bip = e; window.__bip = e; ping(); });
window.addEventListener('appinstalled', () => { bip = null; window.__bip = null; toast(t('safa. is on your home screen.')); ping(); });
export const onInstallChange = f => { listeners.add(f); return () => listeners.delete(f); };

export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const canPrompt = () => !!bip;

export function platform() {
  const ua = navigator.userAgent || '';
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const inApp = /FBAN|FBAV|Instagram|Line\/|Messenger|TikTok|Snapchat|LinkedInApp|GSA\//i.test(ua);
  if (ios) return inApp ? 'ios-inapp' : /CriOS|EdgiOS|FxiOS/i.test(ua) ? 'ios-other' : 'ios-safari';
  if (/android/i.test(ua)) return inApp ? 'android-inapp' : /SamsungBrowser/i.test(ua) ? 'samsung' : /Firefox/i.test(ua) ? 'android-firefox' : 'android';
  return 'desktop';
}

const share = `<span class="inst-ic" aria-hidden="true">${icon.share}</span>`;
const dots = '<b class="inst-k" aria-hidden="true">⋮</b>';
function steps(p) {
  switch (p) {
    case 'ios-safari': return [t('Tap the Share button {i} at the bottom of Safari.', { i: share }), t('Scroll down and tap “Add to Home Screen”.'), t('Tap “Add”. safa. appears with your apps.')];
    case 'ios-other': return [t('Tap the Share button {i} next to the address bar.', { i: share }), t('Tap “Add to Home Screen”.'), t('Tap “Add”. If you do not see it, open this page in Safari.')];
    case 'ios-inapp': case 'android-inapp': return [t('This page is open inside another app.'), t('Tap the menu, then “Open in browser” (Safari or Chrome).'), t('Then tap Install safa. again.')];
    case 'samsung': return [t('Tap the menu ☰ at the bottom.'), t('Tap “Add page to”, then “Home screen”.'), t('Confirm. safa. appears with your apps.')];
    case 'android-firefox': return [t('Tap the menu {i} at the top right.', { i: dots }), t('Tap “Install” or “Add to Home screen”.'), t('Confirm. safa. appears with your apps.')];
    case 'android': return [t('Tap the menu {i} at the top right of Chrome.', { i: dots }), t('Tap “Install app” or “Add to Home screen”.'), t('Confirm. safa. appears with your apps.')];
    default: return [t('Click the install icon at the right of the address bar.'), t('Or open the browser menu, then “Install safa.”.'), t('On a phone, open this page and tap Install safa.')];
  }
}

// One entry point for every button.
export async function installFlow(opener) {
  if (isStandalone()) { toast(t('safa. is already installed.')); return; }
  if (bip) {
    try { bip.prompt(); const r = await bip.userChoice; if (r && r.outcome === 'accepted') toast(t('safa. is on your home screen.')); } catch (e) { /* ignore */ }
    bip = null; window.__bip = null; ping(); return;
  }
  const p = platform();
  const box = sheet(`<h2>${t('Install safa. on your phone')}</h2>
    <p class="muted small">${t('Free, no store, no account. It opens like an app, full screen and offline.')}</p>
    <ol class="inst-steps">${steps(p).map(s => `<li>${s}</li>`).join('')}</ol>
    ${p === 'ios-safari' ? `<p class="inst-arrow" aria-hidden="true">↓</p>` : ''}
    <button class="btn" data-close>${t('Got it')}</button>`, { label: t('Install safa. on your phone'), opener });
  box.classList.add('inst-sheet');
}

export const installButton = (cls = '') => isStandalone() ? '' : `<button class="inst-btn ${cls}" data-installapp>${icon.install}<span>${t('Install')}</span></button>`;
export { closeSheet };
