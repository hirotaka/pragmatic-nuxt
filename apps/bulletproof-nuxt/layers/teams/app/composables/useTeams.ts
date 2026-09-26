export async function useTeams() {
  return await useAPI("/api/teams");
}
