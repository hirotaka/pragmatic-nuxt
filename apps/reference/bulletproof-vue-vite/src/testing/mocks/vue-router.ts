import { vi } from 'vitest';

export function useRoute() {
  return {
    query: {},
    params: {},
    path: '/',
    name: undefined,
    matched: [],
    fullPath: '/',
    hash: '',
    redirectedFrom: undefined,
    meta: {},
  };
}

export function useRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    currentRoute: {
      path: '/',
      name: undefined,
      params: {},
      query: {},
      hash: '',
      fullPath: '/',
      matched: [],
      meta: {},
      redirectedFrom: undefined,
    },
  };
}

export const RouterLink = {
  name: 'RouterLink',
  template: '<a><slot /></a>',
};

export const RouterView = {
  name: 'RouterView',
  template: '<div><slot /></div>',
};

export function createRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    currentRoute: {
      path: '/',
      name: undefined,
      params: {},
      query: {},
      hash: '',
      fullPath: '/',
      matched: [],
      meta: {},
      redirectedFrom: undefined,
    },
  };
}

export function createWebHistory() {
  return {};
}

export function createMemoryHistory() {
  return {};
}
