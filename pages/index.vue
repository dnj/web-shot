<template>
	<div class="banner text-center pt-15 pb-5 px-5">
		<h1>{{ $t("index.banner.title") }}</h1>
		<div class="text-secondary"><strong>{{ $t("index.banner.subtitle") }}</strong></div>
		<v-row justify="center" class="mt-5">
			<v-col lg="5" md="8" sm="10" cols="11">
				<v-text-field variant="outlined" dir="ltr" v-model="inputUrl" class="px-0">
					<template v-slot:append-inner>
						<v-btn color="primary" height="100%" elevation="0" class="font-weight-bold" @click="onSubmit">{{$t("index.banner.capture") }}</v-btn>
					</template>
				</v-text-field>
			</v-col>
		</v-row>

		<Images :images="images" :error="error" :width="150" :height="75" />
		<v-btn :to="localePath('docs')" class="mt-5" elevation="0" color="primary">{{ $t("index.banner.start") }}</v-btn>
	</div>
	<v-container class="mb-15">
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
			<div class="code-background" dir="ltr">{{ `<img src="${getCaptureURL(inputUrl, { width: '100', height: '600' })}">` }}
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
	background-color: rgb(var(--v-theme-backgroundGray));

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
	--v-field-input-padding-top: 7px;
	--v-field-input-padding-bottom: 7px;
	--v-input-control-height: 0px;
	--v-field-padding-start: 20px;
}

.v-input.v-textarea>.v-input__control>.v-input__slot:before {
	border: none;
}
</style>