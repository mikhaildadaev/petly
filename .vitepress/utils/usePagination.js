import { ref, computed, watch } from 'vue'

export function usePagination(items, options = {}) {
  const {
    perPage = 8,
    onLoadNext = null,
  } = options
  const windowStart = ref(0)
  const windowSize = ref(perPage)
  const isLoadingNext = ref(false)
  const totalItems = ref([])
  watch(
    () => items.value,
    (newItems) => {
      totalItems.value = newItems || []
      windowStart.value = 0
      windowSize.value = perPage
    },
    { immediate: true, deep: true }
  )
  const paginatedItems = computed(() => {
    const start = windowStart.value
    const end = start + windowSize.value
    return totalItems.value.slice(start, end)
  })
  const prevCount = computed(() => windowStart.value)
  const hasPrevItems = computed(() => windowStart.value > 0)
  const remaining = computed(() => {
    return Math.max(
      0,
      totalItems.value.length - windowStart.value - windowSize.value
    )
  })
  const hasNextItems = computed(() => remaining.value > 0)
  const visibleCount = computed(() => windowSize.value)
  const loadNext = async (count = null) => {
    if (isLoadingNext.value || !hasNextItems.value) return
    isLoadingNext.value = true
    const step = typeof count === 'number' && count > 0 ? count : perPage
    windowStart.value += step
    isLoadingNext.value = false
    if (onLoadNext && typeof onLoadNext === 'function') {
      await onLoadNext()
    }
  }
  const loadPrev = async (count = null) => {
    if (isLoadingNext.value || !hasPrevItems.value) return
    isLoadingNext.value = true
    const step = typeof count === 'number' && count > 0 ? count : perPage
    windowStart.value = Math.max(0, windowStart.value - step)
    isLoadingNext.value = false
    if (onLoadNext && typeof onLoadNext === 'function') {
      await onLoadNext()
    }
  }
  const resetPagination = () => {
    windowStart.value = 0
    windowSize.value = perPage
    isLoadingNext.value = false
  }
  return {
    windowStart,
    windowSize,
    paginatedItems,
    prevCount,
    hasPrevItems,
    remaining,
    hasNextItems,
    visibleCount,
    loadNext,
    loadPrev,
    resetPagination,
    isLoadingNext,
  }
}