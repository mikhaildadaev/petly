<template>
  <div>
    <!-- Фильтры -->
    <div class="filters">
      <select v-model="filterGender" class="filter-select">
        <option value="">Все гендеры</option>
        <option value="Девочка">Девочки</option>
        <option value="Мальчик">Мальчики</option>
      </select>
      <select v-model="filterAge" class="filter-select">
        <option value="">Все возрасты</option>
        <option value="щенок">Щенки (до 1 года)</option>
        <option value="молодая">Молодые (1–3 года)</option>
        <option value="взрослая">Взрослые (3+ лет)</option>
      </select>
      <select v-model="filterSize" class="filter-select">
        <option value="">Все размеры</option>
        <option value="Маленькая">Маленькие</option>
        <option value="Средняя">Средние</option>
        <option value="Крупная">Крупные</option>
      </select>
      <!-- Кнопка сброса -->
      <button v-if="isFilterActive" @click="resetFilters" class="btn-reset" title="Сбросить все фильтры">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
        Сбросить
      </button>
    </div>

    <!-- Режим: Сетка (десктоп) -->
    <div v-if="!isMobile" class="grid-cards">
      <a v-for="dog in paginatedDogs" :key="dog.slug" :href="`${baseUrl}ru/dogs/${dog.slug}`" target="_blank" rel="noopener noreferrer" class="grid-card">
        <div class="grid-meta">
          <span v-if="dog.gender" class="tag gender-tag" :data-gender="dog.gender">{{ dog.gender }}</span>
          <span v-if="dog.age" class="tag age-tag">{{ dog.age }}</span>
          <span v-if="dog.size" class="tag size-tag">{{ dog.size }}</span>
        </div>
        <img :src="dog.image" :alt="dog.name" loading="lazy" />
        <div class="grid-card-body">
          <h3>{{ dog.name }}</h3>
          <p>{{ dog.description }}</p>
        </div>
      </a>
    </div>

    <!-- Режим: Карусель (мобильные) -->
    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0"></button>
        <div 
          class="carousel-track" 
          ref="carouselRef"
          @scroll="handleScroll"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div v-for="(dog, index) in paginatedDogs" :key="dog.slug" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}ru/dogs/${dog.slug}`" target="_blank" rel="noopener noreferrer" class="grid-card">
              <div class="grid-meta">
                <span v-if="dog.gender" class="tag gender-tag" :data-gender="dog.gender">{{ dog.gender }}</span>
                <span v-if="dog.age" class="tag age-tag">{{ dog.age }}</span>
                <span v-if="dog.size" class="tag size-tag">{{ dog.size }}</span>
              </div>
              <img :src="dog.image" :alt="dog.name" loading="lazy" />
              <div class="grid-card-body">
                <h3>{{ dog.name }}</h3>
                <p>{{ dog.description }}</p>
              </div>
            </a>
          </div>
        </div>
        <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= paginatedDogs.length - 1"></button>
      </div>
      
      <!-- Индикаторы для мобильных -->
      <div class="carousel-indicators">
        <span  v-for="(_, index) in paginatedDogs"  :key="index" class="dot" :class="{ active: index === currentIndex }" @click="goToSlide(index)" />
      </div>
    </div>

    <!-- Результаты фильтрации -->
    <div v-if="filteredDogs.length === 0 && !isLoading" class="no-results">
      <p>😕 По вашему запросу ничего не найдено</p>
      <button @click="resetFilters" class="btn-reset-link">Показать всех собак</button>
    </div>

    <!-- Кнопка «Загрузить ещё» -->
    <div v-if="filteredDogs.length > visibleCount" class="load-more">
      <button @click="loadMore" class="btn-load">Загрузить ещё ({{ remaining }})</button>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

const baseUrl = import.meta.env.BASE_URL
const modules = import.meta.glob('/ru/dogs/*.md')
const perPage = 8

export default {
  setup() {
    const allDogs = ref([])
    const visibleCount = ref(perPage)
    const isLoading = ref(true)
    const isMobile = ref(false)
    if (typeof window !== 'undefined') {
      isMobile.value = window.innerWidth < 768
    }

    // Фильтры
    const filterAge = ref('')
    const filterGender = ref('')
    const filterSize = ref('')

    // Карусель
    const carouselRef = ref(null)
    const currentIndex = ref(0)

    // Проверка, активен ли хотя бы один фильтр
    const isFilterActive = computed(() => {
      return filterAge.value !== '' || filterGender.value !== '' || filterSize.value !== ''
    })

    const resetFilters = () => {
      filterAge.value = ''
      filterGender.value = ''
      filterSize.value = ''
    }

    // Загрузка данных
    onMounted(async () => {
      try {
        const loaded = await Promise.all(
          Object.entries(modules)
            .filter(([path]) => !path.endsWith('dogs_index.md'))
            .map(async ([path, loader]) => {
              const mod = await loader()
              const slug = path.replace('/ru/dogs/', '').replace('.md', '')
              const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
              return {
                slug,
                name: fm.title || slug.charAt(0).toUpperCase() + slug.slice(1),
                description: fm.description || '',
                age: fm.age || '',
                gender: fm.gender || '',
                size: fm.size || '',
                tags: fm.tags || [],
                image: fm.image || '/placeholder-dog.svg'
              }
            })
        )
        allDogs.value = loaded
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }
    })

    // Возрастная категория
    const getAgeCategory = (ageStr) => {
      if (!ageStr) return ''
      const match = ageStr.match(/(\d+)/)
      if (!match) return ''
      const num = parseInt(match[1])
      if (ageStr.includes('месяц') || num < 1) return 'щенок'
      if (num <= 3) return 'молодая'
      return 'взрослая'
    }

    // Фильтрация
    const filteredDogs = computed(() => {
      return allDogs.value.filter(dog => {
        if (filterAge.value && getAgeCategory(dog.age) !== filterAge.value) return false
        if (filterGender.value && dog.gender !== filterGender.value) return false
        if (filterSize.value && dog.size !== filterSize.value) return false
        return true
      })
    })

    // Пагинация
    const paginatedDogs = computed(() => {
      return filteredDogs.value.slice(0, visibleCount.value)
    })

    const remaining = computed(() => {
      return filteredDogs.value.length - visibleCount.value
    })

    const loadMore = () => {
      visibleCount.value += perPage
    }

    watch([filterAge, filterGender, filterSize], () => {
      visibleCount.value = perPage
      currentIndex.value = 0
    })

    // === ЛОГИКА КАРУСЕЛИ ===
    let isAnimating = false
    let animationTimer = null
    let scrollTimeout = null

    const scrollToSlide = (index, smooth = true) => {
      if (!carouselRef.value) return
      const container = carouselRef.value
      const slides = container.querySelectorAll('.carousel-slide')
      if (!slides.length || index < 0 || index >= slides.length) return

      const slide = slides[index]
      const containerWidth = container.offsetWidth
      const slideWidth = slide.offsetWidth
      const scrollPosition = slide.offsetLeft - (containerWidth - slideWidth) / 2

      if (animationTimer) {
        clearTimeout(animationTimer)
        animationTimer = null
      }

      isAnimating = true
      currentIndex.value = index

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: smooth ? 'smooth' : 'auto'
      })

      animationTimer = setTimeout(() => {
        isAnimating = false
        animationTimer = null
      }, 400)
    }

    const nextSlide = () => {
      if (isAnimating) return
      if (currentIndex.value < paginatedDogs.value.length - 1) {
        scrollToSlide(currentIndex.value + 1)
      }
    }

    const prevSlide = () => {
      if (isAnimating) return
      if (currentIndex.value > 0) {
        scrollToSlide(currentIndex.value - 1)
      }
    }

    const goToSlide = (index) => {
      if (isAnimating) return
      scrollToSlide(index)
    }

    // Обновление индекса при скролле
    const updateIndex = () => {
      if (isAnimating) return
      if (!carouselRef.value) return
      
      const container = carouselRef.value
      const slides = container.querySelectorAll('.carousel-slide')
      if (!slides.length) return

      const containerWidth = container.offsetWidth
      const scrollLeft = container.scrollLeft
      let closestIndex = 0
      let closestDistance = Infinity

      slides.forEach((slide, index) => {
        const slideCenter = slide.offsetLeft - (containerWidth - slide.offsetWidth) / 2
        const distance = Math.abs(slideCenter - scrollLeft)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      if (closestIndex !== currentIndex.value) {
        currentIndex.value = closestIndex
      }
    }

    const handleScroll = () => {
      if (isAnimating) return
      
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      
      scrollTimeout = setTimeout(() => {
        updateIndex()
        scrollTimeout = null
      }, 100)
    }

    // === TOUCH-СОБЫТИЯ ===
    let touchStartX = 0
    let touchCurrentX = 0
    let isSwiping = false

    const handleTouchStart = (e) => {
      if (isAnimating) return
      touchStartX = e.touches[0].clientX
      touchCurrentX = touchStartX
      isSwiping = false
    }

    const handleTouchMove = (e) => {
      if (isAnimating) return
      touchCurrentX = e.touches[0].clientX
      const diff = touchStartX - touchCurrentX
      
      if (Math.abs(diff) > 15) {
        isSwiping = true
      }
    }

    const handleTouchEnd = () => {
      if (isAnimating || !isSwiping) {
        isSwiping = false
        return
      }

      const diff = touchStartX - touchCurrentX
      const threshold = 40

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          if (currentIndex.value < paginatedDogs.value.length - 1) {
            scrollToSlide(currentIndex.value + 1)
          }
        } else {
          if (currentIndex.value > 0) {
            scrollToSlide(currentIndex.value - 1)
          }
        }
      }

      isSwiping = false
      touchStartX = 0
      touchCurrentX = 0
    }

    // === ОТСЛЕЖИВАНИЕ РАЗМЕРА ЭКРАНА ===
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        isMobile.value = window.innerWidth < 768
      }
    }

    // Сбрасываем карусель при смене режима
    watch(isMobile, (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (carouselRef.value && paginatedDogs.value.length) {
            scrollToSlide(0, false)
          }
        })
      }
    })

    // Следим за изменением данных
    watch(() => paginatedDogs.value, () => {
      if (isMobile.value) {
        nextTick(() => {
          if (carouselRef.value && paginatedDogs.value.length) {
            scrollToSlide(0, false)
          }
        })
      }
    }, { deep: true })

    onMounted(() => {
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', checkMobile)
      }
    })

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile)
      }
    })

    return {
      paginatedDogs,
      filteredDogs,
      filterAge,
      filterGender,
      filterSize,
      isFilterActive,
      resetFilters,
      visibleCount,
      remaining,
      loadMore,
      baseUrl,
      isLoading,
      isMobile,
      carouselRef,
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      handleScroll,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    }
  }
}
</script>

<style scoped>

/* ===== КАРУСЕЛЬ ===== */
.carousel-container {
  width: 100%;
  margin: 2rem 0;
}
.carousel-wrapper {
  position: relative;
  align-items: center;
  gap: 10px;
  margin: 0 -24px;
  padding: 24px 0;
  width: calc(100% + 48px);
}
.carousel-track {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  flex: 1;
}
.carousel-track::-webkit-scrollbar {
  display: none;
}
.carousel-slide {
  flex: 0 0 85%;
  scroll-snap-align: center;
  transition: all 0.5s ease;
}
.carousel-slide.center {
  transform: scale(1.05);
  z-index: 2;
}
.carousel-slide:not(.center) {
  opacity: 0.6;
  transform: scale(0.9);
}
.carousel-slide:first-child {
  margin-left: 7.5%;
}
.carousel-slide:last-child {
  margin-right: 7.5%;
}

/* Кнопки карусели */
.carousel-btn {
  position: absolute;
  top: 0;
  width: 48px;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}
.carousel-btn.prev {
  left: 0;
}

.carousel-btn.next {
  right: 0;
}

/* Индикаторы */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-border);
  cursor: pointer;
  transition: all 0.3s;
}

.dot.active {
  background: var(--vp-c-brand);
  width: 24px;
  border-radius: 4px;
}

/* ===== ТЕГИ ===== */
.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.age-tag {
  background: rgba(52, 152, 219, 0.15);
  color: #2980b9;
}

.dark .age-tag {
  background: rgba(52, 152, 219, 0.25);
  color: #5dade2;
}

.gender-tag {
  background: rgba(231, 76, 60, 0.12);
  color: #e74c3c;
}

.gender-tag[data-gender="Мальчик"] {
  background: rgba(52, 73, 94, 0.15);
  color: #2c3e50;
}

.dark .gender-tag[data-gender="Мальчик"] {
  background: rgba(52, 73, 94, 0.25);
  color: #5d6d7e;
}

.size-tag {
  background: rgba(46, 204, 113, 0.15);
  color: #27ae60;
}

.dark .size-tag {
  background: rgba(46, 204, 113, 0.25);
  color: #58d68d;
}

/* ===== СОСТОЯНИЯ ===== */
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 14px;
  border: 1px solid var(--vp-c-border);
  margin: 2rem 0;
}

.no-results p {
  font-size: 1.2rem;
  color: var(--vp-c-text-light);
  margin-bottom: 1rem;
}

.btn-reset-link {
  padding: 0.6rem 1.5rem;
  background: #e67e22;
  color: white !important;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.btn-reset-link:hover {
  background: #f0a04b;
  transform: scale(1.02);
}

.btn-reset-link:active {
  transform: scale(0.98);
}

.load-more {
  text-align: center;
  margin: 2rem 0;
}

.btn-load {
  padding: 0.8rem 2rem;
  background: transparent;
  border: 2px solid #e67e22;
  color: #e67e22;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.btn-load:hover {
  background: #e67e22;
  color: #fff;
  transform: scale(1.02);
}

.btn-load:active {
  transform: scale(0.98);
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .carousel-slide {
    flex: 0 0 80%;
  }
  .carousel-slide:first-child {
    margin-left: 10%;
  }
  .carousel-slide:last-child {
    margin-right: 10%;
  }
}

@media (max-width: 480px) {
  .carousel-slide {
    flex: 0 0 75%;
  }
  .carousel-slide:first-child {
    margin-left: 12.5%;
  }
  .carousel-slide:last-child {
    margin-right: 12.5%;
  }
}
</style>