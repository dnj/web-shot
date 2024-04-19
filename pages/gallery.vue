<template>
    <v-container class="gallery mb-15">
        <h1 class="gallery-title">{{ $t("gallery.title") }}</h1>
        <p class="gallery-content" v-text="$t('gallery.subtitle', {count: images.length})" />
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
<style lang="scss">
.gallery {
    .gallery-title {
        color: rgb(var(--v-theme-titleGray));
        font-weight: 900;
        font-size: 35px;
    }

    .gallery-content {
        color: rgb(var(--v-theme-contentGray));
        padding: 1em 0;
    }
}
</style>