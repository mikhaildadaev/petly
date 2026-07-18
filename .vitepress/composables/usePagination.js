import { ref, computed, watch } from 'vue'

export function usePagination(items, options = {}) {
  const {
    perPage = 8,
    onLoadMore = null,
  } = options
  const visibleCount = ref(perPage)
  const isLoadingMore = ref(false)
  const totalItems = ref([])
  watch(
    () => items.value,
    (newItems) => {
      totalItems.value = newItems || []
      visibleCount.value = perPage
    },
    { immediate: true, deep: true }
  )
  const paginatedItems = computed(() => {
    const result = totalItems.value.slice(0, visibleCount.value)
    return result
  })
  const remaining = computed(() => {
    return totalItems.value.length - visibleCount.value
  })
  const hasMoreItems = computed(() => {
    return totalItems.value.length > visibleCount.value
  })
  const loadMore = async (count = null) => {
    if (isLoadingMore.value || !hasMoreItems.value) {
      return
    }
    isLoadingMore.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    let addCount = perPage
    if (typeof count === 'number' && count > 0) {
      addCount = count
    }
    visibleCount.value += addCount
    isLoadingMore.value = false
    if (onLoadMore && typeof onLoadMore === 'function') {
      await onLoadMore()
    }
  }
  const resetPagination = () => {
    console.log('🔄 resetPagination вызван')
    visibleCount.value = perPage
    isLoadingMore.value = false
  }
  return {
    visibleCount,
    isLoadingMore,
    paginatedItems,
    remaining,
    hasMoreItems,
    loadMore,
    resetPagination,
  }
}