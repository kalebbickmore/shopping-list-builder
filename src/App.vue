<script setup lang="ts">
// App.vue is the root component. <RouterView /> is where the current route's
// view (right now just HomeView) gets rendered.
import { RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <h1>🛒 Shopping List</h1>
  </header>
  <RouterView />
</template>

<style scoped>
.app-header {
  text-align: center;
  margin-bottom: 1.5rem;
}
.app-header h1 {
  font-size: 1.6rem;
  margin: 0;
}
</style>
