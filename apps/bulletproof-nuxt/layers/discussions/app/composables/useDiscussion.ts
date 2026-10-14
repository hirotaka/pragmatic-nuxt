export async function useDiscussion(id: MaybeRefOrGetter<string>) {
  return await useAPI(() => `/api/discussions/${toValue(id)}`);
}
