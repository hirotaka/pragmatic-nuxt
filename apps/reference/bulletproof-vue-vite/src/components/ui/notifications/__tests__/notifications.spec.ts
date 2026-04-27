import { beforeEach, expect, test } from 'vitest'

import type { Notification } from '../notifications-store'
import { useNotifications } from '../notifications-store'

beforeEach(() => {
  // Clear notifications before each test
  const { notifications } = useNotifications()
  notifications.value = []
})

test('should add and remove notifications', () => {
  const { notifications, addNotification, dismissNotification } = useNotifications()

  // Should start with empty notifications
  expect(notifications.value).toEqual([])

  const notification: Omit<Notification, 'id'> = {
    type: 'success',
    title: 'Hello World',
    message: 'This is a message',
  }

  // Add notification
  addNotification(notification)

  // Should have one notification
  expect(notifications.value).toHaveLength(1)
  expect(notifications.value[0]).toMatchObject(notification)
  expect(notifications.value[0]!.id).toBeDefined()

  // Dismiss notification
  const notificationId = notifications.value[0]!.id
  dismissNotification(notificationId)

  // Should be empty again
  expect(notifications.value).toEqual([])
})
