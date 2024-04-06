<template>
    <v-container class="mb-15">
        <div class="docs">
            <div class="docs-title">مستندات رابط برنامه نویسی</div>
            <div class="docs-sub-title">مثال آدرس اینترنتی</div>
            <div class="docs-content">گزینه های اصلاح تصویر میتوانند به همراه آدرس وب سایت در آدرسی اینترنتی ارسال شوند.
                در
                زیر
                لیستی کامل از گزینه ها را مشاهده می کنید:</div>
            <v-text-field variant="outlined" class="mt-5" dir="ltr"></v-text-field>
            <v-btn color="primary">مشاهده ی تصویر وب سایت</v-btn>

            <div class="docs-title2">لیست کامل گزینه های اصلاح کننده تصویر</div>
            <v-data-table :headers="headers" :items="tableData" class="mb-5">
                <template v-slot:item.required="{ value }">
                    <v-icon v-if="value" color="green" icon="mdi-checkbox-marked"></v-icon>
                    <v-icon v-if="!value" color="red" icon="mdi-close-thick"></v-icon>
                </template>
            </v-data-table>
        </div>
    </v-container>
</template>
<script lang="ts">

import { defineComponent } from 'vue';

interface IData {
    option: string,
    type: string,
    required: boolean,
    description: string,
}

export default defineComponent({

    data() {
        return {
            headers: [
                { title: 'گزینه', key: 'option' },
                { title: 'نوع', key: 'type' },
                { title: 'اجباری', key: 'required' },
                { title: 'توضیحات', key: 'description' },
            ],
            tableData: [{
                option: 'url',
                type: 'رشته',
                required: true,
                description: 'آدرس اینترنتی وبسایت مقصد',
            },
            {
                option: 'width',
                type: 'عدد در واحد پیکسل',
                required: false,
                description: 'عرض تصویر (پیشفرض: 600px)',
            },
            {
                option: 'crop',
                type: 'عدد در واحد پیکسل',
                required: false,
                description: 'ارتفاع تصویر (پیشفرض: 1200px)',
            },
            {
                option: 'maxAge',
                type: 'عدد در واحد ثانیه',
                required: false,
                description: 'مقدار زمان مشخص برای بروزرسانی تصویر ذخیره شده',
            },
            {
                option: 'format',
                type: 'jpg | png',
                required: false,
                description: 'نوع تصویر',
            },
            {
                option: 'fullPage',
                type: 'true | false',
                required: false,
                description: 'تصویر شامل کل صفحه ی وب سایت باشد یا خیر',
            },
            {
                option: 'wait',
                type: 'عدد در واحد ثانیه، کمترین مقدار: 1ثانیه، بیشترین مقدار: 30ثانیه',
                required: false,
                description: 'مدت زمان انظار بعد از بارگزاری صفحه و تهیه تصویر بعد از زمان(پیشفرض: 0ثانیه)',
            },
            {
                option: 'viewportWidth',
                type: 'عدد در واحد پیکسل',
                required: false,
                description: 'تصویر صفحه وب سایت در عرض مشخص شده ذخیره خواهد شد.'
            },
            {
                option: 'viewportHeight',
                type: 'عدد در واحد پیکسل',
                required: false,
                description: 'تصویر صفحه وب سایت در ارتفاع مشخص شده ذخیره خواهد شد.'
            }
            ] as IData[]
        }
    }
})
</script>
<style lang="scss">
.docs {
    .v-input__control {
        border: 1px solid rgb(var(--v-theme-primary));
        border-radius: 5px;
        background-color: white;
    }

    .docs-title {
        color: rgb(var(--v-theme-titleGray));
        font-weight: 900;
        font-size: 35px;
        margin: 60px auto 20px auto;
    }

    .docs-sub-title {
        color: rgb(var(--v-theme-subtitleGray));
        font-weight: 900;
        font-size: 18px;
        margin-bottom: 30px;
    }

    .docs-content {
        color: rgb(var(--v-theme-contentGray));;
    }

    .docs-title2 {
        color: rgb(var(--v-theme-titleGray));
        font-weight: 900;
        font-size: 24px;
        margin: 60px auto 20px auto;
    }

    .v-data-table-footer {
        display: none;
    }

    .v-table .v-table__wrapper>table>tbody>tr:nth-child(2n-1)>td {
        background: #ededed;
    }
}
</style>