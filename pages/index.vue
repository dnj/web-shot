<template>
	<div class="banner text-center pt-15 pb-5 px-5">
		<h1>{{ $t("index.banner.title") }}</h1>
		<div class="text-secondary"><strong>{{ $t("index.banner.subtitle") }}</strong></div>
		<v-row justify="center" class="mt-5">
			<v-col lg="5" md="8" sm="10" cols="11">
				<v-text-field variant="outlined" dir="ltr" v-model="inputUrl" class="px-0">
					<template v-slot:append-inner>
						<v-btn color="primary" height="100%" elevation="0" class="font-weight-bold" @click="onSubmit">{{
							$t("index.banner.capture") }}</v-btn>
					</template>
				</v-text-field>
			</v-col>
		</v-row>
		<v-row align="center" justify="center">
			<v-col cols="6">
				<a :href="url" target="_blank"><img v-if="response"
						:src="getPublickEndPoint(`capture?url=${url}&width=550&height=350`)"></img></a>
			</v-col>
		</v-row>

		<Images :images="images" :pending="pending" :error="error" :key="componentKey" />
		<v-btn :to="localePath('docs')" class="mt-5" elevation="0" color="primary">{{ $t("index.banner.start")
			}}</v-btn>
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
				&lt;img src="{{ getCaptureURL() }}"&gt;
			</div>
			<div class="title-of-content">{{ $t("index.options.title") }}</div>
			<div class="content">{{ $t("index.options.content") }}</div>
			<div class="code-background" dir="ltr">{{ `<img src="${getCaptureURL({ width: '100', crop: '600' })}">` }}
			</div>
			<div class="content">{{ $t("index.options.code-explanation") }}</div>
			<v-btn variant="text" color="primary" :to="localePath('docs')">{{ $t("index.options.button") }}</v-btn>
		</div>
	</v-container>
</template>
<script lang="ts">
import { useI18n } from '#imports'
import Images from '~/components/Images.vue';
import { ref } from 'vue';
import { getPublickEndPoint } from '~/utilities';

interface IImage {
	id?: number;
	url: string;
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
		let images: IImage[] | undefined;
		let pending: boolean = true;
		let error: boolean = false;

		try {
			const params = new URLSearchParams({ 'count': '24' });
			images = await $fetch(getPublickEndPoint(`api/gallery?${params.toString()}`));
		}
		catch {
			error = true;
		}
		finally {
			pending = false;
		}

		return { images, error, pending, localePath: useLocalePath(), getPublickEndPoint };
	},
	data() {
		return {
			inputUrl: "https://www.google.com",
			url: "https://www.google.com",
			title: this.$t("pages.index"),
			error: false,
			pending: true,
			response: false,
			componentKey : ref(0)
		};
	},
	methods: {
		getCaptureURL(query?: Record<string, string>) {
			const url = this.url;
			const params = (new URLSearchParams(Object.assign({ url: url }, query))).toString().replaceAll("%2F", "/").replaceAll("%3A", ":");
			const location = useRequestURL();
			return new URL((location.protocol || "http:") + "//" + location.host + "/capture?" + params);
		},
		async onSubmit() {
			this.response = true;
			this.url = this.inputUrl;
			if (this.images){
				if (this.images[0].url !== this.inputUrl){
					this.images.unshift({ url: this.inputUrl })
				}
			}else{
				this.images = [{ url: this.inputUrl }]
			}
			this.forceRerender();
		},
		forceRerender() {
			this.componentKey += 1;
		}
	},
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