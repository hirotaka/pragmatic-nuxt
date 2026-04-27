import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import type { User } from '@/types/api'

const STORAGE_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isInitialized = ref(false)

  // Computed
  // User is authenticated if user data exists (from localStorage or API)
  // isInitialized is only used to track if initial auth check is complete
  const isAuthenticated = computed(() => user.value !== null)

  // Actions
  function setUser(newUser: User | null) {
    user.value = newUser
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function clearUser() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function setInitialized(value: boolean) {
    isInitialized.value = value
  }

  // Initialize from localStorage
  function initAuth() {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY)
      if (storedUser) {
        user.value = JSON.parse(storedUser)
        // Mark as initialized when user is loaded from localStorage
        // This is important for E2E tests where auth state persists via storage state
        isInitialized.value = true
      }
    } catch (error) {
      console.error('Failed to parse stored user:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Initialize on store creation
  initAuth()

  return {
    user,
    isAuthenticated,
    isInitialized,
    setUser,
    clearUser,
    setInitialized,
  }
})
