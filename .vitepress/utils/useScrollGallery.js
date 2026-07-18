// utils/useScrollGallery.js
import { ref } from 'vue'

export function useScrollGallery(options = {}) {
  const {
    items = ref([]),
    initialIndex = 0,
  } = options

  // ============================================================
  //  СОСТОЯНИЕ
  // ============================================================
  const currentIndex = ref(initialIndex)
  const isSwiping = ref(false)
  const touchStartX = ref(0)
  const touchStartY = ref(0)
  const touchEndX = ref(0)
  const touchEndY = ref(0)
  const isAnimating = ref(false)

  // ============================================================
  //  МЕТОДЫ
  // ============================================================

  const goTo = (index) => {
    if (isAnimating.value) return
    if (index < 0 || index >= items.value.length) return
    
    isAnimating.value = true
    currentIndex.value = index
    
    setTimeout(() => {
      isAnimating.value = false
    }, 300)
  }

  const next = () => {
    if (isAnimating.value) return
    const maxIndex = items.value.length - 1
    if (currentIndex.value < maxIndex) {
      goTo(currentIndex.value + 1)
    }
  }

  const prev = () => {
    if (isAnimating.value) return
    if (currentIndex.value > 0) {
      goTo(currentIndex.value - 1)
    }
  }

  const reset = () => {
    goTo(0)
  }

  // ============================================================
  //  ОБРАБОТЧИКИ СВАЙПА
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

    // Если вертикальное движение больше — даём скроллить
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

    if (diffX > minSwipeDistance && !isAnimating.value) {
      next()
    } else if (diffX < -minSwipeDistance && !isAnimating.value) {
      prev()
    }

    touchStartX.value = 0
    touchStartY.value = 0
    touchEndX.value = 0
    touchEndY.value = 0
  }

  // ============================================================
  //  КЛАВИАТУРА
  // ============================================================

  const handleKeydown = (e) => {
    switch (e.key) {
      case 'Escape':
        // Закрытие обрабатывается в компоненте
        break
      case 'ArrowRight':
        e.preventDefault()
        next()
        break
      case 'ArrowLeft':
        e.preventDefault()
        prev()
        break
    }
  }

  // ============================================================
  //  ВОЗВРАТ
  // ============================================================
  return {
    // Состояние
    currentIndex,
    isSwiping,
    isAnimating,

    // Методы
    goTo,
    next,
    prev,
    reset,

    // События
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleKeydown,
  }
}