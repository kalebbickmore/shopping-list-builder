import { ref, watch } from 'vue'
import type { FoodSuggestion } from '~/types'

// A composable: reusable reactive logic. In Nuxt, files in app/composables are
// AUTO-IMPORTED, so any component can call useFoodSearch() with no import.
//
// Note: we now hit OUR OWN server route ('/api/foods'), not OpenFoodFacts. The
// server does the third-party call (where a secret key would live). We use
// `$fetch` (Nuxt's auto-imported HTTP client) rather than useFetch/useAsyncData
// because this is an imperative, debounced, user-triggered search — not
// component-setup data that needs SSR.
export function useFoodSearch() {
  const query = ref('')
  const results = ref<FoodSuggestion[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let controller: AbortController | undefined

  watch(query, (q) => {
    // A new keystroke invalidates any pending timer and any in-flight request.
    clearTimeout(debounceTimer)
    controller?.abort()

    const term = q.trim()
    if (term.length < 2) {
      results.value = []
      loading.value = false
      error.value = null
      return
    }

    loading.value = true
    error.value = null

    // DEBOUNCE: wait 300ms after typing stops before calling the API.
    debounceTimer = setTimeout(async () => {
      const myController = new AbortController()
      controller = myController
      try {
        const found = await $fetch<FoodSuggestion[]>('/api/foods', {
          query: { q: term },
          signal: myController.signal
        })
        // STALE GUARD: ignore if a newer request superseded us mid-flight.
        if (controller !== myController) return
        results.value = found
      } catch {
        if (myController.signal.aborted) return // expected when superseded
        error.value = 'Could not reach the food database.'
        results.value = []
      } finally {
        if (controller === myController) loading.value = false
      }
    }, 300)
  })

  function clear() {
    query.value = ''
    results.value = []
    error.value = null
  }

  return { query, results, loading, error, clear }
}
