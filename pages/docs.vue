<template>
    <v-container class="mb-15">
        <div class="docs">
            <div class="docs-title">{{ $t("documents.title") }}</div>
            <div class="docs-sub-title">{{ $t("documents.subtitle") }}</div>
            <div class="docs-content">{{ $t("documents.content") }}</div>
            <v-text-field variant="outlined" class="mt-5" dir="ltr" v-model="url"></v-text-field>
            <v-btn elevation="0" color="primary" :href="getCaptureURL(url)" target="_blank">{{ $t("documents.btn") }}</v-btn>
            <div class="docs-title2">{{ $t("documents.options.title") }}</div>
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
import { useI18n } from '#imports';
import { getCaptureURL } from '~/utils/index';

interface IData {
    name: string,
    type: string,
    required: boolean,
    description: string,
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
            url: 'https://www.google.com',
            headers: [
                { title: this.$t("documents.options.table.header.name"), key: 'name' },
                { title: this.$t("documents.options.table.header.type"), key: 'type' },
                { title: this.$t("documents.options.table.header.required"), key: 'required' },
                { title: this.$t("documents.options.table.header.description"), key: 'description' },
            ],
            tableData: [{
                name: 'url',
                type: this.$t("documents.options.table.content.string"),
                required: true,
                description: this.$t("documents.options.table.content.description.url"),
            },
            {
                name: 'width',
                type: this.$t("documents.options.table.content.number"),
                required: false,
                description: this.$t("documents.options.table.content.description.width"),
            },
            {
                name: 'height',
                type: this.$t("documents.options.table.content.number"),
                required: false,
                description: this.$t("documents.options.table.content.description.height"),
            },
            {
                name: 'maxAge',
                type: this.$t("documents.options.table.content.number"),
                required: false,
                description: this.$t("documents.options.table.content.description.maxAge"),
            },
            {
                name: 'format',
                type: this.$t("documents.options.table.content.string"),
                required: false,
                description: this.$t("documents.options.table.content.description.format")
            },
            {
                name: 'fullpage',
                type: 'true | false',
                required: false,
                description: this.$t("documents.options.table.content.description.fullpage"),
            },
            {
                name: 'timeout',
                type: this.$t("documents.options.table.content.number"),
                required: false,
                description: this.$t("documents.options.table.content.description.timeout"),
            },
            {
                name: 'viewportWidth',
                type: this.$t("documents.options.table.content.number"),
                required: false,
                description: this.$t("documents.options.table.content.description.viewportWidth")
            },
            {
                name: 'viewportHeight',
                type: this.$t("documents.options.table.content.number"),
                required: false,
                description: this.$t("documents.options.table.content.description.viewportHeight")
            }
            ] as IData[]
        }
    },
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
}
</style>