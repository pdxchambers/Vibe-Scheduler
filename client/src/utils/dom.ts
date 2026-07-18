type Attrs = Record<string, string | boolean | ((ev: Event) => void) | undefined>;
type Child = Node | string | null | undefined | false;

/**
 * Lightweight hyperscript-style element builder so feature modules can build
 * DOM trees declaratively without a UI framework.
 *
 *   el('div', { class: 'card' }, [el('h2', {}, 'Title'), 'Some text'])
 */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children?: Child | Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    } else if (key === 'class') {
      node.className = String(value);
    } else if (typeof value === 'boolean') {
      if (value) node.setAttribute(key, '');
    } else {
      node.setAttribute(key, String(value));
    }
  }

  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }

  return node;
}

export function clearElement(node: Element): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
