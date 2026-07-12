<template>
  <div class="filters-compact">
    <div class="filter-group">
      <div class="filter-chips">
        <button v-for="option in genderOptions" :key="option.value" class="chip" :class="{ active: filters.gender[option.value] }" @click="toggleFilter('gender', option.value)" :title="option.label" v-html="option.icon"/>
      </div>
      <span class="filter-label">Пол</span>
    </div>
    <div class="filter-group">
      <div class="filter-chips">
        <button v-for="option in ageOptions" :key="option.value" class="chip" :class="{ active: filters.age[option.value] }" @click="toggleFilter('age', option.value)" :title="option.label" v-html="option.icon"/>
      </div>
      <span class="filter-label">Возраст</span>
    </div>
    <div class="filter-group">
      <div class="filter-chips">
        <button v-for="option in sizeOptions" :key="option.value" class="chip" :class="{ active: filters.size[option.value] }" @click="toggleFilter('size', option.value)" :title="option.label" v-html="option.icon"/>
      </div>
      <span class="filter-label">Размер</span>
    </div>
    <button v-if="!areAllActive" class="btn-reset-compact" @click="resetAllFilters" title="Включить все фильтры">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
      Сбросить
    </button>
  </div>
  <div class="grid-list">
    <div v-if="!isMobile" class="grid-cards">
      <a v-for="pet in paginatedPets" :key="pet.slug" :href="`${baseUrl}ru/${petType}/${pet.slug}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
        <div class="grid-meta">
          <span v-if="pet.gender" class="tag gender-tag" :data-gender="pet.gender">{{ pet.gender }}</span>
          <span v-if="pet.age" class="tag age-tag">{{ pet.age }}</span>
          <span v-if="pet.size" class="tag size-tag">{{ pet.size }}</span>
        </div>
        <img :src="pet.image" :alt="pet.name" loading="lazy" />
        <div :class="['grid-card-body', getRandomPetClass(pet.slug)]">
          <div class="name">{{ pet.name }}</div>
          <p>{{ pet.description }}</p>
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
            <div class="progress-bar" :style="{ width: `${(visibleCount / filteredPets.length) * 100}%` }"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>      
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(pet, index) in paginatedPets" :key="pet.slug" class="carousel-slide" :class="{ center: index === currentIndex }" >
            <a :href="`${baseUrl}ru/${petType}/${pet.slug}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
              <div class="grid-meta">
                <span v-if="pet.gender" class="tag gender-tag" :data-gender="pet.gender">{{ pet.gender }}</span>
                <span v-if="pet.age" class="tag age-tag">{{ pet.age }}</span>
                <span v-if="pet.size" class="tag size-tag">{{ pet.size }}</span>
              </div>
              <img :src="pet.image" :alt="pet.name" loading="lazy" />
              <div :class="['grid-card-body', getRandomPetClass(pet.slug)]">
                <div class="name">{{ pet.name }}</div>
                <p>{{ pet.description }}</p>
              </div>
            </a>
          </div>
          <div v-if="hasMoreItems" class="carousel-slide load-more-slide" :class="{ center: currentIndex === paginatedPets.length }">
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
                  <div class="progress-bar" :style="{ width: `${(visibleCount / filteredPets.length) * 100}%` }"></div>
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
    <div v-if="filteredPets.length === 0 && !isLoading" class="no-results">
      <p>По выбранным фильтрам ничего не найдено</p>
    </div>
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

const getAgeCategory = (ageStr) => {
  if (!ageStr) return ''
  const match = ageStr.match(/(\d+)/)
  if (!match) return ''
  const num = parseInt(match[1])
  if (ageStr.includes('месяц') || num < 1) return 'Щенок'
  if (num <= 3) return 'Молодая'
  return 'Взрослая'
}

