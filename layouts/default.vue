<template>
	<v-layout>
		<v-app-bar class="top-bar" :elevation="0" color="white" density="comfortable">

			<v-app-bar-title>وب شات</v-app-bar-title>
			<v-toolbar-items class="hidden-sm-and-down">
				<v-btn :to="undefined">مستندات</v-btn>
				<v-btn :to="undefined">گالری</v-btn>
				<v-btn :to="undefined">تماس با‌ما</v-btn>
			</v-toolbar-items>
			<v-spacer />
		</v-app-bar>

		<v-main>
			<slot />
		</v-main>
	</v-layout>
</template>
<style lang="scss">
.top-bar.v-toolbar {
	border-bottom: 1px solid #d4d8d9;
	.v-toolbar-title {
		flex: none;
		margin-inline-start: 32px;
		margin-inline-end: 32px;
	}
}
</style>