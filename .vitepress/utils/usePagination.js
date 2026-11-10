import { ref, computed } from 'vue'

export function usePagination(items, options = {}) {
  const {
    perPage = 8,
    onLoadNext = null,
  } = options
  const windowStart = ref(0)
  const windowSize = ref(perPage)
  const isLoadingNext = ref(false)
  const paginatedItems = computed(() => {
    const start = windowStart.value
    const end = start + windowSize.value
    return items.value.slice(start, end)
  })
  const prevCount = computed(() => windowStart.value)
  const hasPrevItems = computed(() => windowStart.value > 0)
  const remaining = computed(() => {
    return Math.max(0, items.value.length - windowStart.value - windowSize.value)
  })
  const hasNextItems = computed(() => remaining.value > 0)
  const visibleCount = computed(() => windowSize.value)
  const loadNext = async (count = null) => {
    if (isLoadingNext.value || !hasNextItems.value) return
    isLoadingNext.value = true
    try {
      const step = typeof count === 'number' && count > 0 ? count : perPage
      windowStart.value += step
      if (onLoadNext && typeof onLoadNext === 'function') {
        await onLoadNext()
      }
    } finally {
      isLoadingNext.value = false
    }
  }
  const loadPrev = async (count = null) => {
    if (isLoadingNext.value || !hasPrevItems.value) return
    isLoadingNext.value = true
    try {
      const step = typeof count === 'number' && count > 0 ? count : perPage
      windowStart.value = Math.max(0, windowStart.value - step)
      if (onLoadNext && typeof onLoadNext === 'function') {
        await onLoadNext()
      }
    } finally {
      isLoadingNext.value = false
    }
  }
  const resetPagination = () => {
    windowStart.value = 0
    windowSize.value = perPage
    isLoadingNext.value = false
  }
  const setWindowByID = (uuid, allItems) => {
    if (!uuid || !allItems || !allItems.length) return null
    const index = allItems.findIndex(item => item.uuid === uuid)
    if (index === -1) return null
    const page = Math.floor(index / perPage)
    windowStart.value = page * perPage
    windowSize.value = perPage
    return index - windowStart.value  
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
    setWindowByID,
  }
}