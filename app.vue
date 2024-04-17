<template>
  <v-app>
    <v-locale-provider :rtl="isRTL">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </v-locale-provider>
  </v-app>
</template>
<script lang="ts">
export default defineComponent({
  setup() {
    return { locale: useI18n().locale };
  },
  computed: {
    isRTL() {
      return ["fa", "ar"].includes(this.locale);
    }
  }
})
</script>