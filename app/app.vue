<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'en' },
  link: [{ rel: 'icon', href: '/favicon.ico' }]
})

useSeoMeta({
  title: 'Shopping List',
  description: 'A private shared shopping list, built to learn the Vue/Nuxt ecosystem.'
})
</script>

<template>
  <!-- UApp provides Nuxt UI's global context (toasts, color mode, etc.) -->
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="text-lg font-semibold text-highlighted"
        >
          🛒 Shopping List
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <!-- NuxtPage renders the current route (file-based routing from app/pages) -->
      <NuxtPage />
    </UMain>
  </UApp>
</template>
