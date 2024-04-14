<template>
    <v-container class="py-0">
        <div class="footer" :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'">
            <v-divider class="mb-5"></v-divider>
            <v-row>
                <v-col sm="6" cols="12"
                    :align="$vuetify.display.mobile ? 'center' : $vuetify.locale.isRtl ? 'right' : 'left'">
                    <img src="~/assets/images/logo.png" />
                </v-col>
                <v-col sm="6" cols="12"
                    :align="$vuetify.display.mobile ? 'center' : $vuetify.locale.isRtl ? 'left' : 'right'">
                    <v-btn class="mx-1" :to="localePath('docs')" variant="text">{{ $t("pages.docs") }}</v-btn>
                    <v-btn class="mx-1" :to="localePath('gallery')" variant="text">{{ $t("pages.gallery") }}</v-btn>
                    <v-btn class="mx-1" :to="localePath('contact')" variant="text">{{ $t("pages.contact") }}</v-btn>
                </v-col>
            </v-row>
            <v-divider class="my-5"></v-divider>
            <div class="footer-sen">&copy; {{ $t("copy-right") }}</div>
        </div>
    </v-container>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    setup(){
        return { localePath: useLocalePath() };
    }
})
</script>
<style lang="scss">
.footer {
    .footer-sen {
        margin-top: 15px;
        margin-bottom: 15px;
        color: #707981;
    }

    @media(max-width:450px) {
        padding-left: 0px;
        padding-right: 0px;
    }
}
</style>