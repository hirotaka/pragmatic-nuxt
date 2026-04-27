/* eslint-disable @typescript-eslint/no-explicit-any */
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import userEvent from '@testing-library/user-event';
import { render as rtlRender } from '@testing-library/vue';
import Cookies from 'js-cookie';
import { createPinia } from 'pinia';
import type { Component } from 'vue';
import {
  createRouter,
  createMemoryHistory,
  type RouteRecordRaw,
} from 'vue-router';

import {
  createUser as generateUser,
  createDiscussion as generateDiscussion,
} from './data-generators';
import { db } from './mocks/db';
import { AUTH_COOKIE, authenticate, hash } from './mocks/utils';

export const createUser = async (userProperties?: any) => {
  const user = generateUser(userProperties) as any;
  await db.user.create({ ...user, password: hash(user.password) });
  return user;
};

export const createDiscussion = async (discussionProperties?: any) => {
  const discussion = generateDiscussion(discussionProperties);
  const res = await db.discussion.create(discussion);
  return res;
};

export const loginAsUser = async (user: any) => {
  const authUser = await authenticate(user);
  Cookies.set(AUTH_COOKIE, authUser.jwt);
  return authUser;
};

export const unauthenticate = () => {
  Cookies.remove(AUTH_COOKIE);
};

export const waitForLoadingToFinish = async () => {
  const { screen } = await import('@testing-library/vue');
  const { waitForElementToBeRemoved } = await import('@testing-library/vue');

  const elements = [
    ...screen.queryAllByTestId(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ];

  if (elements.length === 0) {
    return;
  }

  return waitForElementToBeRemoved(() => elements, { timeout: 4000 });
};

const initializeUser = async (user: any) => {
  if (typeof user === 'undefined') {
    const newUser = await createUser();
    return loginAsUser(newUser);
  } else if (user) {
    return loginAsUser(user);
  } else {
    return null;
  }
};

const AUTH_USER_KEY = ['auth-user'];

export const renderApp = async (
  ui: Component,
  { user, url = '/', path = '/', ...renderOptions }: Record<string, any> = {},
) => {
  // if you want to render the app unauthenticated then pass "null" as the user
  const initializedUser = await initializeUser(user);

  // Create a fresh Pinia instance for each test
  const pinia = createPinia();

  // Create a fresh QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  // Set user in query cache (vue-query-auth pattern)
  if (initializedUser) {
    queryClient.setQueryData(AUTH_USER_KEY, initializedUser.user);
  }

  const routes: RouteRecordRaw[] = [
    {
      path: path,
      component: ui,
    },
  ];

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });

  if (url) {
    await router.push(url);
  }

  const returnValue = {
    ...rtlRender(ui, {
      global: {
        plugins: [
          pinia as any,
          router as any,
          [VueQueryPlugin, { queryClient }],
        ],
      },
      ...renderOptions,
    }),
    user: initializedUser,
    queryClient,
    pinia,
  };

  await waitForLoadingToFinish();

  return returnValue;
};

// Export all from @testing-library/vue except render (we override it)
export {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
  getByText,
  getByRole,
  queryByText,
  queryByRole,
  findByText,
  findByRole,
} from '@testing-library/vue';
export { userEvent };

// Create a simple render wrapper that includes providers
export function render(ui: Component, options: Record<string, any> = {}) {
  const pinia = createPinia();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return rtlRender(ui, {
    global: {
      plugins: [pinia, [VueQueryPlugin, { queryClient }]],
      ...options.global,
    },
    ...options,
  });
}

export { rtlRender };
