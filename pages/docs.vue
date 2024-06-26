<template>
    <div class="pages-header py-6 mb-5">
        <v-container>
            <h1>{{ $t("documents.title") }}</h1>
        </v-container>
    </div>
    <v-container class="mb-15">
        <div class="docs">
            <div class="title text-textGray">{{ $t("documents.subtitle") }}</div>
            <div>{{ $t("documents.content") }}</div>
            <v-row class="capture-url">
                <v-col md="9" cols="12">
                    <v-text-field variant="outlined" dir="ltr" v-model="url" class="my-5">
                        <template v-if="!$vuetify.locale.isRtl" v-slot:append-inner>
                            <v-btn color="primary" elevation="0" @click="onSubmit"
                                class="rounded-sm px-sm-5 px-2"><v-icon class="me-2" icon="mdi-camera"></v-icon>{{
                                    $t("documents.btn") }}</v-btn>
                        </template>
                        <template v-if="$vuetify.locale.isRtl" v-slot:prepend-inner>
                            <v-btn color="primary" elevation="0" @click="onSubmit"
                                class="rounded-sm px-sm-5 px-2"><v-icon class="me-2" icon="mdi-camera"></v-icon>{{
                                    $t("documents.btn") }}</v-btn>
                        </template>
                    </v-text-field>
                </v-col>
            </v-row>
            <div class="title text-textGray mt-10 mb-4">{{ $t("documents.options.title") }}</div>
            <v-data-table :headers="headers" :items="tableData" class="mb-5 rounded-lg">
                <template v-slot:item.required="{ value }">
                    <v-icon v-if="value" color="green" icon="mdi-checkbox-marked"></v-icon>
                    <v-icon v-if="!value" color="red" icon="mdi-close-thick"></v-icon>
                </template>
                <template v-slot:item.value="{ item }">
                    <v-text-field dir="ltr" variant="outlined" v-model="inputData[item.name]"
                        v-if="['url', 'width', 'height', 'maxAge', 'timeout', 'viewportWidth', 'viewportHeight'].includes(item.name)"></v-text-field>
                    <v-checkbox class="my-2 checkbox"
                        :label="$t('documents.options.table.content.input-lable.fullpage')"
                        v-if="item.name === 'fullpage'" v-model="inputData.fullpage"></v-checkbox>
                    <v-radio-group class="radiogroup" v-if="item.name === 'format'" v-model="inputData.format">
                        <v-row>
                            <v-col md="6" cols="12">
                                <v-radio label="jpeg" value="jpeg"></v-radio>
                            </v-col>
                            <v-col md="6" cols="12">
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
                { title: this.$t("documents.options.table.header.name"), key: 'name', width: '7%' },
                { title: this.$t("documents.options.table.header.type"), key: 'type', width: '7%' },
                { title: this.$t("documents.options.table.header.required"), key: 'required', width: '6%' },
                { title: this.$t("documents.options.table.header.default-value"), key: 'default', width: '10%' },
                { title: this.$t("documents.options.table.header.description"), key: 'description', width: '35%' },
                { title: this.$t("documents.options.table.header.value"), key: 'value', width: '35%' },
            ],
            inputData: {
                url: 'https://www.google.com',
                width: '1200',
                height: '600',
                maxAge: '86400',
                format: 'jpeg',
                fullpage: 'false',
                timeout: '10000',
                viewportWidth: '1200',
                viewportHeight: '600'
            } as IInput
        }
    },
    methods: {
        onSubmit() {
            window.open(this.url, "_blank")
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
    .capture-url {
        .v-input__control {
            box-shadow: 0px 0px 8px 0px rgba(var(--v-theme-shadowGray), 0.08);
            background-color: white;
        }
    }

    .radiogroup,
    .checkbox {
        .v-input__control {
            border: none;
        }
    }

    .title {
        font-size: 18px;
        font-weight: 800;
    }

    .v-field__input {
        --v-field-padding-start: 10px;
        --v-field-padding-end: 10px;
        --v-field-input-padding-top: 5px;
        --v-field-input-padding-bottom: 5px;
        --v-input-control-height: 46px;
    }

    .v-btn--size-default {
        --v-btn-height: 100%;
    }

    .v-field--appended {
        padding-inline-end: 0px;
    }

    .v-field--prepended {
        padding-inline-start: 0px;
    }

    .v-data-table-footer {
        display: none;
    }

    .v-table {
        box-shadow: 0px 0px 8px 0px rgba(var(--v-theme-shadowGray), 0.08);
        --v-border-opacity: 0;

        .v-table__wrapper>table>tbody>tr>td:last-child {
            min-width: 120px;
        }

        .v-table__wrapper>table>tbody>tr:nth-child(2n-1)>td {
            background: #ededed;
        }

        .v-data-table__td {
            padding-top: 7px;
            padding-bottom: 7px;
        }
    }

    .v-input__details {
        display: none;
    }
}
</style>