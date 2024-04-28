<template>
	<div class="banner text-center py-8 px-5">
		<h1>{{ $t("index.banner.title") }}</h1>
		<div>{{ $t("index.banner.subtitle") }}</div>
		<v-row justify="center" class="mt-5">
			<v-col md="8" sm="10" cols="11">
				<v-text-field variant="outlined" dir="ltr" v-model="inputUrl" class="px-0">
					<template v-slot:append-inner>
						<v-btn color="primary" height="100%" elevation="0" class="rounded-sm px-5"
							prepend-icon="mdi-camera" @click="onSubmit">{{ $t("index.banner.capture") }}</v-btn>
					</template>
				</v-text-field>
			</v-col>
		</v-row>
	</div>

	<v-container class="mb-15">
		<Images :images="images" :error="error" :width="150" :height="75" />
		<div class="home-content text-center">
			<div class="title-of-content">{{ $t("index.intro.title") }}</div>
			<div class="content">{{ $t("index.intro.content") }}</div>
		</div>
		<div class="home-content text-center">
			<div class="title-of-content">{{ $t("index.how-to-use.title") }}</div>
			<div class="content">{{ $t("index.how-to-use.content") }}</div>
			<div class="code-background" dir="ltr">
				&lt;img src="{{ getCaptureURL(inputUrl) }}"&gt;
			</div>
			<div class="title-of-content">{{ $t("index.options.title") }}</div>
			<div class="content">{{ $t("index.options.content") }}</div>
			<div class="code-background" dir="ltr">{{ `<img
					src="${getCaptureURL(inputUrl, { width: '100', height: '600' })}">` }}
			</div>
			<div class="content">{{ $t("index.options.code-explanation") }}</div>
			<v-btn variant="text" color="primary" :to="localePath('docs')">{{ $t("index.options.button") }}</v-btn>
		</div>
	</v-container>
</template>
<script lang="ts">
import { useI18n } from '#imports'
import Images, { fetchGallery, type IImage } from '~/components/Images.vue';

const IMAGES_COUNT = 8;

export default defineComponent({
	components: {
		Images
	},
	async setup() {
		const { t } = useI18n()
		useHead({
			title: t("pages.index")
		})
		let gallery: IImage[] = [];
		let error: boolean = false;

		try {
			gallery = await fetchGallery(IMAGES_COUNT);
		} catch {
			error = true;
		}

		return { gallery, error, localePath: useLocalePath() };
	},
	data() {
		return {
			inputUrl: "https://www.google.com",
			title: this.$t("pages.index"),
			error: false,
			captures: [] as IImage[]
		};
	},
	methods: {
		async onSubmit() {
			this.captures.unshift({
				url: this.inputUrl,
				date: new Date(),
			});
		},
	},
	computed: {
		images(): IImage[] {
			return [...this.captures, ...this.gallery].slice(0, IMAGES_COUNT);
		}
	}
})
</script>
<style lang="scss">
.banner {
	background-image: linear-gradient(to bottom right, rgb(117, 235, 193,0.2), rgb(121, 224, 231, 0.2) 15%, rgb(46, 97, 227, 0.2) 40%, rgb(172, 116, 228, 0.2) 60%, rgb(251, 158, 20, 0.2) 88%),linear-gradient(to top right, rgb(252, 252, 252, 0.8), rgb(245, 215, 255, 0.8));

	.v-input__control {
		border: 1px solid rgb(var(--v-theme-primary));
		border-radius: 5px;
		background-color: white;

		.v-field--appended {
			padding-inline-end: 0px;
		}
	}
}

.home-content {

	.title-of-content {
		margin-top: 60px;
		margin-bottom: 10px;
		color: rgb(var(--v-theme-titleGray));
		font-size: 22px;
		font-weight: 800;
	}

	.content {
		color: rgb(var(--v-theme-contentGray));
		margin-bottom: 25px;
	}

	.code-background {
		background-color: rgb(var(--v-theme-backgroundGray));
		border: 1px solid #dad9d9;
		margin-top: 20px;
		margin-bottom: 20px;
		padding: 10px;
		color: rgb(var(--v-theme-codeText));
		font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
		font-size: 14px;
	}
}

.v-field__input {
	--v-field-input-padding-top: 8px;
	--v-field-input-padding-bottom: 8px;
	--v-input-control-height: 0px;
	--v-field-padding-start: 20px;
}

.v-input.v-textarea>.v-input__control>.v-input__slot:before {
	border: none;
}
</style>