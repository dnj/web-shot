<template>
	<div class="banner text-center py-15">
		<h1>{{ $t("index.banner.title") }}</h1>
		<div class="text-secondary"><strong>{{ $t("index.banner.subtitle") }}</strong></div>
		<v-row justify="center" class="mt-5">
			<v-col lg="5" md="8" sm="10" cols="11">
				<v-text-field variant="outlined" dir="ltr" class="px-0">
					<template v-slot:append-inner>
						<v-btn color="primary" height="100%" elevation="0" class="font-weight-bold">{{
							$t("index.banner.capture") }}</v-btn>
					</template>
				</v-text-field>
			</v-col>
		</v-row>
		<v-btn to="/docs" class="mt-5" color="primary">{{ $t("index.banner.start") }}</v-btn>
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
			<v-btn variant="text" color="primary">{{ $t("index.options.button") }}</v-btn>
		</div>
	</v-container>
</template>
<script lang="ts">
import { useI18n } from '#imports'

export default defineComponent({
	
	setup(){
		const { t } = useI18n()
		useHead({
			title: t("pages.index")
		})
	},
	data() {
		return {
			url: "",
			title: this.$t("pages.index")
		 };
	},
	methods: {
		getCaptureURL(query?: Record<string, string>) {
			const url = this.url || "https://www.google.com/";
			const params = (new URLSearchParams(Object.assign({ url: url }, query))).toString().replaceAll("%2F", "/").replaceAll("%3A", ":");
			const location = useRequestURL();
			return new URL((location.protocol || "http:") + "//" + location.host + "/capture?" + params);
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