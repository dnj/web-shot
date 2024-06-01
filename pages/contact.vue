<template>
    <div class="pages-header py-6">
        <v-container>
            <h1>{{ $t("contact.title") }}</h1>
        </v-container>
    </div>
    <v-container class="contact-us mt-6 mb-15">
        <v-row>
            <v-col md="6" cols="12" class="px-sm-12 px-5">
                <div class="title mt-4 mb-6 text-textGray">{{ $t("contact.sub-title") }}</div>
                <div>{{ $t("contact.content") }}</div>
                <v-row class="mb-3 mt-10">
                    <v-col cols="1"><v-icon icon="mdi-github" size="x-large"></v-icon></v-col>
                    <v-col cols="11" class="px-6">
                        <div>{{ $t("contact.link.github") }}</div>
                        <a href="https://github.com/dnj/web-shot" target="_blank" dir="ltr"
                            class="text-decoration-none text-blueText">https://github.com/dnj/web-shot</a>
                    </v-col>
                </v-row>
                <v-divider :thickness="2"></v-divider>
                <v-row class="my-3">
                    <v-col cols="1">
                        <TelegramIcon />
                    </v-col>
                    <v-col cols="11" class="px-6">
                        <div>{{ $t("contact.link.telegram") }}</div>
                        <a href="https://t.me/dnjco" target="_blank" dir="ltr"
                            class="text-decoration-none text-blueText">@dnjco</a>
                    </v-col>
                </v-row>
            </v-col>
            <v-col md="6" cols="12" class="px-sm-12 px-5">
                <div class="title mt-4 mb-6 text-textGray">{{ $t("contact.form.title") }}</div>
                <v-form @submit.prevent="onSubmit" v-model="valid">
                    <div>{{ $t("contact.form.full-name") }}<span class="text-red"> *</span></div>
                    <v-text-field variant="outlined" v-model="name" :rules="[nameValidation]"></v-text-field>
                    <div class="mt-4">{{ $t("contact.form.email") }}<span class="text-red"> *</span></div>
                    <v-text-field variant="outlined" v-model="email" :rules="[emailValidation]"
                        dir="ltr"></v-text-field>
                    <div class="mt-4">{{ $t("contact.form.message") }}<span class="text-red"> *</span></div>
                    <v-textarea variant="outlined" v-model="message" :rules="[messageValidation]"></v-textarea>
                    <v-btn type="submit" color="customGreen" class="text-secondary mt-4" elevation="0"
                        :disabled="!valid" :loading="loading"><v-icon class="mb-1 me-1"
                            :class="$vuetify.locale.isRtl ? 'send-btn-icon-rtl' : 'send-btn-icon-ltr'" size="small"
                            icon="mdi-send"></v-icon>{{
                        $t("contact.form.button") }}</v-btn>
                </v-form>
                <v-alert closable class="mt-5" v-if="sentSuccessfully" :text="$t('contact.email.sent-successfully')"
                    type="success" variant="tonal"></v-alert>
                <v-alert closable class="mt-5" v-if="didNotSent" :text="$t('contact.email.not-sent')" type="error"
                    variant="tonal"></v-alert>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">
import TelegramIcon from '~/components/TelegramIcon.vue';

export default defineComponent({
    components: {
        TelegramIcon
    },
    setup() {
        const mail = useMail();
        return { mail };
    },
    data() {
        return {
            valid: false,
            name: '',
            email: '',
            message: '',
            loading: false,
            sentSuccessfully: false,
            didNotSent: false,
        }
    },
    methods: {
        async onSubmit() {
            this.loading = true;
            this.sentSuccessfully = false;
            this.didNotSent = false;
            try {
                await this.mail.send({
                    from: `${this.name} <${this.email}>`,
                    subject: this.$t("contact.email.subject"),
                    text: this.message,
                })
                this.sentSuccessfully = true;
            }
            catch(e) {
                this.didNotSent = true;
            }
            finally {
                this.loading = false;
            }
            
         },
        emailValidation(value: string): boolean | string {
            if (!value) {
                return this.$t("contact.form.error.email");
            }
            if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)) {
                return this.$t("contact.form.error.invalid.email");
            }
            return true;
        },
        nameValidation(value: string): boolean | string {
            if (!value) {
                return this.$t("contact.form.error.full-name");
            }
            return true;
        },
        messageValidation(value: string): boolean | string {
            if (!value) {
                return this.$t("contact.form.error.message");
            }
            return true;
        }
    }
})
</script>
<style lang="scss">
.pages-header {
    background-color: rgb(var(--v-theme-secondary));
    border-top: 1px solid rgba(var(--v-theme-shadowGray), 0.09);
    box-shadow: 0px 0px 8px 0px rgba(var(--v-theme-shadowGray), 0.08);
}

.contact-us {
    .title {
        font-size: 18px;
        font-weight: 800;
    }

    .v-field__input {
        background-color: rgb(var(--v-theme-secondary));
        box-shadow: 0px 0px 8px 0px rgba(var(--v-theme-shadowGray), 0.08);
    }

    .v-btn__prepend {
        margin: 4px;
    }

    .send-btn-icon-ltr {
        transform: rotate(-40deg);
    }

    .send-btn-icon-rtl {
        transform: rotate(-140deg);
    }
}
</style>