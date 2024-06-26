<template>
	<v-app-bar class="app-bar px-5" :elevation="0" color="white" density="comfortable">
		<NuxtLink :to="localePath('/')" class="toolbar-title me-sm-6 ms-1"
			:class="$vuetify.locale.isRtl ? '' : 'english-font'">
			<v-app-bar-title>{{ $t("pages.index") }}</v-app-bar-title>
		</NuxtLink>
		<v-toolbar-items class="hidden-sm-and-down toolbar-items">
			<v-btn :to="localePath('docs')" class="mx-3">{{ $t("pages.docs") }}</v-btn>
			<v-btn :to="localePath('gallery')" class="mx-3">{{ $t("pages.gallery") }}</v-btn>
			<v-btn :to="localePath('contact')" class="mx-3">{{ $t("pages.contact") }}</v-btn>
		</v-toolbar-items>
		<v-spacer />
		<v-menu>
			<template v-slot:activator="{ props }">
				<v-btn variant="text" color="light" height="80%" v-bind="props">
					<span class="fi flag mx-1 rounded" :class="`fi-` + currentLang.country" />
					{{ $vuetify.display.smAndUp ? currentLang.title : currentLang.title.slice(0, 2) }}
				</v-btn>
			</template>
			<v-list :elevation="3" class="mt-2">
				<v-list-item v-for="(language, i) in getOtherLanguages(locale)" :key="i" :value="language.value"
					:to="switchLocalePath(language.value)">
					<template v-slot:append>
						<span class="fi ms-2 rounded" :class="`fi-${language.country}`" />
					</template>
					<v-list-item-title>{{ language.title }}</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-menu>
		<v-menu>
			<template v-slot:activator="{ props }">
				<v-app-bar-nav-icon class="hidden-md-and-up mx-0" v-bind="props"></v-app-bar-nav-icon>
			</template>
			<v-list class="mt-2">
				<v-list-item>
					<v-btn variant="text" :to="localePath('docs')" v-text="$t('pages.docs')" />
				</v-list-item>
				<v-list-item>
					<v-btn variant="text" :to="localePath('gallery')" v-text="$t('pages.gallery')" />
				</v-list-item>
				<v-list-item>
					<v-btn variant="text" :to="localePath('contact')" v-text="$t('pages.contact')" />
				</v-list-item>
			</v-list>
		</v-menu>
	</v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({
	setup() {
		return {
			locale: useI18n().locale,
			localePath: useLocalePath(),
			switchLocalePath: useSwitchLocalePath()
		};
	},
	data() {
		return {
			languages: [
				{ title: "English", value: "en", country: "us" },
				{ title: "فارسی", value: "fa", country: "ir" },
			]
		}
	},
	methods: {
		getOtherLanguages(code: string) {
			return this.languages.filter((otherLanguage) => otherLanguage.value !== code)
		},
	},
	computed: {
		currentLang() {
			return this.languages.find(({ value }) => value === this.locale)!;
		}
	}
})
</script>
<style lang="scss">
.v-btn {
	letter-spacing: 0px;
}

.app-bar {

	.toolbar-title {
		text-decoration: none;
		color: black;
	}

	.english-font {
		font-family: Audiowide;
	}

	.toolbar-items {
		.v-btn.v-btn--active {
			background: black;

			.v-btn__overlay,
			.v-btn__underlay {
				display: none;
			}

			.v-btn__content {
				color: white;
			}
		}
	}
}
</style>
