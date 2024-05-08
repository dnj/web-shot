<template>
	<div class="banner text-center py-8 px-5">
		<h1>{{ $t("index.banner.title") }}</h1>
		<div>{{ $t("index.banner.subtitle") }}</div>
		<v-row justify="center" class="mt-5">
			<v-col md="8" sm="10" cols="12">
				<v-text-field variant="outlined" dir="ltr" v-model="inputData.url" class="px-0">
					<template v-slot:append-inner>
						<v-btn color="primary" height="100%" elevation="0" class="rounded-sm px-sm-5 px-2"
							@click="onSubmit"><v-icon class="me-2" icon="mdi-camera"></v-icon>{{
								$t("index.banner.capture") }}</v-btn>
					</template>
				</v-text-field>
			</v-col>
		</v-row>
	</div>
	<v-container class="mb-15 mt-5">
		<v-row>
			<v-col md="4" cols="12">
				<div class="text-cardTitleGray mb-1">{{ $t("index.api-card.browser-options.title") }}</div>
				<div class="py-5 px-4 cards">
					<div>{{ $t("api.options.resolution") }}</div>
					<v-row>
						<v-col cols="8" class="pe-0">
							<v-locale-provider :rtl="false">
								<v-select v-if="!customResolutionStatus" :items="resolutionOptios" variant="outlined"
									v-model="selectedResolution" @update:modelValue="setResolution"></v-select>
								<v-text-field variant="outlined" v-if="customResolutionStatus" :rules="[resolutionRule]"
									placeholder="width-height:1200-600" v-model="customResolution"
									@update:modelValue="setCustomResolution"></v-text-field>
							</v-locale-provider>
						</v-col>
						<v-col cols="4">
							<v-btn height="38px" color="primary" @click="toggleCustomResolution">{{
								$t("api.options.resolution.custom-btn") }}</v-btn>
						</v-col>
					</v-row>
					<div class="mb-2">{{ $t("api.options.width") }}</div>
					<v-slider :max="slidersRange.width.max" :min="slidersRange.height.min" :step="1"
						class="align-center" elevation="5" color="primary" hide-details :thumb-size="18"
						thumb-color="secondary" v-model="inputData.width">
						<template v-slot:append>
							<v-text-field v-model="inputData.width" class="options-input px-0"
								variant="outlined"></v-text-field>
							<span class="text-textGray units ms-2">{{ $t("api.options.units.px") }}</span>
						</template>
					</v-slider>
					<div class="mb-2 mt-6">{{ $t("api.options.height") }}</div>
					<v-slider :max="slidersRange.height.max" :min="slidersRange.height.min" :step="1"
						class="align-center" elevation="5" color="primary" hide-details :thumb-size="18"
						thumb-color="secondary" v-model="inputData.height">
						<template v-slot:append>
							<v-text-field v-model="inputData.height" class="options-input px-0"
								variant="outlined"></v-text-field>
							<span class="text-textGray units ms-2">{{ $t("api.options.units.px") }}</span>
						</template>
					</v-slider>
					<div class="mb-2 mt-6">{{ $t("api.options.timeout") }}</div>
					<v-slider :max="slidersRange.timeout.max" :min="slidersRange.timeout.min" :step="1"
						class="align-center" elevation="5" color="primary" hide-details :thumb-size="18"
						thumb-color="secondary" v-model="inputData.timeout">
						<template v-slot:append>
							<v-text-field v-model="inputData.timeout" class="options-input px-0"
								variant="outlined"></v-text-field>
							<span class="text-textGray units ms-2">{{ $t("api.options.units.ms") }}</span>
						</template>
					</v-slider>
					<div class="mb-2 mt-6">{{ $t("api.options.max-age") }}</div>
					<v-slider :max="slidersRange.maxAge.max" :min="slidersRange.maxAge.min" :step="1"
						class="align-center" elevation="5" color="primary" hide-details :thumb-size="18"
						thumb-color="secondary" v-model="inputData.maxAge">
						<template v-slot:append>
							<v-text-field v-model="inputData.maxAge" class="options-input px-0"
								variant="outlined"></v-text-field>
							<span class="text-textGray units ms-2">{{ $t("api.options.units.second") }}</span>
						</template>
					</v-slider>
					<v-row class="switch-btn">
						<v-col md="4" sm="2" cols="4" class="pe-0 fullPage-title">
							<div>{{ $t("api.options.full-page") }}</div>
						</v-col>
						<v-col md="8" sm="10" cols="8" class="ps-0"><v-switch color="primary"
								v-model="inputData.fullpage"></v-switch></v-col>
					</v-row>
					<div class="mb-2 mt-4">{{ $t("api.options.format") }}</div>
					<v-select :items="formatOptios" variant="outlined" v-model="inputData.format"></v-select>
				</div>
			</v-col>
			<v-col md="8" cols="12">
				<div class="text-cardTitleGray mb-1">{{ $t("index.api-card.screenshot-api.title") }}</div>
				<div class="px-3 px-sm-5 py-3 py-sm-5 cards">
					<div class="api-box pt-3">
						<div class="api-box-header ">
							<v-row dir="ltr">
								<v-col lg="2" sm="3" cols="5" class="pe-0 py-3">
									<div v-for="i in 3" class="circle ms-3"></div>
								</v-col>
								<v-col v-if="captures.length > 0 && error === false && $vuetify.display.smAndUp" lg="10"
									sm="9" cols="7" class="py-3 pe-8">
									<div class="url">
										<a :href="url">{{ url }}</a>
									</div>
								</v-col>
							</v-row>
						</div>

						<div class="text-center px-3 px-sm-5 pb-10">
							<div class="api-title">{{ $t("index.intro.title") }}</div>
							<div class="text-contentGray mb-10">{{ $t("index.intro.content") }}</div>
							<Images :images="images" :error="error"
								:width="captures.length > 0 ? $vuetify.display.smAndUp ? 470 : 200 : 150"
								:height="captures.length > 0 ? $vuetify.display.smAndUp ? 235 : 100 : 75" />
							<div v-if="captures.length > 0 && error === false" class="mt-5">
								<v-tooltip :text="url" location="top">
									<template v-slot:activator="{ props }">
										<v-btn v-bind="props" width="10px" color="blueText" class="me-1"><v-icon
												icon="mdi-link-variant"></v-icon></v-btn>
									</template>
								</v-tooltip>
								<v-btn prepend-icon="mdi-download" :href="url" color="primary" width="140px">{{
									$t("index.api-card.download-image.button") }}</v-btn>
							</div>

						</div>
					</div>
				</div>
			</v-col>
		</v-row>
		<div class="home-content text-center text-textGray">
			<div class="title-of-content mt-15">{{ $t("index.how-to-use.title") }}</div>
			<div>{{ $t("index.how-to-use.content") }}</div>
			<div class="code-background px-4 py-2 my-5" dir="ltr">
				&lt;img src="{{ getCaptureURL(inputData.url) }}"&gt;
			</div>
			<div class="title-of-content mt-15">{{ $t("index.options.title") }}</div>
			<div>{{ $t("index.options.content") }}</div>
			<div class="code-background px-4 py-2 my-5" dir="ltr">{{ `<img
					src="${getCaptureURL(inputData.url, { width: '100', height: '600' })}">` }}
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
import { getCaptureURL } from '~/utils/index';

