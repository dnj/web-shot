// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'

import "@/styles/main.scss";
import { createVuetify } from 'vuetify';

export default defineNuxtPlugin((app) => {
	const vuetify = createVuetify({
		locale: {
			locale: 'fa',
		},
		theme: {
			themes: {
				light: {
					colors: {
						primary: "#007bff",
						secondary: "#6c767e",
						titleGray: "#6c757d",
						subtitleGray: "#6e7880",
						contentGray: "#7c848b",
						backgroundGray: "#ecf0f1",
						codeText: "7b8a8b",
						background:"#fafafa"
					},
				},
			},
		},
	})
	app.vueApp.use(vuetify)
})


