export default defineEventHandler(async (event) => {
  if (event.method === "POST") {
    await replaceUserSession(event, { user: { id: "new-user" } });
  }
  return getUserSession(event);
});
