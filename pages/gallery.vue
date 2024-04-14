<template>
    <v-container class="gallery mb-15">
        <div class="gallery-title">{{ $t("gallery.title") }}</div>
        <div class="gallery-content">
            {{ $t("gallery.content.part1") + " " + numberOfImages + " " + $t("gallery.content.part2") +
            $t("gallery.content.part3") }}
        </div>
        <Images @imagesNum="setImagesNum" :count="'120'" />
    </v-container>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Images from '~/components/Images.vue';
export default defineComponent({
    
    components:{
        Images,
    },
    async setup() {
        const { t } = useI18n()
        useHead({
            title: t("pages.index") + " | " + t("pages.gallery")
        });
    },
    data() {
        return {
            numberOfImages: 0,
        }
    },
    methods:{
        setImagesNum(numberOfImages:number){
            this.numberOfImages = numberOfImages;
        }
    }
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