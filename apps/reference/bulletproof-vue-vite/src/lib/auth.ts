import { useRouter, useRoute } from 'vue-router';
import { z } from 'zod';

import { api } from './api-client';
import { configureAuth } from './vue-query-auth';

import { paths } from '@/config/paths';
import type { AuthResponse, User } from '@/types/api';

// API call definitions for auth (types, schemas, requests)
// These are not part of features as this is a module shared across features

const getUser = async (): Promise<User> => {
  const response: { data: User } = await api.get('/auth/me');
  return response.data;
};

const logout = (): Promise<void> => {
  return api.post('/auth/logout');
};

// Login schema and type
export const loginInputSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(5, 'Required'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

const loginWithEmailAndPassword = async (data: LoginInput): Promise<User> => {
  const response: AuthResponse = await api.post('/auth/login', data);
  return response.user;
};

// Register schema and type
export const registerInputSchema = z
  .object({
    email: z.string().min(1, 'Required').email('Invalid email'),
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    password: z.string().min(5, 'Required'),
  })
  .and(
    z
      .object({
        teamId: z.string().min(1, 'Required'),
        teamName: z.null().default(null),
      })
      .or(
        z.object({
          teamName: z.string().min(1, 'Required'),
          teamId: z.null().default(null),
        }),
      ),
  );

export type RegisterInput = z.infer<typeof registerInputSchema>;

const registerWithEmailAndPassword = async (
  data: RegisterInput,
): Promise<User> => {
  const response: AuthResponse = await api.post('/auth/register', data);
  return response.user;
};

// Configure auth using vue-query-auth (like react-query-auth)
const authConfig = {
  userFn: getUser,
  loginFn: loginWithEmailAndPassword,
  registerFn: registerWithEmailAndPassword,
  logoutFn: logout,
  userKey: ['auth-user'],
};

export const { useUser, useLogin, useRegister, useLogout } = configureAuth<
  User,
  LoginInput,
  RegisterInput
>(authConfig);

// ProtectedRoute composable - redirects to login if not authenticated
export const useProtectedRoute = () => {
  const router = useRouter();
  const route = useRoute();
  const user = useUser();

  const checkAuth = () => {
    if (!user.data.value) {
      router.replace(paths.auth.login.getHref(route.fullPath));
    }
  };

  return {
    user,
    checkAuth,
  };
};
