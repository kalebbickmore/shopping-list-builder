<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Item } from '~/types'

const props = defineProps<{
  item: Item
}>()

const emit = defineEmits<{
  'toggle': [id: string]
  'remove': [id: string]
  'set-quantity': [id: string, quantity: number]
  'set-name': [id: string, name: string]
}>()

const dragging = ref(false)

// --- inline name editing ---
const editing = ref(false)
const draft = ref('')
const nameInput = ref<{ inputRef?: HTMLInputElement } | null>(null)

async function startEdit() {
  draft.value = props.item.name
  editing.value = true
  await nextTick()
  nameInput.value?.inputRef?.focus()
  nameInput.value?.inputRef?.select()
}

function submitName() {
  if (!editing.value) return
  editing.value = false
  emit('set-name', props.item.id, draft.value)
}

function cancelName() {
  editing.value = false
}

// --- check-off delight ---
// Fire the pop only when an item is being marked DONE (not when un-checking).
const justChecked = ref(false)
function onToggle() {
  if (!props.item.done) justChecked.value = true
  emit('toggle', props.item.id)
}

// --- quantity bump ---
// A quick bounce on the number whenever the quantity changes.
const bump = ref(false)
watch(
  () => props.item.quantity,
  () => { bump.value = true }
)

function onDragStart(e: DragEvent) {
  dragging.value = true
  // Hand the item's id to the drop target via the drag payload.
  e.dataTransfer?.setData('text/plain', props.item.id)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() {
  dragging.value = false
}
</script>

<template>
  <li
    :draggable="!editing"
    :class="[
      'group/item relative flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-all duration-200',
      'hover:bg-elevated/60',
      dragging ? 'rotate-1 scale-[0.98] opacity-50 shadow-lg' : ''
    ]"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="flex min-w-0 items-center gap-2.5">
      <UIcon
        name="i-lucide-grip-vertical"
        class="hover-reveal hidden size-4 shrink-0 cursor-grab text-dimmed sm:block"
      />

      <!-- Custom check button: a clay circle that fills and pops when bought. -->
      <button
        type="button"
        :aria-pressed="item.done"
        :aria-label="item.done ? 'Mark as not bought' : 'Mark as bought'"
        :class="[
          'relative grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200',
          item.done
            ? 'border-secondary-500 bg-secondary-500 text-white'
            : 'border-accented bg-default hover:border-primary'
        ]"
        @click="onToggle"
      >
        <UIcon
          name="i-lucide-check"
          :class="[
            'size-3 transition-all duration-200',
            item.done ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
            justChecked ? 'pantry-pop' : ''
          ]"
          @animationend="justChecked = false"
        />
      </button>

      <!-- Name: click to edit inline. A strike line draws across when bought. -->
      <UInput
        v-if="editing"
        ref="nameInput"
        v-model="draft"
        size="xs"
        class="min-w-0 flex-1"
        @blur="submitName"
        @keydown.enter="submitName"
        @keydown.esc="cancelName"
      />
      <button
        v-else
        type="button"
        class="relative block min-w-0 max-w-full text-left"
        :aria-label="`Edit ${item.name}`"
        @click="startEdit"
      >
        <span :class="['block truncate text-sm transition-colors duration-300 hover:text-primary', item.done ? 'text-dimmed' : 'text-highlighted']">
          {{ item.name }}
        </span>
        <span
          aria-hidden="true"
          :class="[
            'pointer-events-none absolute inset-x-0 top-1/2 h-px origin-left bg-secondary-500/70 transition-transform duration-300 ease-out',
            item.done ? 'scale-x-100' : 'scale-x-0'
          ]"
        />
      </button>
    </div>

    <div class="flex items-center gap-1">
      <!-- Springy quantity stepper. Understated until you hover the row. -->
      <div
        :class="[
          'flex items-center rounded-full border border-default bg-default/70 transition-all duration-200',
          item.done ? 'opacity-50' : 'opacity-100'
        ]"
      >
        <button
          type="button"
          :disabled="item.quantity <= 1"
          aria-label="Decrease quantity"
          class="grid size-7 place-items-center rounded-full text-muted transition-all hover:text-primary active:scale-90 disabled:opacity-30 disabled:hover:text-muted"
          @click="emit('set-quantity', item.id, item.quantity - 1)"
        >
          <UIcon
            name="i-lucide-minus"
            class="size-3.5"
          />
        </button>
        <span
          :key="item.quantity"
          :class="['min-w-5 select-none text-center text-xs font-semibold tabular-nums text-highlighted', bump ? 'pantry-bump' : '']"
          @animationend="bump = false"
        >
          {{ item.quantity }}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          class="grid size-7 place-items-center rounded-full text-muted transition-all hover:text-primary active:scale-90"
          @click="emit('set-quantity', item.id, item.quantity + 1)"
        >
          <UIcon
            name="i-lucide-plus"
            class="size-3.5"
          />
        </button>
      </div>

      <button
        type="button"
        aria-label="Remove item"
        class="hover-reveal grid size-7 place-items-center rounded-full text-dimmed transition-colors hover:bg-error/10 hover:text-error active:scale-90"
        @click="emit('remove', item.id)"
      >
        <UIcon
          name="i-lucide-x"
          class="size-4"
        />
      </button>
    </div>
  </li>
</template>