const IMAGES_COUNT = 8;

interface IInput {
	url: string,
	width: string,
	height: string,
	maxAge: string,
	format: string,
	fullpage: string,
	timeout: string,
	viewportWidth: string,
	viewportHeight: string
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

		return { gallery, getCaptureURL, error, localePath: useLocalePath() };
	},
	data() {
		return {
			title: this.$t("pages.index"),
			error: false,
			captures: [] as IImage[],
			customResolutionStatus: false,
			customResolution: '',
			resolutionOptios: [
				{ title: '1024 × 768', value: { viewportWidth: '1024', viewportHeight: '768' } },
				{ title: '1280 × 800', value: { viewportWidth: '1280', viewportHeight: '800' } },
				{ title: '1680 × 1050', value: { viewportWidth: '1680', viewportHeight: '1050' } },
				{ title: '1600 × 900', value: { viewportWidth: '1600', viewportHeight: '900' } },
				{ title: '1440 × 900', value: { viewportWidth: '1440', viewportHeight: '900' } },
				{ title: '1280 × 1024', value: { viewportWidth: '1280', viewportHeight: '1024' } },
				{ title: '1366 × 768', value: { viewportWidth: '1366', viewportHeight: '768' } },
				{ title: '1200 × 600', value: { viewportWidth: '1200', viewportHeight: '600' } }
			],
			selectedResolution: { viewportWidth: '1200', viewportHeight: '600' },
			formatOptios: ["jpeg", "png"],
			inputData: {
				url: "https://www.google.com",
				width: "1200",
				height: "600",
				maxAge: "86400",
				format: "jpeg",
				fullpage: "false",
				timeout: "10000",
				viewportWidth: "1200",
				viewportHeight: "600"
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
				url: this.url,
				date: new Date(),
			}];
		},
		setResolution() {
			this.inputData.viewportWidth = this.selectedResolution.viewportWidth;
			this.inputData.viewportHeight = this.selectedResolution.viewportHeight;
		},
		toggleCustomResolution() {
			this.customResolutionStatus = !this.customResolutionStatus;
			this.inputData.viewportWidth = "1200";
			this.inputData.viewportHeight = "600";
			this.selectedResolution = { viewportWidth: '1200', viewportHeight: '600' };
			this.customResolution = '';

		},
		resolutionRule(value: string): string | boolean {
			if (!value) {
				return "required";
			}
			if (!/^\d+\-\d+$/.test(value)) {
				return "invalid";
			}
			return true;
		},
		setCustomResolution() {
			this.inputData.viewportWidth = this.customResolution.substring(0, this.customResolution.indexOf("-"));
			this.inputData.viewportHeight = this.customResolution.substring(this.customResolution.indexOf("-") + 1, this.customResolution.length);
		}
	},
	computed: {
		images(): IImage[] {
			return this.captures.length > 0 ? this.captures : this.gallery;
		},
		url(): string {
			return getCaptureURL(this.inputData.url, {
				width: this.inputData.width,
				height: this.inputData.height,
				maxAge: this.inputData.maxAge,
				format: this.inputData.format,
				fullpage: this.inputData.fullpage,
				timeout: this.inputData.timeout,
				viewportWidth: this.inputData.viewportWidth,
				viewportHeight: this.inputData.viewportHeight
			})
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
	box-shadow: 0px 0px 8px 0px rgba(var(--v-theme-shadowGray), 0.08);
	border-radius: 20px;
	background-color: white;
	font-size: 14px;

	.v-field__input {
		text-align: center;
	}
}

.api-box {
	border: 3px solid rgba(var(--v-theme-shadowGray), 0.06);
	border-radius: 15px;

	.api-box-header {
		border-bottom: 3px solid rgba(var(--v-theme-shadowGray), 0.06);

		.circle {
			border-radius: 50%;
			border: 3.5px solid rgba(var(--v-theme-shadowGray), 0.06);
			width: 22px;
			height: 22px;
			display: inline-block;
		}
	}

	.url {
		a {
			text-decoration: none;
			color: rgb(var(--v-theme-blueText))
		}

		white-space: nowrap;
		overflow-x: auto;
		text-overflow: ellipsis;
	}

	.api-title {
		margin-top: 20px;
		margin-bottom: 10px;
		color: rgb(var(--v-theme-titleGray));
		font-size: 18px;
		font-weight: 800;
	}

	.v-btn--size-default {
		min-width: 20px;
	}
}

.home-content {
	.title-of-content {
		font-size: 18px;
		font-weight: 800;
	}

	.code-background {
		background-color: rgb(var(--v-theme-secondary));
		border-radius: 10px;
		color: rgb(var(--v-theme-codeText));
		font-family: SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
		font-size: 14px;
		white-space: nowrap;
		overflow-x: auto;
		text-overflow: ellipsis;
		box-shadow: 0px 0px 8px 0px rgba(var(--v-theme-shadowGray), 0.08);
	}
}

.v-field__input {
	--v-field-input-padding-top: 8px;
	--v-field-input-padding-bottom: 8px;
	--v-input-control-height: 0px;
	--v-field-padding-start: 20px;
}

.v-field--appended {
	padding-inline-end: 0px;
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
		font-size: 13px;
	}

	.v-input__details {
		display: none;
	}
}

.units {
	font-size: 11px;
}

.switch-btn {
	.fullPage-title {
		align-content: center;
	}

	.v-input__details {
		display: none;
	}
}
</style>