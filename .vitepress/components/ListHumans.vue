<template>
  <div class="filters-compact hide-scrollbar">
      <div class="filter-group">
        <div class="filter-chips">
          <button v-for="option in experienceOptions" :key="option.value" class="chip" :class="{ active: filterExperience[option.value] }" @click="toggleFilter('experience', option.value)" :title="option.label" v-html="option.icon"/>
        </div>
        <span class="filter-label">Опыт</span>
      </div>
      <div class="filter-group">
        <div class="filter-chips">
          <button v-for="option in directionOptions" :key="option.value" class="chip" :class="{ active: filterDirection[option.value] }" @click="toggleFilter('direction', option.value)" :title="option.label" v-html="option.icon"/>
        </div>
        <span class="filter-label">Направление</span>
      </div>
      <button v-if="isFilterActive" class="btn-reset-compact" @click="resetFilters" title="Сбросить все фильтры">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
        СБРОСИТЬ
      </button>
    </div>
  <div v-if="!isMobile" class="grid-cards">
    <a v-for="human in paginatedHumans" :key="human.uuid" :href="`${baseUrl}ru/${humanType}/${human.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
      <div class="grid-meta">
        <span v-if="human.direction" class="tag direction-tag">{{ human.direction }}</span>
        <span v-if="human.experience" class="tag experience-tag">{{ human.experience }}</span>
      </div>
      <img :src="human.image" :alt="human.name" loading="lazy" />
      <div :class="['grid-card-body', getRandomHumanClass(human.uuid)]">
        <div class="name">{{ human.name }}</div>
        <p>{{ human.description }}</p>
      </div>
    </a>
    <div v-if="hasMoreItems" class="load-more" @click="loadMore">
      <div class="load-more-content">
        <div class="load-more-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
        <span class="load-more-text">Загрузить ещё</span>
        <span class="load-more-count">{{ remaining }} осталось</span>
        <div class="load-more-progress">
          <div class="progress-bar" :style="{ width: `${(visibleCount / filteredHumans.length) * 100}%` }"></div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="carousel-cards">
    <div class="carousel-wrapper">
      <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>      
      <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <div v-for="(human, index) in paginatedHumans" :key="human.uuid" class="carousel-slide" :class="{ center: index === currentIndex }" >
          <a :href="`${baseUrl}ru/${humanType}/${human.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
            <div class="grid-meta">
              <span v-if="human.direction" class="tag direction-tag">{{ human.direction }}</span>
              <span v-if="human.experience" class="tag experience-tag">{{ human.experience }}</span>
            </div>
            <img :src="human.image" :alt="human.name" loading="lazy" />
            <div :class="['grid-card-body', getRandomHumanClass(human.uuid)]">
              <div class="name">{{ human.name }}</div>
              <p>{{ human.description }}</p>
            </div>
          </a>
        </div>
        <div v-if="hasMoreItems" class="carousel-slide load-more-slide" :class="{ center: currentIndex === paginatedHumans.length }">
          <div class="load-more" @click="loadMore">
            <div class="load-more-content">
              <div class="load-more-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <span class="load-more-text">Загрузить ещё</span>
              <span class="load-more-count">{{ remaining }} осталось</span>
              <div class="load-more-progress">
                <div class="progress-bar" :style="{ width: `${(visibleCount / filteredHumans.length) * 100}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div> 
      <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>
  <div v-if="filteredHumans.length === 0 && !isLoading" class="no-results">
    <p>По выбранным фильтрам никого не найдено</p>
  </div>
</template>

<script>
// ============================================================
//  ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, watch, nextTick, onUnmounted, reactive } from 'vue'

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const MOBILE_BREAKPOINT = 736
const baseUrl = import.meta.env.BASE_URL
const perPage = 8
const randomClassCache = new Map()

// ============================================================
//  УТИЛИТЫ
// ============================================================

/**
 * Обработка пути к изображению
 */