// ============================================================
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'ListPets',

  props: {
    petType: {
      type: String,
      required: true,
      default: 'dogs'
    }
  },

  setup(props) {
    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================
    const allPets = ref([])
    const visibleCount = ref(perPage)
    const isLoading = ref(true)
    const isMobile = ref(false)
    const isLoadingMore = ref(false)
    const isClient = ref(false)
    const savedIndex = ref(0)

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
    //  ФИЛЬТРЫ (ЧЕКБОКСЫ)
    // ============================================================
    const genderOptions = [
      { 
        value: 'Девочка', 
        label: 'Девочки', 
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">♀</text></svg>`
      },
      { 
        value: 'Мальчик', 
        label: 'Мальчики', 
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">♂</text></svg>`
      }
    ]
    const ageOptions = [
      { 
        value: 'Щенок', 
        label: 'Щенки (до 1 года)', 
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 10c0-1.5.8-3 2-3s2 1.5 2 3-.8 2.5-2 2.5S6 11.5 6 10z"/>
            <path d="M14 10c0-1.5.8-3 2-3s2 1.5 2 3-.8 2.5-2 2.5-2-1-2-2.5z"/>
            <path d="M4 14.5c0-1.5 1.5-2.5 3.5-2.5h9c2 0 3.5 1 3.5 2.5v1.5H4z"/>
            <path d="M7.5 17v2"/><path d="M16.5 17v2"/>
          </svg>`
      },
      { 
        value: 'Молодая', 
        label: 'Молодые (1–3 года)', 
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10c0-2 1-4 3-4s3 2 3 4-1 3-3 3-3-1-3-3z"/><path d="M17 10c0-2-1-4-3-4s-3 2-3 4 1 3 3 3 3-1 3-3z"/><path d="M5 16c0-3 2-4 5-4h4c3 0 5 1 5 4v2H5z"/><path d="M9 18v2"/><path d="M15 18v2"/></svg>`
      },
      { 
        value: 'Взрослая', 
        label: 'Взрослые (от 3 лет)', 
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10c0-3 2-5 4-5s4 2 4 5-2 4-4 4-4-1-4-4z"/><path d="M18 10c0-3-2-5-4-5s-4 2-4 5 2 4 4 4 4-1 4-4z"/><path d="M4 16c0-4 3-5 6-5h4c3 0 6 1 6 5v2H4z"/><path d="M8 18v2"/><path d="M16 18v2"/></svg>`
      }
    ]
    const sizeOptions = [
      { 
        value: 'Маленькая', 
        label: 'Маленькие (до 10 кг)', 
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">S</text></svg>`
      },
      { 
        value: 'Средняя', 
        label: 'Средние (10–25 кг)', 
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">M</text></svg>`
      },
      { 
        value: 'Крупная', 
        label: 'Крупные (от 25 кг)', 
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">L</text></svg>`
      }
    ]

    // Состояние фильтров (все активны по умолчанию)
    const filters = reactive({
      gender: {
        'Девочка': true,
        'Мальчик': true
      },
      age: {
        'Щенок': true,
        'Молодая': true,
        'Взрослая': true
      },
      size: {
        'Маленькая': true,
        'Средняя': true,
        'Крупная': true
      }
    })

    // ============================================================
    //  ВЫЧИСЛЯЕМЫЕ (ФИЛЬТРЫ)
    // ============================================================

    const areAllActive = computed(() => {
      return (
        filters.gender['Девочка'] && filters.gender['Мальчик'] &&
        filters.age['Щенок'] && filters.age['Молодая'] && filters.age['Взрослая'] &&
        filters.size['Маленькая'] && filters.size['Средняя'] && filters.size['Крупная']
      )
    })

    const activeCount = computed(() => {
      let count = 0
      Object.values(filters.gender).forEach(v => { if (v) count++ })
      Object.values(filters.age).forEach(v => { if (v) count++ })
      Object.values(filters.size).forEach(v => { if (v) count++ })
      return count
    })

    const hintText = computed(() => {
      const total = 2 + 3 + 3
      if (areAllActive.value) return 'Все фильтры включены'
      if (activeCount.value === 0) return 'Ни один фильтр не выбран'
      return `Выбрано ${activeCount.value} из ${total}`
    })

    // ============================================================
    //  ВЫЧИСЛЯЕМЫЕ (ПИТОМЦЫ)
    // ============================================================

    const filteredPets = computed(() => {
      return allPets.value.filter(pet => {
        if (!filters.gender[pet.gender]) return false
        if (!filters.age[getAgeCategory(pet.age)]) return false
        if (!filters.size[pet.size]) return false
        return true
      })
    })

    const paginatedPets = computed(() => {
      return filteredPets.value.slice(0, visibleCount.value)
    })

    const remaining = computed(() => {
      return filteredPets.value.length - visibleCount.value
    })

    const hasMoreItems = computed(() => {
      return filteredPets.value.length > visibleCount.value
    })

    const carouselTotalSlides = computed(() => {
      return paginatedPets.value.length + (hasMoreItems.value ? 1 : 0)
    })

    // ============================================================
    //  МЕТОДЫ (ФИЛЬТРЫ)
    // ============================================================

    const toggleFilter = (group, value) => {
      filters[group][value] = !filters[group][value]
      // Сбрасываем пагинацию при изменении фильтров
      visibleCount.value = perPage
      currentIndex.value = 0
    }

    const resetAllFilters = () => {
      Object.keys(filters.gender).forEach(k => filters.gender[k] = true)
      Object.keys(filters.age).forEach(k => filters.age[k] = true)
      Object.keys(filters.size).forEach(k => filters.size[k] = true)
      visibleCount.value = perPage
      currentIndex.value = 0
    }

    // ============================================================
    //  МЕТОДЫ (ОСТАЛЬНЫЕ)
    // ============================================================

    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
        if (isMobile.value !== newIsMobile) {
          isMobile.value = newIsMobile
        }
      }
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
          if (carouselRef.value && paginatedPets.value.length) {
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

    const getRandomPetClass = (slug) => {
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
          return path.includes(`/ru/${props.petType}/`) && !path.endsWith(`${props.petType}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const slug = path.replace(`/ru/${props.petType}/`, '').replace('.md', '')
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || slug

            return {
              slug,
              uuid,
              name: fm.title || slug.charAt(0).toUpperCase() + slug.slice(1),
              description: fm.description || '',
              age: fm.age || '',
              gender: fm.gender || '',
              size: fm.size || '',
              tags: fm.tags || [],
              image: processImage(fm.image, props.petType, uuid),
            }
          })
        )
        allPets.value = loaded
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }
    })

    watch(
      [() => filters.gender, () => filters.age, () => filters.size],
      () => {
        // Сбрасываем на первую позицию при изменении фильтров
        currentIndex.value = 0
        savedIndex.value = 0
        visibleCount.value = perPage
        
        nextTick(() => {
          resetToFirstSlide()
        })
      },
      { deep: true }
    )

    watch(isMobile, (newVal) => {
      if (isClient.value && newVal && paginatedPets.value.length) {
        nextTick(() => {
          if (carouselRef.value) {
            resetToFirstSlide()
          }
        })
      }
    })

    watch(
      () => paginatedPets.value,
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
      // Фильтры
      filters,
      genderOptions,
      ageOptions,
      sizeOptions,
      areAllActive,
      activeCount,
      hintText,
      toggleFilter,
      resetAllFilters,

      // Питомцы
      paginatedPets,
      filteredPets,
      isLoading,
      isMobile,
      visibleCount,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,

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
      baseUrl,
      petType: props.petType,
      getRandomPetClass,
    }
  }
}
</script>