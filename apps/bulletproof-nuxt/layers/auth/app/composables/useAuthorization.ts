import type { Comment } from "#layers/comments/shared/types/comment";
import type { User } from "#layers/users/shared/types/user";

export enum ROLES {
  ADMIN = "ADMIN",
  USER = "USER",
}

export type RoleTypes = keyof typeof ROLES;

export const POLICIES = {
  "comment:delete": (user: User, comment: Comment) => {
    if (user.role === "ADMIN") {
      return true;
    }

    if (user.role === "USER" && comment.authorId === user.id) {
      return true;
    }

    return false;
  },
};

export const useAuthorization = () => {
  const { user } = useUser();

  const checkAccess = ({ allowedRoles }: { allowedRoles: RoleTypes[] }) => {
    if (allowedRoles && allowedRoles.length > 0 && user.value) {
      return allowedRoles?.includes(user.value.role as RoleTypes);
    }

    return true;
  };

  const role = computed(() => user.value?.role);

  return { checkAccess, role };
};
