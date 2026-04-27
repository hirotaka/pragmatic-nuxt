/**
 * vue-query-auth - Vue port of react-query-auth
 * https://github.com/alan2207/react-query-auth
 *
 * Authenticate your vue app with vue-query
 */
import {
  type MutationFunction,
  type QueryFunction,
  type QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query';

export interface VueQueryAuthConfig<
  User,
  LoginCredentials,
  RegisterCredentials,
> {
  userFn: QueryFunction<User, QueryKey>;
  loginFn: MutationFunction<User, LoginCredentials>;
  registerFn: MutationFunction<User, RegisterCredentials>;
  logoutFn: MutationFunction<unknown, unknown>;
  userKey?: QueryKey;
}

export function configureAuth<User, LoginCredentials, RegisterCredentials>(
  config: VueQueryAuthConfig<User, LoginCredentials, RegisterCredentials>,
) {
  const {
    userFn,
    userKey = ['authenticated-user'],
    loginFn,
    registerFn,
    logoutFn,
  } = config;

  const useUser = (options?: { enabled?: boolean }) =>
    useQuery({
      queryKey: userKey,
      queryFn: userFn,
      // Don't throw errors for auth queries - 401 is expected when not logged in
      throwOnError: false,
      // Don't retry auth queries - if it fails once, it will fail again
      retry: false,
      ...options,
    });

  const useLogin = (options?: { onSuccess?: (user: User) => void }) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: loginFn,
      onSuccess: (user) => {
        queryClient.setQueryData(userKey, user);
        options?.onSuccess?.(user);
      },
    });
  };

  const useRegister = (options?: { onSuccess?: (user: User) => void }) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: registerFn,
      onSuccess: (user) => {
        queryClient.setQueryData(userKey, user);
        options?.onSuccess?.(user);
      },
    });
  };

  const useLogout = (options?: { onSuccess?: () => void }) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: logoutFn,
      onSuccess: () => {
        queryClient.setQueryData(userKey, null);
        options?.onSuccess?.();
      },
    });
  };

  return {
    useUser,
    useLogin,
    useRegister,
    useLogout,
  };
}
