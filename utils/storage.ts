const storagePrefix = 'bulletproof_nuxt'
const key = `${storagePrefix}_token`

const storage = {
  getToken: () => {
    if (typeof window === 'undefined') {
      return
    }

    if (key in window.localStorage) {
      const value = window.localStorage.getItem(key) as string
      return JSON.parse(value)
    }
  },
  setToken: (token: string) => {
    window.localStorage.setItem(key, JSON.stringify(token))
  },
  clearToken: () => {
    window.localStorage.removeItem(key)
  }
}

export default storage
