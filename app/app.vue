<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'en' },
  link: [{ rel: 'icon', href: '/favicon.ico' }]
})

useSeoMeta({
  title: 'The Pantry List',
  description: 'A warm, joyful shopping list, built with Nuxt, Pinia & a lot of care.'
})
</script>

<template>
  <!-- UApp provides Nuxt UI's global context (toasts, color mode, etc.) -->
  <UApp>
    <UHeader :ui="{ root: 'border-default/60 bg-default/70 backdrop-blur-md' }">
      <template #left>
        <NuxtLink
          to="/"
          class="group flex items-baseline gap-1.5"
        >
          <!-- The basket gives a happy little hop on hover. -->
          <UIcon
            name="i-lucide-shopping-basket"
            class="mr-0.5 size-5 self-center text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-12"
          />
          <span class="font-display text-[0.72rem] italic tracking-wide text-primary">the</span>
          <span class="font-display text-xl font-semibold leading-none tracking-tight text-highlighted">
            Pantry List
          </span>
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
