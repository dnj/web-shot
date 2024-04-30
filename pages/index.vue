<template>
	<div class="banner text-center py-8 px-5">
		<h1>{{ $t("index.banner.title") }}</h1>
		<div>{{ $t("index.banner.subtitle") }}</div>
		<v-row justify="center" class="mt-5">
			<v-col md="8" sm="10" cols="11">
				<v-text-field variant="outlined" dir="ltr" v-model="inputUrl" class="px-0">
					<template v-slot:append-inner>
						<v-btn color="primary" height="100%" elevation="0" class="rounded-sm px-5 text-secondary"
							prepend-icon="mdi-camera" @click="onSubmit">{{ $t("index.banner.capture") }}</v-btn>
					</template>
				</v-text-field>
			</v-col>
		</v-row>
	</div>

	<v-container class="mb-15 mt-5">
		<v-row>
			<v-col cols="4">
				<div class="text-cardTitleGray mb-1">{{ $t("index.api-card.browser-options.title") }}</div>
				<div class="pa-5 cards">
					<div>Resolution</div>
					<v-select :items="resolutionOptios" variant="outlined" v-model="selectedResolution"
						@update:modelValue="setResolution"></v-select>
					<div class="mb-2">width:</div>
					<v-row>
						<v-col cols="11" class="pa-0">
							<v-slider :max="slidersRange.width.max" :min="slidersRange.height.min" :step="1"
								class="align-center" elevation="5" color="primary" hide-details :thumb-size="18"
								thumb-color="secondary" v-model="inputData.width">
								<template v-slot:append>
									<v-text-field v-model="inputData.width" class="options-input px-0"
										variant="outlined"></v-text-field>
								</template>
							</v-slider>
						</v-col>
						<v-col cols="1" class="pa-0">
							<span class="text-textGray">px</span>
						</v-col>
					</v-row>

					<div class="mb-2 mt-6">height:</div>
					<v-row>
						<v-col cols="11" class="pa-0">
							<v-slider :max="slidersRange.height.max" :min="slidersRange.height.min" :step="1"
								class="align-center" elevation="5" color="primary" hide-details :thumb-size="18"
								thumb-color="secondary" v-model="inputData.height">
								<template v-slot:append>
									<v-text-field v-model="inputData.height" class="options-input px-0"
										variant="outlined"></v-text-field>
								</template>
							</v-slider>
						</v-col>
						<v-col cols="1" class="pa-0">
							<span class="text-textGray">px</span>
						</v-col>
					</v-row>


					<div class="mb-2 mt-6">timeout:</div>
					<v-row>
						<v-col cols="11" class="pa-0">
							<v-slider :max="slidersRange.timeout.max" :min="slidersRange.timeout.min" :step="1"
								class="align-center" elevation="5" color="primary" hide-details :thumb-size="18"
								thumb-color="secondary" v-model="inputData.timeout">
								<template v-slot:append>
									<v-text-field v-model="inputData.timeout" class="options-input px-0"
										variant="outlined"></v-text-field>
								</template>
							</v-slider>
						</v-col>
						<v-col cols="1" class="pa-0">
							<span class="text-textGray">ms</span>
						</v-col>
					</v-row>

					<div class="mb-2 mt-6">max age:</div>
					<v-row>
						<v-col cols="11" class="pa-0">
							<v-slider :max="slidersRange.maxAge.max" :min="slidersRange.maxAge.min" :step="1"
								class="align-center" elevation="5" color="primary" hide-details :thumb-size="18"
								thumb-color="secondary" v-model="inputData.maxAge">
								<template v-slot:append>
									<v-text-field v-model="inputData.maxAge" class="options-input px-0"
										variant="outlined"></v-text-field>
								</template>
							</v-slider>
						</v-col>
						<v-col cols="1" class="pa-0">
							<span class="text-textGray">s</span>
						</v-col>
					</v-row>
					<v-row class="switch-btn">
						<v-col cols="3" class="pe-0">
							<div>full page:</div>
						</v-col>
						<v-col cols="9" class="ps-0"><v-switch color="primary"
								v-model="inputData.fullpage"></v-switch></v-col>
					</v-row>

					<div class="mb-2 mt-4">format:</div>
					<v-select :items="formatOptios" variant="outlined" v-model="inputData.format"></v-select>

				</div>
			</v-col>
			<v-col cols="8">
				<div class="text-cardTitleGray mb-1">{{ $t("index.api-card.screenshot-api.title") }}</div>
				<div class="px-5 py-7 cards">
					<div class="api-box pt-3">
						<div class="api-box-header ">
							<div v-for="i in 3" class="circle ms-3"></div>
						</div>
						<div class="text-center px-5 pb-10">
							<div class="api-title">{{ $t("index.intro.title") }}</div>
							<div class="text-contentGray mb-10">{{ $t("index.intro.content") }}</div>
							<Images :images="images" :error="error" :width="captures.length > 0 ? 600 : 150"
								:height="captures.length > 0 ? 300 : 75" />
							<v-btn v-if="captures.length > 0" prepend-icon="mdi-download" color="primary"
								class="mt-5">{{
								$t("index.api-card.download-image.button") }}</v-btn>
						</div>
					</div>
				</div>
			</v-col>
		</v-row>
		<div class="home-content text-center text-textGray">
			<div class="title-of-content mt-15">{{ $t("index.how-to-use.title") }}</div>
			<div>{{ $t("index.how-to-use.content") }}</div>
			<div class="code-background pa-2 my-5" dir="ltr">
				&lt;img src="{{ getCaptureURL(inputUrl) }}"&gt;
			</div>
			<div class="title-of-content mt-15">{{ $t("index.options.title") }}</div>
			<div>{{ $t("index.options.content") }}</div>
			<div class="code-background pa-2 my-5" dir="ltr">{{ `<img
					src="${getCaptureURL(inputUrl, { width: '100', height: '600' })}">` }}
			</div>
			<div>{{ $t("index.options.code-explanation") }}</div>
			<v-btn color="primary" :to="localePath('docs')" height="43px" class="px-10 mt-8"
				:append-icon="$vuetify.locale.isRtl ? 'mdi-arrow-left' : 'mdi-arrow-right'">{{
				$t("index.options.button") }}</v-btn>
		</div>
	</v-container>
