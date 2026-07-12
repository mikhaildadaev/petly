<template>
  <div class="filters-compact">
    <div class="filter-group">
      <select v-model="filterExperience" class="filter-select">
        <option value="">Все уровни</option>
        <option value="Начинающий">Начинающий (до 1 года)</option>
        <option value="Опытный">Опытный (1–3 года)</option>
        <option value="Эксперт">Эксперт (от 3 лет)</option>
      </select>
      <select v-model="filterDirection" class="filter-select">
        <option value="">Все направления</option>
        <option value="Выгул">Выгул</option>
        <option value="Социализация">Социализация</option>
        <option value="Лечение">Лечение</option>
        <option value="Передержка">Передержка</option>
        <option value="Фото/Видео">Фото/Видео</option>
        <option value="Реклама">Реклама</option>
        <option value="SMM">SMM</option>
        <option value="Дизайн">Дизайн</option>
        <option value="Юридическая помощь">Юридическая помощь</option>
        <option value="Ветеринария">Ветеринария</option>
        <option value="Фандрайзинг">Фандрайзинг</option>
      </select>
    </div>
    <button v-if="!areAllActive" class="btn-reset-compact" @click="resetAllFilters" title="Включить все фильтры">
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
    <a v-for="human in paginatedHumans" :key="human.slug" :href="`${baseUrl}ru/${humanType}/${human.slug}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
      <div class="grid-meta">
        <span v-if="human.direction" class="tag direction-tag">{{ human.direction }}</span>
        <span v-if="human.experience" class="tag experience-tag">{{ human.experience }}</span>
      </div>
      <img :src="human.image" :alt="human.name" loading="lazy" />
      <div :class="['grid-card-body', getRandomHumanClass(human.slug)]">
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
        <div v-for="(human, index) in paginatedHumans" :key="human.slug" class="carousel-slide" :class="{ center: index === currentIndex }" >
          <a :href="`${baseUrl}ru/${humanType}/${human.slug}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
            <div class="grid-meta">
              <span v-if="human.direction" class="tag direction-tag">{{ human.direction }}</span>
              <span v-if="human.experience" class="tag experience-tag">{{ human.experience }}</span>
            </div>
            <img :src="human.image" :alt="human.name" loading="lazy" />
            <div :class="['grid-card-body', getRandomHumanClass(human.slug)]">
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
    <p>По выбранным фильтрам ничего не найдено</p>
  </div>
</template>

<script>
// ============================================================
//  ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

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

  // Проверяем годы
  if (expValue.includes('лет') || expValue.includes('год')) {
    const match = expValue.match(/(\d+)/)
    if (match) {
      const num = parseInt(match[1])
      if (num <= 1) return 'Начинающий'
      if (num <= 3) return 'Опытный'
      return 'Эксперт'
    }
  }

  // Проверяем месяцы
  if (expValue.includes('месяц')) {
    const match = expValue.match(/(\d+)/)
    if (match) {
      const num = parseInt(match[1])
      return num < 12 ? 'Начинающий' : 'Опытный'
    }
  }

  // Проверяем ключевые слова
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
    //  СОСТОЯНИЕ
    // ============================================================
    const allHumans = ref([])
    const visibleCount = ref(perPage)
    const isLoading = ref(true)
    const isMobile = ref(false)
    const isLoadingMore = ref(false)
    const isClient = ref(false)
    const savedIndex = ref(0)

    // Фильтры
    const filterExperience = ref('')
    const filterDirection = ref('')

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

    const isFilterActive = computed(() => {
      return filterExperience.value !== '' || filterDirection.value !== ''
    })

    const filteredHumans = computed(() => {
      return allHumans.value.filter(human => {
        // Фильтр по опыту
        if (filterExperience.value && human.experience !== filterExperience.value) {
          return false
        }

        // Фильтр по направлению
        if (filterDirection.value) {
          const directionStr = human.directionRaw || human.direction || ''
          const directions = directionStr.replace(/,/g, '/').split('/').map(d => d.trim())
          if (!directions.includes(filterDirection.value)) {
            return false
          }
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

    const resetFilters = () => {
      filterExperience.value = ''
      filterDirection.value = ''
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
    const getRandomHumanClass = (slug) => {
      if (randomClassCache.has(slug)) {
        return randomClassCache.get(slug)
      }

      const num = Math.floor(Math.random() * 30) + 1
      const formattedNum = num.toString().padStart(2, '0')
      const className = `rand-${formattedNum}`

      randomClassCache.set(slug, className)
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
            const slug = path.replace(`/ru/${props.humanType}/`, '').replace('.md', '')
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || slug

            return {
              slug,
              uuid,
              name: fm.title || slug.charAt(0).toUpperCase() + slug.slice(1),
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
    watch([filterExperience, filterDirection], () => {
      currentIndex.value = 0
      savedIndex.value = 0
      visibleCount.value = perPage

      nextTick(() => {
        resetToFirstSlide()
      })
    })

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
      paginatedHumans,
      filteredHumans,
      filterExperience,
      filterDirection,
      isFilterActive,
      resetFilters,
      visibleCount,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,
      isLoading,
      isMobile,
      baseUrl,
      carouselRef,
      currentIndex,
      carouselTotalSlides,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      resetToFirstSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
      humanType: props.humanType,
      getRandomHumanClass,
    }
  },
}
</script>