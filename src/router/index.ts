import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  // BASE_URL matters for deployment: on GitHub Pages the app lives under a
  // sub-path (/shopping-list-builder/), and Vite injects that here for us.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    // We'll add a /login route here when we add authentication later.
  ],
})

export default router
