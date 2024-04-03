<template>
    <v-container class="py-0">
        <div class="footer" :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'">
            <v-divider class="mb-5"></v-divider>
            <v-row>
                <v-col sm="6" cols="12"
                    :align="$vuetify.display.mobile ? 'center' : $vuetify.locale.isRtl ? 'right' : 'left'">
                    <img src="./../styles/pics/logo.png" />
                </v-col>
                <v-col sm="6" cols="12"
                    :align="$vuetify.display.mobile ? 'center' : $vuetify.locale.isRtl ? 'left' : 'right'">
                    <v-btn variant="text">مستندات</v-btn>
                    <v-btn variant="text">گالری</v-btn>
                    <v-btn variant="text">تماس با ما</v-btn>
                </v-col>
            </v-row>
            <v-divider class="my-5"></v-divider>
            <div class="footer-sen">&copy; کلیه ی حقوق مادی و معنوی این سایت محفوظ می باشد.</div>
        </div>
    </v-container>
</template>
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