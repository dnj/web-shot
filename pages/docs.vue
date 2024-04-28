<template>
    <v-container class="mb-15">
        <div class="docs">
            <div class="docs-title">{{ $t("documents.title") }}</div>
            <div class="docs-sub-title">{{ $t("documents.subtitle") }}</div>
            <div class="docs-content">{{ $t("documents.content") }}</div>
            <v-text-field variant="outlined" class="my-5" dir="ltr" v-model="url"></v-text-field>
            <v-btn elevation="0" color="primary" :href="getCaptureURL(inputData.url)" target="_blank">{{
                $t("documents.btn")
                }}</v-btn>
            <div class="docs-title2">{{ $t("documents.options.title") }}</div>
            <v-data-table :headers="headers" :items="tableData" class="mb-5">
                <template v-slot:item.required="{ value }">
                    <v-icon v-if="value" color="green" icon="mdi-checkbox-marked"></v-icon>
                    <v-icon v-if="!value" color="red" icon="mdi-close-thick"></v-icon>
                </template>
                <template v-slot:item.value="{ item }">
                    <v-text-field variant="outlined" v-model="inputData[item.name]"
                        v-if="['url', 'width', 'height', 'maxAge', 'timeout', 'viewportWidth', 'viewportHeight'].includes(item.name)"></v-text-field>
                    <v-checkbox class="my-2 checkbox" label="Yes" v-if="item.name === 'fullpage'"
                        v-model="inputData.fullpage"></v-checkbox>
                    <v-radio-group class="radiogroup" v-if="item.name === 'format'" v-model="inputData.format">
                        <v-row>
                            <v-col>
                                <v-radio label="jpeg" value="jpeg"></v-radio>
                            </v-col>
                            <v-col>
                                <v-radio label="png" value="png"></v-radio>
                            </v-col>
                        </v-row>
                    </v-radio-group>
                </template>
            </v-data-table>
        </div>
    </v-container>
</template>
<script lang="ts">

import { defineComponent } from 'vue';
import { useI18n } from '#imports';
import { getCaptureURL } from '~/utils/index';

interface IData {
    name: string,
    type: string,
    required: boolean,
    default: string,
    description: string,
    value: string,
}


export default defineComponent({
    setup() {
        const { t } = useI18n()
        useHead({
            title: t("pages.index") + " | " + t("pages.docs")
        })
        return { getCaptureURL }
    },
    data() {
        return {
            radios: 'jpeg',
            headers: [
                { title: this.$t("documents.options.table.header.name"), key: 'name' },
                { title: this.$t("documents.options.table.header.type"), key: 'type' },
                { title: this.$t("documents.options.table.header.required"), key: 'required' },
                { title: this.$t("documents.options.table.header.default-value"), key: 'default' },
                { title: this.$t("documents.options.table.header.description"), key: 'description', width: '30%' },
                { title: this.$t("documents.options.table.header.value"), key: 'value', width: '20%' },
            ],
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
            }
        }
    },
    computed: {
        tableData(): IData[] {
            return [
                {
                    name: 'url',
                    type: this.$t("documents.options.table.content.string"),
                    required: true,
                    default: '-',
                    description: this.$t("documents.options.table.content.description.url"),
                    value: this.url
                },
                {
                    name: 'width',
                    type: this.$t("documents.options.table.content.number"),
                    required: false,
                    default: '1200',
                    description: this.$t("documents.options.table.content.description.width"),
                    value: "1200"
                },
                {
                    name: 'height',
                    type: this.$t("documents.options.table.content.number"),
                    required: false,
                    default: '600',
                    description: this.$t("documents.options.table.content.description.height"),
                    value: "600"
                },
                {
                    name: 'maxAge',
                    type: this.$t("documents.options.table.content.number"),
                    required: false,
                    default: '86400',
                    description: this.$t("documents.options.table.content.description.maxAge"),
                    value: "86400"
                },
                {
                    name: 'format',
                    type: this.$t("documents.options.table.content.string"),
                    required: false,
                    default: "jpeg",
                    description: this.$t("documents.options.table.content.description.format"),
                    value: "jpeg"
                },
                {
                    name: 'fullpage',
                    type: 'true | false',
                    required: false,
                    default: 'false',
                    description: this.$t("documents.options.table.content.description.fullpage"),
                    value: 'false'
                },
                {
                    name: 'timeout',
                    type: this.$t("documents.options.table.content.number"),
                    required: false,
                    default: '10000',
                    description: this.$t("documents.options.table.content.description.timeout"),
                    value: '10000'
                },
                {
                    name: 'viewportWidth',
                    type: this.$t("documents.options.table.content.number"),
                    required: false,
                    default: '1200',
                    description: this.$t("documents.options.table.content.description.viewportWidth"),
                    value: '1200'
                },
                {
                    name: 'viewportHeight',
                    type: this.$t("documents.options.table.content.number"),
                    required: false,
                    default: '600',
                    description: this.$t("documents.options.table.content.description.viewportHeight"),
                    value: '600'
                }
            ]
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
.docs {
    .v-input__control {
        border: 1px solid rgb(var(--v-theme-primary));
        border-radius: 5px;

    }
    .radiogroup , .checkbox {
        .v-input__control {
            border: none;
        }
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
        color: rgb(var(--v-theme-contentGray));
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

    .v-input__details {
        display: none;
    }
}
</style>