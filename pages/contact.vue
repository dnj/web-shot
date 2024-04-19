<template>
    <v-container class="pt-15 pb-15">
        <v-row class="contact">
            <v-col md="6" cols="12" order="last" order-md="first">
                <div class="title">{{ $t("contact.title") }}</div>
                <div>{{ $t("contact.content") }}</div>
                <div>
                    <div class="title mt-7">{{ $t("contact.subtitle") }}</div>
                    <v-row cols="6">
                        <v-col cols="4">
                            <div class="font-weight-bold">{{ $t("contact.ways.email") }}</div>
                        </v-col>
                        <v-col cols="8">
                            <div class="ltr">hi@web-shot.ir</div>
                        </v-col>
                    </v-row>
                    <v-row cols="12">
                        <v-col cols="4">
                            <div class="font-weight-bold">{{ $t("contact.ways.phone") }}</div>
                        </v-col>
                        <v-col cols="8">
                            <div class="ltr">(+98)31-34420301</div>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
            <v-col md="6" cols="12">
                <v-img class="mx-auto" src="~/assets/images/contactus.svg" height="300px"></v-img>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from '#imports'

export default defineComponent({
    setup(){
        const { t } = useI18n()
        useHead({
            title: t("pages.index") + " | " + t("pages.contact")
        })
    }
})
</script>
<style lang="scss">
.contact {
    margin-top: 30px;
    margin-bottom: 30px;
    text-align: start;
    color: rgb(var(--v-theme-contentGray));
    line-height: 40px;

    .title {
        color: rgb(var(--v-theme-titleGray));
        font-weight: 900;
        font-size: 19px;
    }
    .ltr {
        direction: ltr;
    }
}
</style>