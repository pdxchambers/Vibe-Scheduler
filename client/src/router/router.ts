import { clearElement, el } from '../utils/dom';
import { sessionStore } from '../state/session';

export type RouteRender = (container: HTMLElement) => void | (() => void);

export interface RouteDefinition {
  path: string; // exact hash path, e.g. "/login"
  render: RouteRender;
  /** If true, redirects to /login when there is no authenticated user. */
  requiresAuth?: boolean;
  /** If true, redirects authenticated users away (e.g. /login when signed in). */
  guestOnly?: boolean;
}

let cleanupCurrent: (() => void) | void;

export function createRouter(routes: RouteDefinition[], outlet: HTMLElement, defaultPath = '/'): void {
  function currentPath(): string {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || defaultPath;
  }

  function navigateReplace(path: string) {
    window.location.replace(`${window.location.pathname}${window.location.search}#${path}`);
  }

  function render() {
    const path = currentPath();
    const route = routes.find((r) => r.path === path) ?? routes.find((r) => r.path === '*');

    if (cleanupCurrent) {
      cleanupCurrent();
      cleanupCurrent = undefined;
    }

    if (!route) {
      clearElement(outlet);
      outlet.appendChild(el('div', { class: 'not-found' }, 'Page not found.'));
      return;
    }

    const { status } = sessionStore.getState();

    if (status === 'loading') {
      clearElement(outlet);
      outlet.appendChild(el('div', { class: 'route-loading' }, 'Loading…'));
      return;
    }

    if (route.requiresAuth && status !== 'authenticated') {
      navigateReplace('/login');
      return;
    }

    if (route.guestOnly && status === 'authenticated') {
      navigateReplace('/calendar');
      return;
    }

    clearElement(outlet);
    cleanupCurrent = route.render(outlet) ?? undefined;
  }

  window.addEventListener('hashchange', render);
  sessionStore.subscribe(render);
  render();
}

export function navigate(path: string): void {
  window.location.hash = path;
}
