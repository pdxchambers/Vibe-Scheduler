type Listener<T> = (state: T) => void;

/**
 * Minimal observable store. Deliberately framework-free so any future
 * feature module can create its own store the same way without pulling in
 * a state-management library.
 */
export class Store<T> {
  private state: T;
  private listeners = new Set<Listener<T>>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(partial: Partial<T> | ((prev: T) => Partial<T>)): void {
    const updates = typeof partial === 'function' ? (partial as (prev: T) => Partial<T>)(this.state) : partial;
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
