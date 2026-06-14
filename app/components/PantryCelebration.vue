<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useShoppingListStore } from '~/stores/shoppingList'

const store = useShoppingListStore()
const { allDone } = storeToRefs(store)

interface Piece {
  id: number
  style: Record<string, string>
}

const active = ref(false)
const pieces = ref<Piece[]>([])

// Clay, olive and a warm amber, in a few tints for a lively spread.
const palette = [
  'var(--color-terracotta-300)',
  'var(--color-terracotta-400)',
  'var(--color-terracotta-500)',
  'var(--color-olive-300)',
  'var(--color-olive-400)',
  'var(--color-olive-500)',
  '#E8B04B',
  '#F5E6CC'
]

const shapes = ['9999px', '2px', '0px']

function prefersReducedMotion() {
  return import.meta.client
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function fire() {
  const reduce = prefersReducedMotion()

  pieces.value = reduce
    ? []
    : Array.from({ length: 150 }, (_, i) => {
        const size = 6 + Math.random() * 8
        return {
          id: i,
          style: {
            'left': `${Math.random() * 100}%`,
            'width': `${size}px`,
            'height': `${size * (Math.random() > 0.5 ? 1 : 0.5)}px`,
            'background': palette[i % palette.length] as string,
            'borderRadius': shapes[i % shapes.length] as string,
            '--cf-drift': `${(Math.random() - 0.5) * 40}vw`,
            '--cf-spin': `${(Math.random() - 0.5) * 1440}deg`,
            '--cf-dur': `${2.4 + Math.random() * 1.6}s`,
            '--cf-delay': `${Math.random() * 0.8}s`
          }
        }
      })

  active.value = true
  window.setTimeout(() => {
    active.value = false
    pieces.value = []
  }, reduce ? 1800 : 3400)
}

// Fire only on the transition into "all done", never on initial hydrate.
watch(allDone, (done, was) => {
  if (done && was === false) fire()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="celebrate">
      <div
        v-if="active"
        class="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
        aria-hidden="true"
      >
        <!-- Expanding warm glow behind the medallion -->
        <div class="absolute inset-0 grid place-items-center">
          <div
            class="celebrate-glow size-[42rem] max-w-[140vw] rounded-full"
            style="background: radial-gradient(circle, color-mix(in oklab, var(--color-terracotta-400) 55%, transparent), transparent 65%);"
          />
        </div>

        <!-- The confetti shower -->
        <span
          v-for="p in pieces"
          :key="p.id"
          class="celebrate-fall absolute top-0 block"
          :style="p.style"
        />

        <!-- Center medallion -->
        <div class="absolute inset-0 grid place-items-center px-6">
          <div class="celebrate-pop flex flex-col items-center gap-3 rounded-3xl border border-default bg-default/85 px-10 py-8 text-center shadow-2xl backdrop-blur-md">
            <div class="grid size-16 place-items-center rounded-full bg-primary/15 text-primary">
              <UIcon
                name="i-lucide-party-popper"
                class="size-9"
              />
            </div>
            <p class="font-display text-3xl font-semibold tracking-tight text-highlighted">
              Pantry stocked!
            </p>
            <p class="flex items-center gap-1.5 text-sm font-medium text-secondary-600">
              <UIcon
                name="i-lucide-check-check"
                class="size-4"
              />
              Every item gathered
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Soft fade for the whole overlay on enter/leave (the pieces have their own
   keyframes). */
.celebrate-enter-active,
.celebrate-leave-active {
  transition: opacity 0.4s ease;
}

.celebrate-enter-from,
.celebrate-leave-to {
  opacity: 0;
}
</style>
