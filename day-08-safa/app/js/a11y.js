// Theme, text size, contrast and motion. Applied to <html> so route changes never reset them.
import { S } from './store.js';
const mq = matchMedia('(prefers-color-scheme: dark)');
export function applyUi() {
  const h = document.documentElement, u = S.ui || {};
  const night = u.theme === 'dark' || (u.theme !== 'light' && mq.matches);
  h.classList.toggle('night', night);
  h.classList.toggle('hc', !!u.hc);
  h.classList.toggle('rm', !!u.motion || matchMedia('(prefers-reduced-motion: reduce)').matches);
  h.style.setProperty('--zoom', u.scale || 1);
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta && !document.body.classList.contains('dark')) meta.content = night ? '#080808' : '#ecebe7';
}
mq.addEventListener && mq.addEventListener('change', applyUi);
