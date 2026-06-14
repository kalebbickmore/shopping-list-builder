<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
// useShoppingListStore is auto-imported from app/stores by @pinia/nuxt; we import
// it explicitly here just so the source is obvious while learning.
import { useShoppingListStore } from '~/stores/shoppingList'

const store = useShoppingListStore()
// storeToRefs keeps state/getters reactive when destructured. Actions stay on `store`.
const { hydrated, totalCount, remainingCount, allDone, stores, groupedItems } = storeToRefs(store)

// Load saved data only after mount, so the prerendered (empty) HTML matches the
// first client render, no flash of empty state before the list appears.
onMounted(() => store.hydrate())

const boughtCount = computed(() => totalCount.value - remainingCount.value)
const progress = computed(() =>
  totalCount.value === 0 ? 0 : Math.round((boughtCount.value / totalCount.value) * 100)
)

// Which store card is currently being hovered during a drag (for highlight).
const dragOverStore = ref<string | null>(null)

function onDrop(targetStore: string, e: DragEvent) {
  dragOverStore.value = null
  const id = e.dataTransfer?.getData('text/plain')
  if (!id) return
  store.setStore(id, targetStore === 'Unassigned' ? '' : targetStore)
}

// --- Inline "add store" control ---
const newStore = ref('')
const addingStore = ref(false)
const storeInput = ref<{ inputRef?: HTMLInputElement } | null>(null)

async function startAddStore() {
  addingStore.value = true
  await nextTick()
  storeInput.value?.inputRef?.focus()
}

function submitStore() {
  const name = newStore.value.trim()
  if (name) store.addStore(name)
  newStore.value = ''
  addingStore.value = false
}

function cancelAddStore() {
  newStore.value = ''
  addingStore.value = false
}

// --- Celebration: a confetti burst the moment everything is gathered ---
interface Confetto {
  id: number
  style: Record<string, string>
}
const confetti = ref<Confetto[]>([])
const palette = ['var(--color-terracotta-400)', 'var(--color-terracotta-500)', 'var(--color-olive-400)', 'var(--color-olive-500)', 'var(--color-terracotta-200)']

function celebrate() {
  confetti.value = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    style: {
      'left': `${10 + Math.random() * 80}%`,
      'background': palette[i % palette.length] as string,
      'borderRadius': Math.random() > 0.5 ? '9999px' : '2px',
      'animationDelay': `${Math.random() * 120}ms`,
      '--cf-x': `${(Math.random() - 0.5) * 120}px`,
      '--cf-y': `${-90 - Math.random() * 90}px`,
      '--cf-r': `${(Math.random() - 0.5) * 720}deg`
    }
  }))
  // Clear after the animation so the DOM stays tidy.
  window.setTimeout(() => {
    confetti.value = []
  }, 1300)
}

// Only celebrate on the transition into "all done", not on initial hydrate.
watch(allDone, (done, was) => {
  if (done && was === false) celebrate()
})
</script>

