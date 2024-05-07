// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'
import "/node_modules/flag-icons/css/flag-icons.min.css";
import "@/styles/main.scss";
import { createVuetify } from 'vuetify';

export default defineNuxtPlugin((app) => {
	const vuetify = createVuetify({
		theme: {
			themes: {
				light: {
					colors: {
						primary: "#000000",
						secondary: "#ffffff",
						textGray: "#555555",
						shadowGray: "#22222214",
						titleGray: "#6c757d",
						cardTitleGray: "#959595",
						subtitleGray: "#6e7880",
						contentGray: "#7c848b",
						codeText: "7b8a8b",
						background:"#fafafa",
						blueText: "#0277BD",
						customGreen: "#67E893",
					},
				},
			},
		},
	})
	app.vueApp.use(vuetify)
})


