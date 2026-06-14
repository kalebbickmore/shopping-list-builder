<script setup lang="ts">
import { ref } from 'vue'
import type { FoodSuggestion } from '~/types'

// `stores` (data DOWN) = stores already used, for quick-pick chips.
defineProps<{
  stores?: string[]
}>()

const emit = defineEmits<{
  add: [name: string, quantity: number, store: string]
}>()

// useFoodSearch() is auto-imported from app/composables, no import needed.
const { query, results, loading, error, clear } = useFoodSearch()
const quantity = ref(1)
const store = ref('')
const open = ref(false)

function submit() {
  const name = query.value.trim()
  if (!name) return
  emit('add', name, quantity.value, store.value)
  quantity.value = 1
  // Keep `store` so you can add several items for the same store in a row;
  // clear it with the ✕ when you move on.
  clear()
  open.value = false
}

function pick(food: FoodSuggestion) {
  query.value = food.name
  open.value = false
}
</script>

<template>
  <form
    class="space-y-3"
    @submit.prevent="submit"
  >
    <!-- Quick-pick stores ABOVE the inputs, so the suggestions dropdown (which
         opens below the search box) can never cover them. The active store is
         highlighted. -->
    <div
      v-if="stores && stores.length > 0"
      class="flex flex-wrap items-center gap-1.5"
    >
      <span class="flex items-center gap-1 text-xs font-medium text-muted">
        <UIcon
          name="i-lucide-tags"
          class="size-3.5"
        />
        Quick pick:
      </span>
      <UButton
        v-for="s in stores"
        :key="s"
        size="xs"
        :color="store === s ? 'primary' : 'neutral'"
        :variant="store === s ? 'solid' : 'soft'"
        :label="s"
        class="rounded-full transition-transform active:scale-95"
        @click="store = store === s ? '' : s"
      />
    </div>

    <!-- flex-wrap so on narrow screens the search takes the full first line and
         store / quantity / add wrap onto the next. -->
    <div class="flex flex-wrap gap-2">
      <!-- Food search. The dropdown lives inside this relative wrapper, so it
           only spans the search box's width, the store field beside it stays
           visible. -->
      <div class="relative w-full sm:w-auto sm:flex-1">
        <UInput
          v-model="query"
          placeholder="Search foods…"
          icon="i-lucide-search"
          autocomplete="off"
          class="w-full"
          @focus="open = true"
          @blur="open = false"
        />

        <div
          v-if="open && query.trim().length >= 2"
          class="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-default bg-default shadow-lg"
        >
          <p
            v-if="error"
            class="px-3 py-2 text-sm text-error"
          >
            {{ error }}
          </p>

          <!-- Keep results visible while the next query loads, so the list
               doesn't flash on every keystroke. -->
          <ul
            v-else-if="results.length > 0"
            class="max-h-72 overflow-y-auto"
          >
            <!-- @mousedown.prevent keeps the input focused so the click registers
                 before @blur closes the menu. -->
            <li
              v-for="food in results"
              :key="food.id"
              class="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-elevated"
              @mousedown.prevent="pick(food)"
            >
              <UAvatar
                :src="food.imageUrl ?? undefined"
                icon="i-lucide-shopping-basket"
                size="sm"
              />
              <span class="flex-1 truncate text-sm text-highlighted">{{ food.name }}</span>
              <span
                v-if="food.brand"
                class="truncate text-xs text-muted"
              >{{ food.brand }}</span>
            </li>
          </ul>

          <p
            v-else-if="loading"
            class="px-3 py-2 text-sm text-muted"
          >
            Searching…
          </p>
          <p
            v-else
            class="px-3 py-2 text-sm text-muted"
          >
            No matches
          </p>
        </div>
      </div>

      <UInput
        v-model="store"
        placeholder="Store"
        icon="i-lucide-store"
        class="flex-1 sm:w-36 sm:flex-none"
      >
        <template
          v-if="store"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            size="xs"
            icon="i-lucide-x"
            aria-label="Clear store"
            @click="store = ''"
          />
        </template>
      </UInput>

      <UInput
        v-model.number="quantity"
        type="number"
        :min="1"
        class="w-16"
        aria-label="Quantity"
      />
      <UButton
        type="submit"
        icon="i-lucide-plus"
        aria-label="Add item"
      />
    </div>
  </form>
</template>
