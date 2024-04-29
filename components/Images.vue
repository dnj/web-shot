<template>
    <div v-if="images && !error" class="my-2" justify="center">
        <a v-for="(image, i) in images" :key="getId(image, i)" :href="image.url" target="_blank">
            <img class="image-card mx-1" :src="getImageURL(image)" :width="width" :height="height"></img>
        </a>
    </div>
    <v-alert class="my-5 text-start" v-if="error" :text="$t('fetch-data.error.server')" type="error" variant="tonal"
        closable></v-alert>
</template>
<script lang="ts">
import type { PropType } from 'vue'

export interface IImage {
    id?: number;
    date?: Date;
    url: string;
}

export function fetchGallery(count: number): Promise<IImage[]> {
    const q = new URLSearchParams({ count: count.toString() });
    return $fetch<IImage[]>(`/api/gallery?${q}`);
}

export default defineComponent({
    props: {
        images: {
            type: Array as PropType<IImage[]>
        },
        width: {
            type: Number,
            default: 100
        },
        height: {
            type: Number,
            default: 50
        },
        error: Boolean
    },
    methods: {
        getImageURL(image: IImage): string {
            const q = new URLSearchParams({
                width: this.width.toString(),
                height: this.height.toString()
            });
            let url: string;
            if (image.id !== undefined) {
                url = `/api/gallery/${image.id}`;
            } else {
                q.set("url", image.url);
                url = "/capture";
            }
            return `${url}?${q}`;
        },
        getId(image: IImage, index: number): number | string {
            if (image.id !== undefined) {
                return `id-${image.id}`;
            }
            if (image.date !== undefined) {
                return `date-${image.date.getTime()}`;
            }

            return `index-${index}`;
        }
    }
})
</script>
<style>
.image-card {

    border-radius: 5px;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
}
</style>