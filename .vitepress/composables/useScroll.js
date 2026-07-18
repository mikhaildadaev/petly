import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const MOBILE_BREAKPOINT = 735

export function useScroll(options = {}) {
  const {
    items = ref([]),           // список элементов
    perPage = 8,               // элементов на страницу
    containerRef = ref(null),  // ссылка на контейнер карусели
    hasMoreItems = ref(false), // флаг наличия дополнительного элемента
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
  let scrollTimeout = null  // ← добавить для Safari

  // ============================================================
  //  МЕТОДЫ
  // ============================================================

  /**
   * Проверка мобильного устройства
   */
  const checkMobile = () => {
    if (typeof window !== 'undefined') {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
      if (isMobile.value !== newIsMobile) {
        isMobile.value = newIsMobile
      }
    }
  }

  /**
   * Прокрутка к слайду
   */
  const scrollToSlide = (index) => {
    if (!containerRef.value) return
    const container = containerRef.value
    const slides = container.querySelectorAll('.carousel-slide')
    if (!slides.length || index < 0 || index >= slides.length) return

    const slide = slides[index]
    const containerWidth = container.offsetWidth
    const slideWidth = slide.offsetWidth
    const scrollPosition = slide.offsetLeft - (containerWidth - slideWidth) / 2

    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    })

    currentIndex.value = index
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

  /**
   * Сброс на первый слайд
   */
  const resetToFirstSlide = () => {
    currentIndex.value = 0
    savedIndex.value = 0
    
    if (containerRef.value) {
      const container = containerRef.value
      container.scrollLeft = 0
      
      nextTick(() => {
        container.scrollLeft = 0
        const slides = container.querySelectorAll('.carousel-slide')
        if (slides && slides.length > 0) {
          const firstSlide = slides[0]
          const containerWidth = container.offsetWidth
          const slideWidth = firstSlide.offsetWidth
          const scrollPosition = firstSlide.offsetLeft - (containerWidth - slideWidth) / 2
          container.scrollTo({
            left: Math.max(0, scrollPosition),
            behavior: 'smooth'
          })
        }
      })
    }
  }

  /**
   * Найти ближайший слайд (для Safari)
   */
  const findClosestSlide = () => {
    if (!containerRef.value) return
    
    const container = containerRef.value
    const slides = container.querySelectorAll('.carousel-slide')
    if (!slides.length) return

    const containerWidth = container.offsetWidth
    const scrollLeft = container.scrollLeft
    
    let closestIndex = 0
    let closestDistance = Infinity
    
    slides.forEach((slide, index) => {
      const slideLeft = slide.offsetLeft
      const centerOffset = (containerWidth - slide.offsetWidth) / 2
      const distance = Math.abs(slideLeft - scrollLeft - centerOffset)
      
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    
    return closestIndex
  }

  /**
   * Принудительный снап после скролла (для Safari)
   */
  const snapAfterScroll = () => {
    if (!containerRef.value) return
    
    const container = containerRef.value
    // Проверяем, что скролл остановился
    if (container.scrollLeft === container.scrollLeft) { // простая проверка
      const closestIndex = findClosestSlide()
      if (closestIndex !== undefined && closestIndex !== currentIndex.value) {
        scrollToSlide(closestIndex)
      }
    }
  }

  /**
   * Обработчики свайпа
   */
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

    if (diffX > minSwipeDistance) {
      nextSlide()
    } else if (diffX < -minSwipeDistance) {
      prevSlide()
    } else {
      scrollToSlide(currentIndex.value)
    }
    
    touchStartX.value = 0
    touchStartY.value = 0
    touchEndX.value = 0
    touchEndY.value = 0
  }

  /**
   * Обработчик скролла (для Safari)
   */
  const handleScroll = () => {
    if (!containerRef.value) return
    
    // Очищаем предыдущий таймаут
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    
    // Ждём остановки скролла
    scrollTimeout = setTimeout(() => {
      snapAfterScroll()
      scrollTimeout = null
    }, 150)
  }

  /**
   * Обработчик изменения размера
   */
  const handleResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    resizeTimeout = setTimeout(() => {
      checkMobile()
      resizeTimeout = null
    }, 100)
  }

  /**
   * Добавление/удаление слушателей
   */
  const addScrollListener = () => {
    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll)
      // Для Safari с поддержкой scrollend
      if ('onscrollend' in window) {
        containerRef.value.addEventListener('scrollend', snapAfterScroll)
      }
    }
  }

  const removeScrollListener = () => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
      if ('onscrollend' in window) {
        containerRef.value.removeEventListener('scrollend', snapAfterScroll)
      }
    }
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
      scrollTimeout = null
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
    // Добавляем слушатели после монтирования
    nextTick(() => {
      addScrollListener()
    })
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
    removeScrollListener()
  })

  // ============================================================
  //  ВОЗВРАТ
  // ============================================================
  return {
    // Состояние
    isMobile,
    currentIndex,
    savedIndex,
    touchStartX,
    touchStartY,
    touchEndX,
    touchEndY,
    isSwiping,
    
    // Методы
    checkMobile,
    scrollToSlide,
    nextSlide,
    prevSlide,
    goToSlide,
    resetToFirstSlide,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleResize,
    // ← добавить для отладки
    addScrollListener,
    removeScrollListener,
  }
}