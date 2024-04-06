<template>
	<header>
		<v-app-bar class="top-bar" :elevation="0" color="white" density="comfortable"
			:dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'">
			<NuxtLink to="/" class="toolbar-title"><v-app-bar-title>وب شات</v-app-bar-title></NuxtLink>
			<v-toolbar-items class="hidden-sm-and-down">
				<v-btn to="/docs" color="secondary">مستندات</v-btn>
				<v-btn to="/gallery" color="secondary">گالری</v-btn>
				<v-btn to="/contact" color="secondary">تماس با‌ما</v-btn>
			</v-toolbar-items>
			<v-spacer />
			<v-menu>
				<template v-slot:activator="{ props }">
					<v-app-bar-nav-icon class="hidden-md-and-up" v-bind="props"></v-app-bar-nav-icon>
				</template>
				<v-list>
					<v-list-item><v-btn variant="text" to="/docs" color="secondary">مستندات</v-btn></v-list-item>
					<v-list-item><v-btn variant="text" to="/gallery" color="secondary">گالری</v-btn></v-list-item>
					<v-list-item><v-btn variant="text" to="/contact" color="secondary">تماس با‌ما</v-btn></v-list-item>
				</v-list>
			</v-menu>
		</v-app-bar>
	</header>
</template>
<style>
.toolbar-title {
	text-decoration: none;
	color: black;
}
</style>
