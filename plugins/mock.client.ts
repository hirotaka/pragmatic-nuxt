import { worker } from "@/mocks/server/browser";

export default defineNuxtPlugin(async () => {
  // if (process.env.NODE_ENV === "development") {
  // NODE_ENVのが適切かもしれない
  await worker.start({
    onUnhandledRequest: "bypass",
  });
  //}
});
