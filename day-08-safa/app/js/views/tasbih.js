// A free tasbih: a big button, a target, a gentle vibration. Nothing is stored but the target.
import { S, save } from '../store.js';
import { $, icon, toast } from '../ui.js';
import { t } from '../i18n.js';

export function renderTasbih(root) {
  let n = 0; const T = () => S.tasbihT || 33;
  const draw = () => {
    root.innerHTML = `<header class="sub"><a href="#/plus" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Tasbih')}</b><span class="ib"></span></header>
      <div class="seg pad" role="group" aria-label="${t('Target')}">${[33, 99, 100].map(x => `<button data-tt="${x}" aria-pressed="${T() === x}">${x}</button>`).join('')}<input class="inp tother" id="tother" type="number" min="1" max="10000" inputmode="numeric" placeholder="${t('Other')}" aria-label="${t('Other target')}" value="${[33, 99, 100].includes(T()) ? '' : T()}"></div>
      <button class="tasb" id="tb" aria-live="polite"><span class="mono" id="tn">${n}</span><small>/ ${T()}</small></button>
      <p class="muted small center">${t('Tap anywhere on the circle. It vibrates at each count and longer at the end.')}</p>
      <div class="row2 pad"><button class="btn line sm" id="treset">${t('Start again')}</button></div>
      <p class="muted small pad">${t('SubhanAllah ×33, Alhamdulillah ×33, Allahu akbar ×34 after the prayer is a common practice.')}</p>`;
  };
  root.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.tt != null) { S.tasbihT = +b.dataset.tt; save(); n = 0; draw(); return; }
    if (b.id === 'treset') { n = 0; draw(); return; }
    if (b.id === 'tb' || b.closest('#tb')) { n++; if (n >= T()) { if (navigator.vibrate) navigator.vibrate([60, 60, 120]); toast(t('{n} done. May Allah accept it.', { n: T() })); n = 0; } else if (navigator.vibrate) navigator.vibrate(10); $('#tn', root).textContent = n; }
  };
  root.onchange = e => { if (e.target.id === 'tother') { const x = Math.max(1, Math.min(10000, parseInt(e.target.value, 10) || 0)); if (x) { S.tasbihT = x; save(); n = 0; draw(); } } };
  draw();
  return () => { root.onclick = null; root.onchange = null; };
}