const processImage = (imagePath, type, uuid) => {
  if (!imagePath) {
    return uuid ? `${baseUrl}images/${type}/${uuid}.webp` : `${baseUrl}placeholder-${type}.svg`
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath.slice(1)}`
  }
  return imagePath
}

/**
 * Определение категории опыта
 */
const getExperienceCategory = (expValue) => {
  if (!expValue) return 'Нет опыта'
  if (expValue.includes('лет') || expValue.includes('год')) {
    const match = expValue.match(/(\d+)/)
    if (match) {
      const num = parseInt(match[1])
      if (num <= 1) return 'Начинающий'
      if (num <= 3) return 'Опытный'
      return 'Эксперт'
    }
  }
  if (expValue.includes('месяц')) {
    const match = expValue.match(/(\d+)/)
    if (match) {
      const num = parseInt(match[1])
      return num < 12 ? 'Начинающий' : 'Опытный'
    }
  }
  const lower = expValue.toLowerCase()
  if (lower.includes('начин')) return 'Начинающий'
  if (lower.includes('опыт')) return 'Опытный'
  if (lower.includes('эксперт')) return 'Эксперт'

  return expValue || 'Нет опыта'
}

/**
 * Обработка направления (удаление дубликатов)
 */
const processDirection = (directionValue) => {
  if (!directionValue) return ''
  
  if (directionValue.includes('/') || directionValue.includes(',')) {
    const parts = directionValue.replace(/,/g, '/').split('/')
    const uniqueDirections = [...new Set(parts.map(d => d.trim()))]
    return uniqueDirections.join(' / ')
  }
  
  return directionValue
}

// ============================================================
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'ListHumans',

  props: {
    humanType: {
      type: String,
      required: true,
      default: 'volunteers',
      description: 'Тип людей (volunteers, staff, и т.д.)'
    }
  },

  setup(props) {
    // ============================================================
    //  ОПЦИИ ФИЛЬТРОВ
    // ============================================================
    const experienceOptions = [
      { 
        value: 'Начинающий', 
        label: 'Начинающий', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="1.5" fill="currentColor"/><circle cx="16" cy="9" r="1.5" fill="currentColor"/><path d="M8 14c1.5 2 3 2 4 2s2.5 0 4-2"/></svg>`
      },
      { 
        value: 'Опытный', 
        label: 'Опытный', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg>`
      },
      { 
        value: 'Эксперт', 
        label: 'Эксперт', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M8 4L6 6"/><path d="M16 4l2 2"/><circle cx="9" cy="10" r="1.5" fill="currentColor"/><circle cx="15" cy="10" r="1.5" fill="currentColor"/></svg>`
      }
    ]
    const directionOptions = [
      { 
        value: 'Выгул', 
        label: 'Выгул', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
      },
      { 
        value: 'Социализация', 
        label: 'Социализация', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`
      },
      { 
        value: 'Лечение', 
        label: 'Лечение', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9-4-18-3 9H2"/></svg>`
      },
      { 
        value: 'Передержка', 
        label: 'Передержка', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1"/></svg>`
      },
      { 
        value: 'Креатив', 
        label: 'Креатив', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`
      },
      { 
        value: 'Фандрайзинг', 
        label: 'Фандрайзинг', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M8 8l4 4 4-4"/></svg>`
      },
      { 
        value: 'Юридическая помощь', 
        label: 'Юридическая помощь', 
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`
      }
    ]

    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================
    const allHumans = ref([])
    const visibleCount = ref(perPage)
    const isLoading = ref(true)
    const isMobile = ref(false)
    const isLoadingMore = ref(false)
    const isClient = ref(false)
    const savedIndex = ref(0)

    // Фильтры (как в ListPets — объект с true/false)
    const filterExperience = reactive({
      'Начинающий': true,
      'Опытный': true,
      'Эксперт': true
    })
    
    const filterDirection = reactive({
      'Выгул': true,
      'Социализация': true,
      'Лечение': true,
      'Передержка': true,
      'Креатив': true,
      'Фандрайзинг': true,
      'Юридическая помощь': true
    })

    // Карусель
    const carouselRef = ref(null)
    const currentIndex = ref(0)

    // Свайп
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const touchEndX = ref(0)
    const touchEndY = ref(0)
    const isSwiping = ref(false)

    // ============================================================
    //  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================

    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
        if (isMobile.value !== newIsMobile) {
          isMobile.value = newIsMobile
        }
      }
    }

    // ============================================================
    //  ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    // Проверка, все ли фильтры активны
    const areAllActive = computed(() => {
      return (
        filterExperience['Начинающий'] && filterExperience['Опытный'] && filterExperience['Эксперт'] && filterDirection['Выгул'] && filterDirection['Социализация'] && filterDirection['Лечение'] && filterDirection['Передержка'] && filterDirection['Креатив'] && filterDirection['Фандрайзинг'] && filterDirection['Юридическая помощь']
      )
    })

    const isFilterActive = computed(() => {
      return !areAllActive.value
    })

    const filteredHumans = computed(() => {
      return allHumans.value.filter(human => {
        // Проверяем опыт
        if (!filterExperience[human.experience]) return false
        
        // Проверяем направление
        if (filterDirection.value !== null) {
          const directionStr = human.directionRaw || human.direction || ''
          const directions = directionStr.replace(/,/g, '/').split('/').map(d => d.trim())
          // Проверяем, есть ли хоть одно активное направление у человека
          const hasActiveDirection = directions.some(d => filterDirection[d] === true)
          if (!hasActiveDirection) return false
        }

        return true
      })
    })

    const paginatedHumans = computed(() => {
      return filteredHumans.value.slice(0, visibleCount.value)
    })

    const remaining = computed(() => {
      return filteredHumans.value.length - visibleCount.value
    })

    const hasMoreItems = computed(() => {
      return filteredHumans.value.length > visibleCount.value
    })

    const carouselTotalSlides = computed(() => {
      return paginatedHumans.value.length + (hasMoreItems.value ? 1 : 0)
    })

    // ============================================================
    //  МЕТОДЫ
    // ============================================================

    const toggleFilter = (group, value) => {
      if (group === 'experience') {
        filterExperience[value] = !filterExperience[value]
      } else if (group === 'direction') {
        filterDirection[value] = !filterDirection[value]
      }
      // Сбрасываем пагинацию
      visibleCount.value = perPage
      currentIndex.value = 0
    }

    const resetFilters = () => {
      Object.keys(filterExperience).forEach(k => filterExperience[k] = true)
      Object.keys(filterDirection).forEach(k => filterDirection[k] = true)
      visibleCount.value = perPage
      currentIndex.value = 0
    }

    const loadMore = async () => {
      if (isLoadingMore.value || !hasMoreItems.value) return

      isLoadingMore.value = true
      savedIndex.value = currentIndex.value

      await new Promise(resolve => setTimeout(resolve, 500))

      visibleCount.value += perPage
      isLoadingMore.value = false

      if (isMobile.value) {
        nextTick(() => {
          if (carouselRef.value && paginatedHumans.value.length) {
            let targetIndex = savedIndex.value
            const maxIndex = carouselTotalSlides.value - 1

            if (targetIndex > maxIndex) targetIndex = maxIndex
            if (targetIndex < 0) targetIndex = 0

            scrollToSlide(targetIndex)
            savedIndex.value = 0
          }
        })
      }
    }

    const resetToFirstSlide = () => {
      currentIndex.value = 0
      savedIndex.value = 0
      visibleCount.value = perPage

      if (carouselRef.value) {
        const container = carouselRef.value
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

    // --- Карусель ---
    const scrollToSlide = (index) => {
      if (!carouselRef.value) return
      const container = carouselRef.value
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
      if (currentIndex.value < carouselTotalSlides.value - 1) {
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

    // --- Обработчики свайпа ---
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
      const minSwipeDistance = 50

      if (diffX > minSwipeDistance) {
        nextSlide()
      } else if (diffX < -minSwipeDistance) {
        prevSlide()
      }

      touchStartX.value = 0
      touchStartY.value = 0
      touchEndX.value = 0
      touchEndY.value = 0
    }

    // --- Рандомные цвета ---
    let previousColor = 0
    const getRandomHumanClass = (uuid) => {
      if (!uuid) return 'rand-01'
      
      if (randomClassCache.has(uuid)) {
        return randomClassCache.get(uuid)
      }
      let num
      do {
        num = Math.floor(Math.random() * 30) + 1
      } while (num === previousColor)
      previousColor = num
      const formattedNum = num.toString().padStart(2, '0')
      const className = `rand-${formattedNum}`
      randomClassCache.set(uuid, className)
      return className
    }

    // ============================================================
    //  RESIZE
    // ============================================================
    let resizeTimeout = null

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }

      resizeTimeout = setTimeout(() => {
        checkMobile()
        resizeTimeout = null
      }, 100)
    }

    // ============================================================
    //  ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
      isClient.value = true
      checkMobile()

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }

      try {
        const allModules = import.meta.glob('/ru/*/*.md')

        const filteredModules = Object.entries(allModules).filter(([path]) => {
          return path.includes(`/ru/${props.humanType}/`) && !path.endsWith(`${props.humanType}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/ru/${props.humanType}/`, '').replace('.md', '')

            return {
              uuid,
              name: fm.title || '',
              description: fm.description || '',
              experience: getExperienceCategory(fm.experience),
              experienceYears: fm.experience || '',
              direction: processDirection(fm.direction),
              directionRaw: fm.direction || '',
              tags: fm.tags || [],
              image: processImage(fm.image, props.humanType, uuid),
            }
          })
        )

        allHumans.value = loaded
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }
    })

    // --- Watchers ---
    watch([() => filterExperience, () => filterDirection], () => {
      // Фильтры уже обновлены через toggleFilter
    }, { deep: true })

    watch(isMobile, (newVal) => {
      if (isClient.value && newVal && paginatedHumans.value.length) {
        nextTick(() => {
          if (carouselRef.value) {
            resetToFirstSlide()
          }
        })
      }
    })

    watch(
      () => paginatedHumans.value,
      (newVal) => {
        if (isClient.value && isMobile.value && newVal.length) {
          nextTick(() => {
            if (carouselRef.value) {
              const maxIndex = carouselTotalSlides.value - 1
              if (currentIndex.value > maxIndex) {
                resetToFirstSlide()
              }
            }
          })
        }
      },
      { deep: true }
    )

    // --- Unmount ---
    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
      }
    })

    // ============================================================
    //  ВОЗВРАТ
    // ============================================================
    return {
      // Опции фильтров
      experienceOptions,
      directionOptions,
      
      // Данные
      paginatedHumans,
      filteredHumans,
      
      // Фильтры
      filterExperience,
      filterDirection,
      isFilterActive,
      areAllActive,
      toggleFilter,
      resetFilters,
      
      // Пагинация
      visibleCount,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,
      
      // Состояние
      isLoading,
      isMobile,
      baseUrl,
      
      // Карусель
      carouselRef,
      currentIndex,
      carouselTotalSlides,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      resetToFirstSlide,
      
      // Свайп
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
      
      // Прочее
      humanType: props.humanType,
      getRandomHumanClass,
    }
  },
}
</script>