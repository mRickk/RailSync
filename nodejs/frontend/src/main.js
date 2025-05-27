import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'

import {createBootstrap} from 'bootstrap-vue-next'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import VueDatePicker from '@vuepic/vue-datepicker';

createApp(App)
    .use(router)
    .use(createBootstrap())
    .component('VueDatePicker', VueDatePicker)
    .mount('#app')