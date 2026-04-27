import '@testing-library/jest-dom/vitest';

import { config } from '@vue/test-utils';

import { initializeDb, resetDb } from '@/testing/mocks/db';
import { server } from '@/testing/mocks/server';

// Global stubs for router-link to prevent "Failed to resolve component" warnings
config.global.stubs = {
  RouterLink: {
    template: '<a><slot /></a>',
  },
};

// Suppress specific console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });

  // Suppress Radix UI aria-describedby warnings
  console.warn = (...args: unknown[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      message.includes('Missing `Description`')
    ) {
      return;
    }
    originalWarn(...args);
  };

  // Suppress jsdom navigation warnings (from window.location.href changes)
  console.error = (...args: unknown[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      message.includes('Not implemented: navigation')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  server.close();
  console.warn = originalWarn;
  console.error = originalError;
});

beforeEach(() => {
  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  vi.stubGlobal('ResizeObserver', ResizeObserverMock);

  window.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
  window.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

  initializeDb();
});

afterEach(() => {
  server.resetHandlers();
  resetDb();
});
