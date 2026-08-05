import { useAPI } from "#layers/base/app/composables/useAPI";

export async function useUsers() {
  return await useAPI("/api/users");
}
