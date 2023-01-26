import '../assets/css/tailwind.css'
import { app } from '@storybook/vue3'
import VueDOMPurifyHTML from 'vue-dompurify-html'

app.use(VueDOMPurifyHTML)

export const parameters = {}
