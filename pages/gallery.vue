<template>
    <div class="pages-header py-6 mb-5">
        <v-container>
            <h1>{{ $t("gallery.title") }}</h1>
        </v-container>
    </div>
    <v-container class="gallery mb-15">
        <p class="mb-8" v-text="$t('gallery.subtitle', {count: images.length})" />
        <Images :images="images" :error="error" />
    </v-container>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Images, { fetchGallery } from '~/components/Images.vue';

interface IImage {
    id?: number;
    url: string;
}

export default defineComponent({

    components: {
        Images,
    },
    async setup() {
        const { t } = useI18n()
        useHead({
            title: t("pages.index") + " | " + t("pages.gallery")
        });

        let images: IImage[] = [];
        let error = false;

        try {
            images = await fetchGallery(500);
        }
        catch {
            error = true;
        }
        return { images, error };

    },
})
</script>