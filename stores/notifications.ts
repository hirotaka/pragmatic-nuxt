import { nanoid } from "nanoid";
import { defineStore } from "pinia";

export type Notification = {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message?: string;
};

export const useNotificationStore = defineStore({
  id: "notification",
  state: () => ({
    notifications: [] as Notification[],
  }),
  actions: {
    add(notification: Omit<Notification, "id">) {
      this.notifications = [
        ...this.notifications,
        { id: nanoid(), ...notification },
      ];
    },
    dismiss(id: string) {
      this.notifications = this.notifications.filter(
        (notification) => notification.id !== id
      );
    },
  },
});
