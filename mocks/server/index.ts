import { worker } from "./browser";
// import { server } from "./server";

export const initMocks = () => {
  if (import.meta.env.VITE_API_MOCKING === "true") {
    if (typeof window === "undefined") {
      // server.listten();
    } else {
      worker.start();
    }
  }
};
