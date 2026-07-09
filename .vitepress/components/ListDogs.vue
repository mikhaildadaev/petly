<template>
  <div>
    <!-- Фильтры -->
    <div class="filters-bar">
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
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div 
            v-for="(dog, index) in paginatedDogs" 
            :key="dog.slug" 
            class="carousel-slide" 
            :class="{ center: index === currentIndex }"
          >
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
      
      <!-- Индикаторы -->
      <div class="carousel-indicators">
        <span 
          v-for="(_, index) in paginatedDogs" 
          :key="index"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        />
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

    // === ПРОСТАЯ ЛОГИКА КАРУСЕЛИ ===
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
      if (currentIndex.value < paginatedDogs.value.length - 1) {
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

    // === TOUCH-СОБЫТИЯ ===
    let touchStartX = 0
    let touchCurrentX = 0
    let isSwiping = false

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchCurrentX = touchStartX
      isSwiping = false
    }

    const handleTouchMove = (e) => {
      touchCurrentX = e.touches[0].clientX
      const diff = touchStartX - touchCurrentX
      
      if (Math.abs(diff) > 15) {
        isSwiping = true
      }
    }

    const handleTouchEnd = () => {
      if (!isSwiping) {
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

    watch(isMobile, (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (carouselRef.value && paginatedDogs.value.length) {
            scrollToSlide(0)
          }
        })
      }
    })

    watch(() => paginatedDogs.value, () => {
      if (isMobile.value) {
        nextTick(() => {
          if (carouselRef.value && paginatedDogs.value.length) {
            scrollToSlide(0)
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
  margin: 0 -24px;
  width: calc(100% + 48px);
  position: relative;
  display: flex;
  align-items: center;
}
.carousel-track {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 0;
  scrollbar-width: none;
  flex: 1;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
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
  z-index: 5;
}
.carousel-btn.prev {
  left: 0;
}
.carousel-btn.next {
  right: 0;
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