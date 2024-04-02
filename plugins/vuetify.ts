// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import "@/styles/main.scss";
import { createVuetify } from 'vuetify';
import { fa } from 'vuetify/locale';

export default defineNuxtPlugin((app) => {
	const vuetify = createVuetify({
		locale: {
			locale: 'fa',
			messages: { fa },
		},
	})
	app.vueApp.use(vuetify)
})
