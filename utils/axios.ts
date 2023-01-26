import Axios from 'axios'

import { useNotificationStore } from '@/stores/notifications'

export const axios = Axios.create()

axios.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const message = error.response?.data?.message || error.message

    useNotificationStore().add({
      type: 'error',
      title: 'Error',
      message
    })

    return Promise.reject(error)
  }
)
