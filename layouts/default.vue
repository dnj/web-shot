<template>
	<v-layout>
		<Header />
		<v-main>
			<slot />
		</v-main>
	</v-layout>
		<Footer />
</template>
<script lang="ts">
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';

export default defineComponent({
	components: {
		Header,
		Footer
	}
})
</script>
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