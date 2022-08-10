
import 'vuetify/styles' // Global CSS has to be imported
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import App from './App.vue'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
const app = createApp(App)
const vuetify = createVuetify({
  components,
 directives,
   icons: {
    iconfont: 'mdiSvg',
  }
})

 // Replaces new Vuetify(...)

app.use(vuetify)

app.mount('#app')