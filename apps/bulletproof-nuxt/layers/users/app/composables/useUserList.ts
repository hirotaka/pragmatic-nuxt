export async function useUserList() {
  return await useAPI("/api/users");
}
