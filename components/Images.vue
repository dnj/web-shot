<template>
    <v-row v-if="images" class="my-2">
        <v-col class="pa-2" cols="1" v-for="image in images" :key="image.id">
            <a :href="image.url" target="_blank"><v-img
                    :src="`https://web-shot.ir/api/gallery/${image.id}?width=200&height=150`"></v-img></a>
        </v-col>
    </v-row>
    <v-progress-circular v-if="pending" indeterminate class="my-5" color="primary" />
    <v-alert class="my-5 text-start" v-if="error" :text="$t('fetch-data.error.server')" type="error" variant="tonal"
        closable></v-alert>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

interface IImage {
    id: number;
    url: string;
}

export default defineComponent({
    async setup(app) {
        let images: IImage[] | undefined;
        let pending: boolean = true;
        let error: boolean = false;
        try {
            const params = new URLSearchParams({ 'count': app.count });
            images = await $fetch(`https://web-shot.ir/api/gallery?${params.toString()}`);
        }
        catch {
            error = true;
        }
        finally{
            pending = false;
        }
        return { images, error, pending };
    },
    props:{
        count: {
            type: String,
            required: true
        }
    },
    created(){
        this.sendImageNum();
    },
    methods:{
        sendImageNum(){
            this.$emit("imagesNum", this.images ? this.images.length : 0)
        }
    }
})
</script>