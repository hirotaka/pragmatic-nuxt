// Vitest setup file for Nuxt
import { vi } from "vitest";
import { ref } from "vue";

// Mock global objects if needed
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

global.localStorage = localStorageMock as Storage;

// Mock useState to use regular refs in tests
export const stateRefs = new Map<string, ReturnType<typeof ref>>();
vi.stubGlobal("useState", <T>(key: string, init?: () => T) => {
  if (!stateRefs.has(key)) {
    stateRefs.set(key, ref(init ? init() : undefined));
  }
  return stateRefs.get(key)!;
});

// Mock useUserSession from nuxt-auth-utils
vi.stubGlobal("useUserSession", () => ({
  user: ref(null),
  loggedIn: ref(false),
  fetch: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(undefined),
}));