<template>
  <UContainer class="max-w-2xl space-y-7 py-10">
    <!-- Masthead -->
    <header class="space-y-4">
      <div class="flex items-end justify-between gap-4">
        <div class="space-y-1">
          <p class="font-display text-sm italic text-primary">
            this week's
          </p>
          <h1 class="font-display text-4xl font-semibold leading-none tracking-tight text-highlighted">
            Pantry List
          </h1>
        </div>
        <UButton
          v-if="hydrated && boughtCount > 0"
          color="neutral"
          variant="ghost"
          icon="i-lucide-sparkles"
          label="Clear bought"
          size="sm"
          @click="store.clearDone"
        />
      </div>

      <!-- Stats + progress, with a celebration message when complete. -->
      <div class="relative space-y-2">
        <div class="flex items-baseline justify-between text-sm">
          <p
            v-if="!hydrated"
            class="h-5 w-40 rounded pantry-shimmer"
          />
          <template v-else-if="totalCount > 0">
            <p
              v-if="allDone"
              class="pantry-cheer flex items-center gap-1.5 font-medium text-primary"
            >
              <UIcon
                name="i-lucide-party-popper"
                class="size-4"
              />
              Pantry stocked, every item gathered!
            </p>
            <p
              v-else
              class="text-toned"
            >
              <span class="font-semibold text-highlighted">{{ boughtCount }}</span>
              of {{ totalCount }} gathered
              <span class="text-dimmed">·</span>
              {{ groupedItems.length }} {{ groupedItems.length === 1 ? 'store' : 'stores' }}
            </p>
            <span class="font-display text-sm font-semibold tabular-nums text-muted">{{ progress }}%</span>
          </template>
          <p
            v-else
            class="text-muted"
          >
            A fresh, empty list, let's fill it.
          </p>
        </div>

        <!-- Hand-built progress rail for full control of the paper look. -->
        <div
          v-if="hydrated && totalCount > 0"
          class="h-2 overflow-hidden rounded-full bg-elevated"
        >
          <div
            class="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            :class="allDone ? 'bg-secondary-500' : ''"
            :style="{ width: `${progress}%` }"
          />
        </div>

        <!-- Confetti burst, anchored to the header. -->
        <div
          v-if="confetti.length"
          class="pointer-events-none absolute inset-x-0 -top-6 h-0"
          aria-hidden="true"
        >
          <span
            v-for="c in confetti"
            :key="c.id"
            class="pantry-confetti-piece absolute top-0 size-2"
            :style="c.style"
          />
        </div>
      </div>
    </header>

    <!-- Add form -->
    <!-- Plain wrapper (NOT UCard) so the search dropdown isn't clipped. `relative
         z-30` lifts this whole stacking context above the store cards below
         (which establish their own contexts via backdrop-blur), so the search
         dropdown always paints over them. -->
    <div class="relative z-30 rounded-xl border border-default bg-default/70 p-4 shadow-sm backdrop-blur-sm">
      <AddItemForm
        :stores="stores"
        @add="store.addItem"
      />
    </div>

    <!-- Add a store on its own, creates an empty, droppable store group. -->
    <div class="flex items-center gap-2">
      <UButton
        v-if="!addingStore"
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-store"
        label="Add a store"
        @click="startAddStore"
      />
      <form
        v-else
        class="flex w-full items-center gap-2"
        @submit.prevent="submitStore"
      >
        <UInput
          ref="storeInput"
          v-model="newStore"
          placeholder="New store name…"
          icon="i-lucide-store"
          size="sm"
          class="flex-1"
          @keydown.esc="cancelAddStore"
          @blur="submitStore"
        />
        <UButton
          type="submit"
          size="sm"
          icon="i-lucide-check"
          aria-label="Create store"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          aria-label="Cancel"
          @mousedown.prevent="cancelAddStore"
        />
      </form>
    </div>

    <!-- Hydration skeleton (bridges the load gap) -->
    <div
      v-if="!hydrated"
      class="space-y-4"
    >
      <div
        v-for="n in 2"
        :key="n"
        class="space-y-3 rounded-xl border border-default bg-default/60 p-4"
      >
        <div class="h-4 w-32 rounded pantry-shimmer" />
        <div class="h-8 w-full rounded-lg pantry-shimmer" />
        <div class="h-8 w-full rounded-lg pantry-shimmer" />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="groupedItems.length === 0"
      class="pantry-rise flex flex-col items-center gap-3 py-12 text-center"
    >
      <div class="grid size-16 place-items-center rounded-full bg-elevated text-primary">
        <UIcon
          name="i-lucide-shopping-basket"
          class="size-8"
        />
      </div>
      <p class="font-display text-lg text-highlighted">
        Your pantry's looking bare
      </p>
      <p class="max-w-xs text-sm text-muted">
        Search for something tasty above to start your list, we'll sort it by store for you.
      </p>
    </div>

    <!-- The list: one card per store, each a drop zone -->
    <div
      v-else
      class="space-y-4"
      @dragend="dragOverStore = null"
    >
      <section
        v-for="(group, gi) in groupedItems"
        :key="group.store"
        class="pantry-rise overflow-hidden rounded-xl border bg-default/70 shadow-sm backdrop-blur-sm transition-all duration-200"
        :class="dragOverStore === group.store
          ? 'border-primary ring-2 ring-primary/40 scale-[1.01]'
          : 'border-default'"
        :style="{ animationDelay: `${gi * 70}ms` }"
        @dragover.prevent="dragOverStore = group.store"
        @drop.prevent="onDrop(group.store, $event)"
      >
        <!-- Editorial section header -->
        <div class="flex items-center gap-2.5 border-b border-default/70 px-4 py-3">
          <div class="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <UIcon
              :name="group.store === 'Unassigned' ? 'i-lucide-circle-help' : 'i-lucide-store'"
              class="size-4"
            />
          </div>
          <h2 class="flex-1 truncate font-display text-base font-semibold tracking-tight text-highlighted">
            {{ group.store }}
          </h2>
          <span class="rounded-full bg-elevated px-2 py-0.5 text-xs font-semibold tabular-nums text-muted">
            {{ group.items.length }}
          </span>
          <!-- Remove only empty, user-made stores, never destroys items. -->
          <UButton
            v-if="group.store !== 'Unassigned' && group.items.length === 0"
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Remove store"
            @click="store.removeStore(group.store)"
          />
        </div>

        <ul
          v-if="group.items.length > 0"
          class="space-y-0.5 p-2"
        >
          <ShoppingListItem
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            @toggle="store.toggleDone"
            @remove="store.removeItem"
            @set-quantity="store.setQuantity"
          />
        </ul>
        <!-- Empty store: a hint that doubles as a clear drop target. -->
        <p
          v-else
          class="flex items-center justify-center gap-1.5 px-4 py-5 text-center text-xs text-dimmed"
        >
          <UIcon
            name="i-lucide-move-down"
            class="size-3.5"
          />
          Drag items here, or add one with this store selected
        </p>
      </section>
    </div>
  </UContainer>
</template>
