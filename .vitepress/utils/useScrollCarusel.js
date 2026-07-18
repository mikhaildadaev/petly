import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const MOBILE_BREAKPOINT = 735

export function useScrollCarusel(options = {}) {
  const {
    items = ref([]),
    containerRef = ref(null),
    hasMoreItems = ref(false),
  } = options

  // ============================================================
  //  СОСТОЯНИЕ
  // ============================================================
  const isMobile = ref(false)
  const currentIndex = ref(0)
  const savedIndex = ref(0)
  const isSwiping = ref(false)
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchEndX = ref(0)
  const touchEndY = ref(0)

  let resizeTimeout = null
  let scrollTimeout = null
  let isAnimating = false

  // ============================================================
  //  МЕТОДЫ
  // ============================================================

  const checkMobile = () => {
    if (typeof window !== 'undefined') {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
      if (isMobile.value !== newIsMobile) {
        isMobile.value = newIsMobile
      }
    }
  }

  /**
   * Обновление классов .center
   */
  const updateCenterClass = (index) => {
    if (!containerRef.value) return
    const slides = containerRef.value.querySelectorAll('.carousel-slide')
    slides.forEach((s, i) => {
      s.classList.toggle('center', i === index)
    })
  }

  /**
   * Прокрутка к слайду
   */
  const scrollToSlide = (index) => {
    if (!containerRef.value || isAnimating) return
    const container = containerRef.value
    const slides = container.querySelectorAll('.carousel-slide')
    if (!slides.length || index < 0 || index >= slides.length) return

    isAnimating = true

    // Обновляем классы
    updateCenterClass(index)
    currentIndex.value = index

    // Рассчитываем позицию
    const slide = slides[index]
    const containerWidth = container.offsetWidth
    const slideWidth = slide.offsetWidth
    const paddingLeft = parseInt(getComputedStyle(container).paddingLeft) || 0
    const slideLeft = slide.offsetLeft - paddingLeft
    const scrollPosition = slideLeft - (containerWidth - slideWidth) / 2

    // Прокручиваем
    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    })

    // Снимаем флаг после анимации
    setTimeout(() => {
      isAnimating = false
    }, 400)
  }
  const nextSlide = () => {
    const maxIndex = items.value.length + (hasMoreItems.value ? 1 : 0)
    if (currentIndex.value < maxIndex - 1 && !isAnimating) {
      scrollToSlide(currentIndex.value + 1)
    }
  }
  const prevSlide = () => {
    if (currentIndex.value > 0 && !isAnimating) {
      scrollToSlide(currentIndex.value - 1)
    }
  }
  const goToSlide = (index) => {
    if (!isAnimating) {
      scrollToSlide(index)
    }
  }
  const resetToFirstSlide = () => {
    currentIndex.value = 0
    savedIndex.value = 0
    nextTick(() => {
      if (containerRef.value) {
        const slides = containerRef.value.querySelectorAll('.carousel-slide')
        if (slides && slides.length > 0) {
          scrollToSlide(0)
        }
      }
    })
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
  }
  const handleTouchEnd = (e) => {
    if (!isSwiping.value) return
    isSwiping.value = false
    const touch = e.changedTouches[0]
    touchEndX.value = touch.clientX
    touchEndY.value = touch.clientY
    const diffX = touchStartX.value - touchEndX.value
    const minSwipeDistance = 30
    if (diffX > minSwipeDistance && !isAnimating) {
      nextSlide()
    } else if (diffX < -minSwipeDistance && !isAnimating) {
      prevSlide()
    } else {
      scrollToSlide(currentIndex.value)
    }

    touchStartX.value = 0
    touchStartY.value = 0
    touchEndX.value = 0
    touchEndY.value = 0
  }
  const handleScroll = () => {
    if (isAnimating) return

    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    scrollTimeout = setTimeout(() => {
      if (containerRef.value) {
        const slides = containerRef.value.querySelectorAll('.carousel-slide')
        let hasCenter = false
        slides.forEach((s) => {
          if (s.classList.contains('center')) hasCenter = true
        })
        if (!hasCenter) {
          updateCenterClass(currentIndex.value)
        }
      }
      scrollTimeout = null
    }, 100)
  }
  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      checkMobile()
      if (containerRef.value && items.value.length > 0) {
        const slides = containerRef.value.querySelectorAll('.carousel-slide')
        if (slides.length > 0) {
          const index = Math.min(currentIndex.value, slides.length - 1)
          // Обновляем позицию без анимации
          const container = containerRef.value
          const slide = slides[index]
          const containerWidth = container.offsetWidth
          const slideWidth = slide.offsetWidth
          const paddingLeft = parseInt(getComputedStyle(container).paddingLeft) || 0
          const slideLeft = slide.offsetLeft - paddingLeft
          const scrollPosition = slideLeft - (containerWidth - slideWidth) / 2
          container.scrollLeft = Math.max(0, scrollPosition)
          updateCenterClass(index)
        }
      }
      resizeTimeout = null
    }, 200)
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
    })
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
        resizeTimeout = null
      }
    }
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
      scrollTimeout = null
    }
  })

  // ============================================================
  //  ВОЗВРАТ
  // ============================================================
  return {
    isMobile,
    currentIndex,
    savedIndex,
    touchStartX,
    touchStartY,
    touchEndX,
    touchEndY,
    isSwiping,

    scrollToSlide,
    nextSlide,
    prevSlide,
    goToSlide,
    resetToFirstSlide,
    updateCenterClass,

    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleResize,
    checkMobile,
  }
}