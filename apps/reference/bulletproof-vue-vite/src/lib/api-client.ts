import Axios, { type InternalAxiosRequestConfig } from 'axios';

import { notificationsStore } from '@/components/ui/notifications';
import { env } from '@/config/env';
import { paths } from '@/config/paths';

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }

  config.withCredentials = true;
  return config;
}

export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    notificationsStore.addNotification({
      type: 'error',
      title: 'Error',
      message,
    });

    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on auth pages (e.g., login failure)
      if (!currentPath.startsWith('/auth/')) {
        const searchParams = new URLSearchParams();
        const redirectTo = searchParams.get('redirectTo') || currentPath;
        window.location.href = paths.auth.login.getHref(redirectTo);
      }
    }

    return Promise.reject(error);
  },
);
