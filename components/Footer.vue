<template>
    <div class="footer-top text-center">
        <div class="footer-line">
            <NuxtLink :to="localePath('/')" class="footer-title">
                <div>Web Shot</div>
            </NuxtLink>
            <div class="text-secondary">{{ $t("index.banner.title") }}</div>
        </div>
    </div>
    <v-container class="footer">
        <v-row>
            <v-col md="6" cols="12" class="py-2"
                :align="$vuetify.display.mobile ? 'center' : $vuetify.locale.isRtl ? 'right' : 'left'">
                <v-btn class="mx-1" :to="localePath('docs')" variant="text" prepend-icon="mdi-circle-medium">{{
                    $t("pages.docs") }}</v-btn>
                <v-btn class="mx-1" :to="localePath('gallery')" variant="text" prepend-icon="mdi-circle-medium">{{
                    $t("pages.gallery") }}</v-btn>
                <v-btn class="mx-1" :to="localePath('contact')" variant="text" prepend-icon="mdi-circle-medium">{{
                    $t("pages.contact") }}</v-btn>
            </v-col>
            <v-col md="6" cols="12" class="py-2"
                :align="$vuetify.display.mobile ? 'center' : $vuetify.locale.isRtl ? 'left' : 'right'">
                <div class="footer-sen">&copy; {{ $t("copy-right") }}</div>
            </v-col>
        </v-row>

    </v-container>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    setup() {
        return { localePath: useLocalePath() };
    }
})
</script>
<style lang="scss">
.footer {
    .v-btn__prepend {
        margin: 0px;
    }

    @media(max-width: 750px) {

        .v-btn {
            width: 88px;
            font-size: 13px;
        }
    }

}

.footer-top {
    background-color: rgb(var(--v-theme-primary));
    height: 135px;
    padding-top: 25px;

    .footer-line {
        background-image: url("~/assets/images/footer.svg");
        height: 120px;
    }
}

.footer-title {
    text-decoration: none;
    font-family: Audiowide;
    color: rgb(var(--v-theme-secondary));
    font-size: 32px;
    line-height: 40px;
}
</style>