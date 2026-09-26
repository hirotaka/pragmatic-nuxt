export async function useUsers() {
  return await useAPI("/api/users");
}
