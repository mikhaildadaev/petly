import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const MOBILE_BREAKPOINT = 735

export function useScrollCarusel(options = {}) {
  const {
    items = ref([]),
    containerRef = ref(null),
    hasMoreItems = ref(false),
    loadFn = null,
  } = options

  // ============================================================
  //  СОСТОЯНИЕ
  // ============================================================
  const isMobile = ref(false)
  const currentIndex = ref(0)
  const isSwiping = ref(false)
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const isLoadingMore = ref(false)

  let resizeTimeout = null
  let isAnimating = false
  let rafId = null
  let isResetting = false
  const minSwipeDistance = 30

  // ============================================================
  //  ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ============================================================

  const checkMobile = () => {
    if (typeof window !== 'undefined') {
      isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    }
  }
  const updateCenterClass = (index) => {
    if (!containerRef.value) return
    const slides = containerRef.value.querySelectorAll('.carousel-slide')
    slides.forEach((s, i) => {
      s.classList.toggle('center', i === index)
    })
  }
  const getClosestSlide = () => {
    if (!containerRef.value) return 0
    const container = containerRef.value
    const slides = container.querySelectorAll('.carousel-slide')
    if (slides.length === 0) return 0
    const containerCenter = container.scrollLeft + container.offsetWidth / 2
    let closestIndex = 0
    let closestDistance = Infinity
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const slideCenter = rect.left + rect.width / 2 - containerRect.left
      const distance = Math.abs(slideCenter - container.offsetWidth / 2)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    return closestIndex
  }
  const syncIndex = () => {
    if (isResetting || isAnimating) return
    const closest = getClosestSlide()
    if (closest !== currentIndex.value) {
      currentIndex.value = closest
      updateCenterClass(closest)
    }
  }

  // ============================================================
  //  ОСНОВНЫЕ МЕТОДЫ
  // ============================================================

  const scrollToSlide = (index) => {
    if (!containerRef.value) return
    const container = containerRef.value
    const slides = container.querySelectorAll('.carousel-slide')
    if (slides.length === 0 || index < 0 || index >= slides.length) return
    if (isAnimating) {
      container.scrollTo({ left: container.scrollLeft, behavior: 'auto' })
      isAnimating = false
    }
    isAnimating = true
    currentIndex.value = index
    updateCenterClass(index)
    const slide = slides[index]
    const containerWidth = container.offsetWidth
    const slideWidth = slide.offsetWidth
    const slideLeft = slide.offsetLeft
    const scrollPosition = slideLeft - (containerWidth - slideWidth) / 2
    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    })
    clearTimeout(container._scrollTimer)
    container._scrollTimer = setTimeout(() => {
      isAnimating = false
      syncIndex()
    }, 400)
  }
  const nextSlide = () => {
    const maxIndex = items.value.length + (hasMoreItems.value ? 1 : 0)
    if (currentIndex.value < maxIndex - 1) {
      scrollToSlide(currentIndex.value + 1)
    }
  }
  const prevSlide = () => {
    if (currentIndex.value > 0) {
      scrollToSlide(currentIndex.value - 1)
    }
  }
  const goToSlide = (index) => {
    scrollToSlide(index)
  }

  // ============================================================
  //  СБРОС (правильный, без циклов)
  // ============================================================

  const resetToFirstSlide = () => {
    scrollToSlide(0)
  }

  // ============================================================
  //  LOAD MORE
  // ============================================================

  const loadMore = async () => {
    if (isLoadingMore.value || !loadFn) return
    isLoadingMore.value = true
    const beforeIndex = currentIndex.value
    const beforeLength = items.value.length
    const wasOnMore = beforeIndex === beforeLength
    await loadFn()
    await nextTick()
    isLoadingMore.value = false
    if (items.value.length === 0) return
    if (wasOnMore) {
      const targetIndex = beforeLength
      isResetting = true
      currentIndex.value = targetIndex
      scrollToSlide(targetIndex)
      setTimeout(() => {
        isResetting = false
      }, 100)
    } else {
      const safeIndex = Math.min(beforeIndex, items.value.length - 1)
      if (safeIndex !== currentIndex.value) {
        scrollToSlide(safeIndex)
      }
    }
  }

  // ============================================================
  //  ОБРАБОТЧИКИ СОБЫТИЙ
  // ============================================================

  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    touchStartX.value = touch.clientX
    touchStartY.value = touch.clientY
    isSwiping.value = true
  }
  const handleTouchMove = (e) => {
    if (!isSwiping.value) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX.value
    const deltaY = touch.clientY - touchStartY.value
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isSwiping.value = false
      return
    }
    e.preventDefault()
    if (!isResetting && !isAnimating) {
      const closest = getClosestSlide()
      if (closest !== currentIndex.value) {
        currentIndex.value = closest
        updateCenterClass(closest)
      }
    }
  }
  const handleTouchEnd = (e) => {
    if (!isSwiping.value) return
    isSwiping.value = false
    const touch = e.changedTouches[0]
    const diffX = touchStartX.value - touch.clientX
    if (Math.abs(diffX) > minSwipeDistance && !isResetting) {
      if (diffX > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
    } else if (!isResetting) {
      const closest = getClosestSlide()
      if (closest !== currentIndex.value) {
        scrollToSlide(closest)
      }
    }
    touchStartX.value = 0
    touchStartY.value = 0
  }
  const handleScroll = () => {
    if (isResetting || isAnimating) return
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    rafId = requestAnimationFrame(() => {
      if (!containerRef.value || isResetting || isAnimating) {
        rafId = null
        return
      }
      const closest = getClosestSlide()
      if (closest !== currentIndex.value) {
        currentIndex.value = closest
        updateCenterClass(closest)
      }
      rafId = null
    })
  }
  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      checkMobile()
      if (!isResetting) {
        syncIndex()
      }
      resizeTimeout = null
    }, 200)
  }
  const attachTouchEvents = () => {
    if (containerRef.value) {
      containerRef.value.addEventListener('touchstart', handleTouchStart, { passive: true })
      containerRef.value.addEventListener('touchmove', handleTouchMove, { passive: false })
      containerRef.value.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  }

  // ============================================================
  //  ЖИЗНЕННЫЙ ЦИКЛ
  // ============================================================

  onMounted(() => {
    checkMobile()
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
    nextTick(() => {
      if (containerRef.value) {
        containerRef.value.addEventListener('scroll', handleScroll, { passive: true })
      }
      attachTouchEvents()
      syncIndex()
    })
  })
  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
      clearTimeout(containerRef.value._scrollTimer)
    }
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
      resizeTimeout = null
    }
  })

  // ============================================================
  //  ВОЗВРАТ
  // ============================================================
  return {
    isMobile,
    currentIndex,
    isLoadingMore,
    scrollToSlide,
    nextSlide,
    prevSlide,
    goToSlide,
    resetToFirstSlide,
    loadMore,
    syncIndex,
    updateCenterClass,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleResize,
    checkMobile,
  }
}