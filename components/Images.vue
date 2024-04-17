<template>
    <v-row v-if="images && !error" class="my-2" justify="center">
        <v-col class="pa-2" cols="1" v-for="(image, i) in images" :key="i">
            <a :href="image.url" target="_blank">
                <v-img v-if="image.id"
                    :src="getPublickEndPoint(`api/gallery/${image.id}?width=200&height=150`)"></v-img>
                <v-img v-if="!image.id"
                    :src="getPublickEndPoint(`capture?url=${image.url}&width=200&height=150`)"></v-img>
            </a>
        </v-col>
    </v-row>
    <v-progress-circular v-if="pending" indeterminate class="my-5" color="primary" />
    <v-alert class="my-5 text-start" v-if="error" :text="$t('fetch-data.error.server')" type="error" variant="tonal"
        closable></v-alert>
</template>
<script lang="ts">
import type { PropType } from 'vue'
import { getPublickEndPoint } from '~/utilities';
interface IImage {
    id?: number;
    url: string;
}
export default defineComponent({
    setup() {
        return { getPublickEndPoint };
    },
    props: {
        images: {
            type: Array as PropType<IImage[]>
        },
        pending: Boolean,
        error: Boolean
    },
})
</script>