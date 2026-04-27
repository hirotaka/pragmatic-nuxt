import { nanoid } from 'nanoid';
import { ref } from 'vue';

export type Notification = {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message?: string;
};

const notifications = ref<Notification[]>([]);

const addNotification = (notification: Omit<Notification, 'id'>) => {
  notifications.value = [
    ...notifications.value,
    { id: nanoid(), ...notification },
  ];
};

const dismissNotification = (id: string) => {
  notifications.value = notifications.value.filter(
    (notification) => notification.id !== id,
  );
};

// Export store object for access outside components (e.g., api-client interceptors)
// Similar to Zustand's getState() pattern in bulletproof-react
export const notificationsStore = {
  addNotification,
  dismissNotification,
};

// Export composable for use within Vue components
export const useNotifications = () => {
  return {
    notifications,
    addNotification,
    dismissNotification,
  };
};
