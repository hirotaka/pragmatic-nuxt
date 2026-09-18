import { render as rtlRender } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import type { Component } from "vue";
import { createRouter, createMemoryHistory, type RouteRecordRaw } from "vue-router";

interface RenderOptions {
  url?: string;
  path?: string;
  [key: string]: unknown;
}

export const renderComponent = async (
  ui: Component,
  { url = "/", path = "/", ...renderOptions }: RenderOptions = {},
) => {
  // Create a fresh Pinia instance for each test
  const pinia = createPinia();
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

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
        plugins: [pinia, router, [VueQueryPlugin, { queryClient }]],
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
      ...renderOptions,
    }),
    pinia,
    queryClient,
    router,
  };

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
} from "@testing-library/vue";
export { userEvent };
