<script>
import {defineComponent} from "vue";
import img from "@/assets/images/error/dinasor.png";

export default defineComponent({
    setup() {
        return { img };
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        }
    }
});
</script>

<template>
    <div tw="h-full w-full flex p-2 items-center justify-center" style="background-color: #f7f7f7">
        <div tw="flex flex-col" style="height: 160px; width: 350px;">
            <img :src="img" :width="74" :height="74" />
            <h1 style="color: #333;font-size: 24px;" v-text="title" />
            <p style="color: #777;font-size: 13px;" v-text="description" />
        </div>
    </div>
</template>