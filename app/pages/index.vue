<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
// useShoppingListStore is auto-imported from app/stores by @pinia/nuxt; we import
// it explicitly here just so the source is obvious while learning.
import { useShoppingListStore } from '~/stores/shoppingList'

const store = useShoppingListStore()
// storeToRefs keeps state/getters reactive when destructured. Actions stay on `store`.
const { totalCount, remainingCount, stores, groupedItems } = storeToRefs(store)

// Which store card is currently being hovered during a drag (for highlight).
const dragOverStore = ref<string | null>(null)

// Drop handler: read the dragged item id from the drag payload and reassign its
// store. 'Unassigned' maps back to an empty store.
function onDrop(targetStore: string, e: DragEvent) {
  dragOverStore.value = null
  const id = e.dataTransfer?.getData('text/plain')
  if (!id) return
  store.setStore(id, targetStore === 'Unassigned' ? '' : targetStore)
}
</script>

<template>
  <UContainer class="max-w-2xl space-y-6 py-8">
    <!-- Heading + completion progress -->
    <div class="space-y-3">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-highlighted">
            Your shopping list
          </h1>
          <p class="text-sm text-muted">
            <template v-if="totalCount > 0">
              {{ remainingCount }} of {{ totalCount }} left · {{ groupedItems.length }}
              {{ groupedItems.length === 1 ? 'store' : 'stores' }}
            </template>
            <template v-else>
              Nothing here yet
            </template>
          </p>
        </div>
        <UButton
          v-if="totalCount > 0"
          color="neutral"
          variant="ghost"
          icon="i-lucide-check-check"
          label="Clear done"
          @click="store.clearDone"
        />
      </div>
      <UProgress
        v-if="totalCount > 0"
        :model-value="totalCount - remainingCount"
        :max="totalCount"
        size="sm"
      />
    </div>

    <!-- Add form. Plain wrapper (NOT UCard) so the search dropdown isn't clipped. -->
    <div class="rounded-lg border border-default bg-default p-4">
      <AddItemForm
        :stores="stores"
        @add="store.addItem"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="totalCount === 0"
      class="flex flex-col items-center gap-2 py-10 text-center text-muted"
    >
      <UIcon
        name="i-lucide-shopping-cart"
        class="size-10"
      />
      <p>Your list is empty. Search for a food above to get started.</p>
    </div>

    <!-- One card per store. Each card is a drop zone — drag items between them. -->
    <div
      v-else
      class="space-y-4"
      @dragend="dragOverStore = null"
    >
      <div
        v-for="group in groupedItems"
        :key="group.store"
        class="rounded-xl transition"
        :class="dragOverStore === group.store ? 'ring-2 ring-primary' : ''"
        @dragover.prevent="dragOverStore = group.store"
        @drop.prevent="onDrop(group.store, $event)"
      >
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon
                :name="group.store === 'Unassigned' ? 'i-lucide-circle-help' : 'i-lucide-store'"
                class="size-4 text-muted"
              />
              <h2 class="flex-1 text-sm font-semibold text-highlighted">
                {{ group.store }}
              </h2>
              <UBadge
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ group.items.length }}
              </UBadge>
            </div>
          </template>

          <ul class="divide-y divide-default">
            <ShoppingListItem
              v-for="item in group.items"
              :key="item.id"
              :item="item"
              @toggle="store.toggleDone"
              @remove="store.removeItem"
            />
          </ul>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
