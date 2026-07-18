import { el } from '../utils/dom';

let container: HTMLElement | null = null;

function ensureContainer(): HTMLElement {
  if (!container) {
    container = el('div', { class: 'toast-container', 'aria-live': 'polite' });
    document.body.appendChild(container);
  }
  return container;
}

export type ToastVariant = 'info' | 'success' | 'error';

export function showToast(message: string, variant: ToastVariant = 'info', durationMs = 4000): void {
  const root = ensureContainer();
  const toast = el('div', { class: `toast toast--${variant}` }, message);
  root.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  window.setTimeout(() => {
    toast.classList.remove('toast--visible');
    window.setTimeout(() => toast.remove(), 200);
  }, durationMs);
}
