import { useAPI } from "#layers/base/app/composables/useAPI";

export async function useTeams() {
  return await useAPI("/api/teams");
}
