<template>
    <v-container class="mb-15">
        <div class="gallery">
            <div class="gallery-title">گالری تصاویر</div>
            <div class="gallery-content">نگاهی به تصاویر web-shot.ir از 0 وب سایت برتر نگاه کنید. رابط
                برنامه
                نویسی ما تصاویری با کیفیت بالا را
                دریافت می کند و آنها را بر روی یک زیر ساخت شبکه نگهداری می کند تا در سریع ترین زمان آنها را تحویل دهد.
            </div>
        </div>
    </v-container>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    setup(){
        useHead({
            title: 'وب شات | گالری'
        })
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
        color: rgb(var(--v-theme-contentGray));;
    }
}
</style>