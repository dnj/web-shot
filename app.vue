<template>
  <NuxtLayout>
    <v-app>
      <v-locale-provider :rtl="$vuetify.locale.isRtl">
        <NuxtPage />
      </v-locale-provider>
    </v-app>
  </NuxtLayout>
</template>
