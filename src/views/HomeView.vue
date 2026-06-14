<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useShoppingListStore } from '@/stores/shoppingList'
import AddItemForm from '@/components/AddItemForm.vue'
import ShoppingListItem from '@/components/ShoppingListItem.vue'

const store = useShoppingListStore()

// storeToRefs keeps state/getters reactive when we pull them out of the store.
// (Actions like addItem are plain functions, so we call them via `store.` below.)
const { items, totalCount, remainingCount } = storeToRefs(store)
</script>

<template>
  <main class="list">
    <!-- Listen for the child's "add" event and forward the payload to the store action -->
    <AddItemForm @add="store.addItem" />

    <p v-if="totalCount === 0" class="empty">Your list is empty. Add something above 🛒</p>

    <ul v-else class="items">
      <!-- v-for renders one ShoppingListItem per item; :key helps Vue track them efficiently -->
      <ShoppingListItem
        v-for="item in items"
        :key="item.id"
        :item="item"
        @toggle="store.toggleDone"
        @remove="store.removeItem"
      />
    </ul>

    <footer v-if="totalCount > 0" class="summary">
      <span>{{ remainingCount }} of {{ totalCount }} left</span>
      <button @click="store.clearDone">Clear done</button>
    </footer>
  </main>
</template>

<style scoped>
.items {
  list-style: none;
  padding: 0;
  margin: 0;
}
.empty {
  text-align: center;
  color: var(--muted);
  padding: 2rem 0;
}
.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  color: var(--muted);
  font-size: 0.9rem;
}
.summary button {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  color: var(--text);
}
</style>
