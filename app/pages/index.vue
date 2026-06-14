<script setup lang="ts">
import { storeToRefs } from 'pinia'
// useShoppingListStore is auto-imported from app/stores by @pinia/nuxt; we import
// it explicitly here just so the source is obvious while learning.
import { useShoppingListStore } from '~/stores/shoppingList'

const store = useShoppingListStore()
// storeToRefs keeps state/getters reactive when destructured. Actions stay on `store`.
const { items, totalCount, remainingCount } = storeToRefs(store)
</script>

<template>
  <UContainer class="max-w-2xl py-8">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-highlighted">
            Your list
          </h2>
          <span
            v-if="totalCount > 0"
            class="text-sm text-muted"
          >
            {{ remainingCount }} of {{ totalCount }} left
          </span>
        </div>
      </template>

      <AddItemForm
        class="mb-4"
        @add="store.addItem"
      />

      <p
        v-if="totalCount === 0"
        class="py-8 text-center text-muted"
      >
        Your list is empty. Search for a food above 🛒
      </p>

      <ul
        v-else
        class="space-y-2"
      >
        <ShoppingListItem
          v-for="item in items"
          :key="item.id"
          :item="item"
          @toggle="store.toggleDone"
          @remove="store.removeItem"
        />
      </ul>

      <template
        v-if="totalCount > 0"
        #footer
      >
        <div class="flex justify-end">
          <UButton
            color="neutral"
            variant="subtle"
            icon="i-lucide-check-check"
            label="Clear done"
            @click="store.clearDone"
          />
        </div>
      </template>
    </UCard>
  </UContainer>
</template>