</template>
<script lang="ts">
import { useI18n } from '#imports'
import Images, { fetchGallery, type IImage } from '~/components/Images.vue';

const IMAGES_COUNT = 8;

interface IInput {
	url: string,
	width: number,
	height: number,
	maxAge: number,
	format: string,
	fullpage: boolean,
	timeout: number,
	viewportWidth: number,
	viewportHeight: number
}

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
			captures: [] as IImage[],
			resolutionOptios: [
				{ title: '1024 X 768', value: { viewportWidth: 1024, viewportHeight: 768 } },
				{ title: '1280 X 800', value: { viewportWidth: 1280, viewportHeight: 800 } },
				{ title: '1680 X 1050', value: { viewportWidth: 1680, viewportHeight: 1050 } },
				{ title: '1600 X 900', value: { viewportWidth: 1600, viewportHeight: 900 } },
				{ title: '1440 X 900', value: { viewportWidth: 1440, viewportHeight: 900 } },
				{ title: '1280 X 1024', value: { viewportWidth: 1280, viewportHeight: 1024 } },
				{ title: '1366 X 768', value: { viewportWidth: 1366, viewportHeight: 768 } },
				{ title: '1200 X 600', value: { viewportWidth: 1200, viewportHeight: 600 } }
			],
			selectedResolution: { viewportWidth: 1200, viewportHeight: 600 } ,
			formatOptios: ["jpeg", "png"],
			inputData: {
				url: 'https://www.google.com',
				width: 1200,
				height: 600,
				maxAge: 86400,
				format: 'jpeg',
				fullpage: false,
				timeout: 10000,
				viewportWidth: 1200,
				viewportHeight: 600
			} as IInput,
			slidersRange: {
				width: { min: 0, max: 5000 },
				height: { min: 0, max: 5000 },
				timeout: { min: 2000, max: 15000 },
				maxAge: { min: 10, max: 100000 }
			}
		};
	},
	methods: {
		async onSubmit() {
			this.captures = [{
				url: this.inputUrl,
				date: new Date(),
			}];
		},
		setResolution() {
			this.inputData.viewportWidth = this.selectedResolution.viewportWidth;
			this.inputData.viewportHeight = this.selectedResolution.viewportHeight;
			console.log("fffgg")
		}
	},
	computed: {
		images(): IImage[] {
			return this.captures.length > 0 ? this.captures : this.gallery;
		}
	}
})
</script>
<style lang="scss">
.banner {
	background-image: linear-gradient(to bottom right, rgba(117, 235, 193, 0.2), rgba(121, 224, 231, 0.2) 15%, rgba(46, 97, 227, 0.2) 40%, rgba(172, 116, 228, 0.2) 60%, rgba(251, 158, 20, 0.2) 88%), linear-gradient(to top right, rgb(252, 252, 252, 0.8), rgb(245, 215, 255, 0.8));

	.v-input__control {
		border: 1px solid rgb(var(--v-theme-primary));
		border-radius: 5px;
		background-color: white;

		.v-field--appended {
			padding-inline-end: 0px;
		}
	}
}

.cards {
	border: 3px solid rgb(var(--v-theme-borderGray));
	border-radius: 20px;
	background-color: white;
	font-size: 14px;
}

.api-box {
	border: 3px solid rgb(var(--v-theme-borderGray));
	border-radius: 15px;

	.api-box-header {
		border-bottom: 3px solid rgb(var(--v-theme-borderGray));

		.circle {
			border-radius: 50%;
			border: 3.5px solid rgb(var(--v-theme-borderGray));
			width: 22px;
			height: 22px;
			display: inline-block;
		}
	}

	.api-title {
		margin-top: 20px;
		margin-bottom: 10px;
		color: rgb(var(--v-theme-titleGray));
		font-size: 18px;
		font-weight: 800;
	}
}

.home-content {

	.title-of-content {
		font-size: 16px;
		font-weight: 800;
	}

	.code-background {
		background-color: rgb(var(--v-theme-secondary));
		border: 3px solid rgb(var(--v-theme-borderGray));
		border-radius: 15px;
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

.options-input {
	width: 55px;

	.v-field__input {
		--v-field-padding-start: 1px;
		--v-field-padding-end: 1px;
		--v-field-input-padding-top: 2px;
		--v-field-input-padding-bottom: 0px;
		text-align: center;
		font-size: 13px;


	}

	.v-input__details {
		display: none;
	}
}

.switch-btn {
	.v-col {
		align-content: center;
	}

	.v-input__details {
		display: none;
	}
}
</style>