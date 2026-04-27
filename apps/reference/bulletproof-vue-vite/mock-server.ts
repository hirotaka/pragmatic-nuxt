import { createMiddleware } from '@mswjs/http-middleware'
import cors from 'cors'
import express from 'express'
import logger from 'pino-http'

import { initializeDb } from './src/testing/mocks/db'
import { handlers } from './src/testing/mocks/handlers'

const app = express()

const APP_URL = process.env.VITE_APP_URL || 'http://localhost:5173'
const APP_MOCK_API_PORT = process.env.VITE_APP_MOCK_API_PORT || '8080'

app.use(
  cors({
    origin: APP_URL,
    credentials: true,
  }),
)

app.use(express.json())
app.use(logger())
app.use(createMiddleware(...handlers))

initializeDb().then(() => {
  console.log('Mock DB initialized')
  app.listen(APP_MOCK_API_PORT, () => {
    console.log(`Mock API server started at http://localhost:${APP_MOCK_API_PORT}`)
    console.log(`CORS origin set to: ${APP_URL}`)
  })
})
