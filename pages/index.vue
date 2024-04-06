<template>
	<div class="banner text-center py-15">
		<h1>{{ $t("tool for capturing web pages") }}</h1>
		<div class="text-secondary"><strong>سریع، رایگان و بروز</strong></div>
		<v-row justify="center" class="mt-5">
			<v-col lg="5" md="8" sm="10" cols="11">
				<v-text-field variant="outlined" dir="ltr" class="px-0">
					<template v-slot:append-inner>
						<v-btn color="primary" height="100%" class="font-weight-bold">مشاهده تصویر</v-btn>
					</template>
				</v-text-field>
			</v-col>
		</v-row>
		<v-btn to="/docs" class="mt-5" color="primary">شروع!</v-btn>
	</div>
	<v-container class="mb-15">
		<div class="home-content text-center">
			<div class="title-of-content">تهیه تصاویر به صورت مستقیم انجام میشود</div>
			<div class="content">وب شات نمایش تصاویر زمان واقعی از وب سایت ها است. ما تنها تولید کننده ی عکس فوری وب
				سایت
				هستیم تا به محض اینکه شم آنها را درخواست می کنید تصاویر را در
				اختیارتان بگذاریم.با استفاده از رابط برنامه نویسی رایگان ما آن را امتحان کنید. </div>
		</div>
		<div class="home-content text-center">
			<div class="title-of-content">همین حالا امتحان کنید!</div>
			<div class="content">به سادگی از کد زیر در وبسایت خود استفاده کنید:</div>
			<div class="code-background" dir="ltr">
				&lt;img src="{{ getCaptureURL() }}"&gt;
			</div>
			<div class="title-of-content">گزینه های پیشرفته</div>
			<div class="content">گزینه های پیشرفته تر نیز وجود دارد، شما می توانید با تعیین عرض مشخصه تصویر را تغییر
				دهید و
				شما می توانید تعداد پیکسل های وب سایت اصلی که می خواهید برش دهید تعیین کنید. مثلا:</div>
			<div class="code-background" dir="ltr">{{ `<img
					src="${getCaptureURL({width: '100', crop: '600'})}">` }}</div>
			<div class="content">گرفتن عکسهای صفحه وب از یک مرورگر پیکسل 1200x1200 گرفته شده است. کد بالا، صفحه نمایش
				اصلی
				را به 100 پیکسل عرض می برد و سپس 600 پیکسل از تصویر را می برد.</div>
			<v-btn variant="text" color="primary">مشاهده لیست کلی گزینه ها</v-btn>
		</div>
	</v-container>
</template>
<script lang="ts">

export default defineComponent({ 
	data() {
		return {url: ""};
	},
	methods: {
		getCaptureURL(query?: Record<string, string>) {
			const url = this.url || "https://www.google.com/";
			const params = (new URLSearchParams(Object.assign({ url: url }, query))).toString().replaceAll("%2F", "/").replaceAll("%3A", ":");
			const location = useRequestURL();
			return new URL((location.protocol || "http:") + "//" + location.host + "/capture?" + params);
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
		color: rgb(var(--v-theme-contentGray));;
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