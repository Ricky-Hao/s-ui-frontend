// Polyfill localStorage for test environment
// happy-dom may not fully support localStorage
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string): string | null => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  get length() { return Object.keys(store).length },
  key: (index: number): string | null => Object.keys(store)[index] ?? null,
}

// Force assign to globalThis
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
})
