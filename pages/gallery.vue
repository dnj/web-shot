<template>
    <v-container class="gallery mb-15">
        <div class="gallery-title">{{ $t("gallery.title") }}</div>
        <div class="gallery-content">
            {{ $t("gallery.content.part1") + " " + numberOfImages + " " + $t("gallery.content.part2") +
            $t("gallery.content.part3") }}
        </div>
        <Images :images="images" :pending="pending" :error="error" />
    </v-container>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Images from '~/components/Images.vue';
import { getPublickEndPoint } from '~/utilities';
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

        let images: IImage[] | undefined;
        let pending: boolean = true;
        let error: boolean = false;

        try {
            const params = new URLSearchParams({ 'count': '120' });
            images = await $fetch(getPublickEndPoint(`api/gallery?${params.toString()}`));
        }
        catch {
            error = true;
        }
        finally {
            pending = false;
        }
        return { images, error, pending, getPublickEndPoint };

    },
    data() {
        return {
            numberOfImages: this.images ? this.images.length : 0,
        }
    },
})
</script>
<style lang="scss">
.gallery {
    text-align: center;

    .gallery-title {
        color: rgb(var(--v-theme-titleGray));
        font-weight: 900;
        font-size: 35px;
        margin: 60px auto 20px auto;
    }

    .gallery-content {
        color: rgb(var(--v-theme-contentGray));
        ;
    }
}
</style>