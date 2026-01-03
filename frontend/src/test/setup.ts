import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => {
    return localStorageMock[key as keyof typeof localStorageMock] || null;
  },
  setItem: (key: string, value: string) => {
    (localStorageMock as Record<string, string>)[key] = value;
  },
  removeItem: (key: string) => {
    delete (localStorageMock as Record<string, string>)[key];
  },
  clear: () => {
    Object.keys(localStorageMock).forEach(key => {
      if (
        key !== 'getItem' &&
        key !== 'setItem' &&
        key !== 'removeItem' &&
        key !== 'clear'
      ) {
        delete (localStorageMock as Record<string, string>)[key];
      }
    });
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});
