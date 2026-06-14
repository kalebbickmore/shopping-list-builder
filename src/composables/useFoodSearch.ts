import { ref, watch } from 'vue'
import { searchFoods, type FoodSuggestion } from '@/services/foodApi'

// A "composable" = a function that bundles reactive state + logic so multiple
// components can reuse it. By convention it's named use*() and returns refs.
// This one turns a text `query` into live `results` from the food API, while
// handling debouncing, loading/error states, and cancelling stale requests.
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

    // DEBOUNCE: wait 300ms after the user stops typing before calling the API,
    // so we don't fire a request on every single keystroke.
    debounceTimer = setTimeout(async () => {
      const myController = new AbortController()
      controller = myController
      try {
        const found = await searchFoods(term, myController.signal)
        // STALE GUARD: if a newer request started while we awaited, ignore us.
        if (controller !== myController) return
        results.value = found
      } catch {
        if (myController.signal.aborted) return // expected when superseded — ignore
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
