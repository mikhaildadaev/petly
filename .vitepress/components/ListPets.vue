<template>
  <div>
    <div class="filters-bar">
      <div class="filters">
        <select v-model="filterGender" class="filter-select">
          <option value="">Все гендеры</option>
          <option value="Девочка">Девочки</option>
          <option value="Мальчик">Мальчики</option>
        </select>
        <select v-model="filterAge" class="filter-select">
          <option value="">Все возрасты</option>
          <option value="Щенок">Щенки (до 1 года)</option>
          <option value="Молодая">Молодые (1–3 года)</option>
          <option value="Взрослая">Взрослые (от 3 лет)</option>
        </select>
        <select v-model="filterSize" class="filter-select">
          <option value="">Все размеры</option>
          <option value="Маленькая">Маленькие (до 10 кг)</option>
          <option value="Средняя">Средние (10–25 кг)</option>
          <option value="Крупная">Крупные (от 25 кг)</option>
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
    <div v-if="!isMobile" class="grid-cards">
      <a v-for="dog in paginatedDogs" :key="dog.slug" :href="`${baseUrl}ru/${petType}/${dog.slug}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
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
      <div v-if="hasMoreItems" class="load-more-card" @click="loadMore">
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
            <div class="progress-bar" :style="{ width: `${(visibleCount / filteredDogs.length) * 100}%` }"></div>
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
          <div v-for="(dog, index) in paginatedDogs" :key="dog.slug" class="carousel-slide" :class="{ center: index === currentIndex }" >
            <a :href="`${baseUrl}ru/${petType}/${dog.slug}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
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
          <div v-if="hasMoreItems" class="carousel-slide load-more-slide" :class="{ center: currentIndex === paginatedDogs.length }">
            <div class="load-more-card" @click="loadMore">
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
                  <div class="progress-bar" :style="{ width: `${(visibleCount / filteredDogs.length) * 100}%` }"></div>
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
    <div v-if="filteredDogs.length === 0 && !isLoading" class="no-results">
      <p>По выбранным фильтрам ничего не найдено</p>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

const baseUrl = import.meta.env.BASE_URL
const perPage = 8
const MOBILE_BREAKPOINT = 736

export default {
  props: {
    petType: {
      type: String,
      required: true,
      default: 'dogs'
    }
  },
  setup(props) {
    const touchStartX = ref(0);
    const touchEndX = ref(0);
    const isSwiping = ref(false);
    const allDogs = ref([])
    const visibleCount = ref(perPage)
    const isLoading = ref(true)
    const isMobile = ref(false)
    const isLoadingMore = ref(false)
    const isClient = ref(false)
    
    const savedIndex = ref(0)
    
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
        if (isMobile.value !== newIsMobile) {
          isMobile.value = newIsMobile
        }
      }
    }

    // Фильтры
    const filterAge = ref('')
    const filterGender = ref('')
    const filterSize = ref('')

    // Карусель
    const carouselRef = ref(null)
    const currentIndex = ref(0)

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
      isClient.value = true
      checkMobile()
      
      try {
        // Динамически получаем все md файлы
        const allModules = import.meta.glob('/ru/*/*.md')
        
        // Фильтруем только те, что относятся к нашему petType
        const filteredModules = Object.entries(allModules).filter(([path]) => {
          return path.includes(`/ru/${props.petType}/`) && !path.endsWith(`${props.petType}_index.md`)
        })
        
        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            // Динамически заменяем путь
            const slug = path.replace(`/ru/${props.petType}/`, '').replace('.md', '')
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
      
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
    })

    const getAgeCategory = (ageStr) => {
      if (!ageStr) return ''
      const match = ageStr.match(/(\d+)/)
      if (!match) return ''
      const num = parseInt(match[1])
      if (ageStr.includes('месяц') || num < 1) return 'Щенок'
      if (num <= 3) return 'Молодая'
      return 'Взрослая'
    }

    const filteredDogs = computed(() => {
      return allDogs.value.filter(dog => {
        if (filterAge.value && getAgeCategory(dog.age) !== filterAge.value) return false
        if (filterGender.value && dog.gender !== filterGender.value) return false
        if (filterSize.value && dog.size !== filterSize.value) return false
        return true
      })
    })

    const paginatedDogs = computed(() => {
      return filteredDogs.value.slice(0, visibleCount.value)
    })

    const remaining = computed(() => {
      return filteredDogs.value.length - visibleCount.value
    })

    const hasMoreItems = computed(() => {
      return filteredDogs.value.length > visibleCount.value
    })

    const carouselTotalSlides = computed(() => {
      return paginatedDogs.value.length + (hasMoreItems.value ? 1 : 0)
    })

    const loadMore = async () => {
      if (isLoadingMore.value || !hasMoreItems.value) return
      
      isLoadingMore.value = true
      savedIndex.value = currentIndex.value
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      visibleCount.value += perPage
      isLoadingMore.value = false
      
      if (isMobile.value) {
        nextTick(() => {
          if (carouselRef.value && paginatedDogs.value.length) {
            let targetIndex = savedIndex.value
            const maxIndex = carouselTotalSlides.value - 1
            
            if (targetIndex > maxIndex) {
              targetIndex = maxIndex
            }
            
            if (targetIndex < 0) {
              targetIndex = 0
            }
            
            scrollToSlide(targetIndex)
            savedIndex.value = 0
          }
        })
      }
    }

    // === НАДЕЖНЫЙ СБРОС НА ПЕРВУЮ ПОЗИЦИЮ ===
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

    // === ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЙ ФИЛЬТРОВ ===
    watch([filterAge, filterGender, filterSize], () => {
      currentIndex.value = 0
      savedIndex.value = 0
      visibleCount.value = perPage
      
      nextTick(() => {
        resetToFirstSlide()
      })
    })

    // === ЛОГИКА КАРУСЕЛИ ===
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

    // === ОБРАБОТЧИКИ СОБЫТИЙ СВАЙПА ===
const handleTouchStart = (e) => {
      touchStartX.value = e.touches[0].clientX;
      isSwiping.value = true;
    };

    const handleTouchMove = (e) => {
      if (!isSwiping.value) return;
      e.preventDefault();
    };

    const handleTouchEnd = (e) => {
      if (!isSwiping.value) return;
      isSwiping.value = false;

      touchEndX.value = e.changedTouches[0].clientX;
      const diffX = touchStartX.value - touchEndX.value;
      const minSwipeDistance = 50;

      if (diffX > minSwipeDistance) {
        nextSlide();
      } else if (diffX < -minSwipeDistance) {
        prevSlide();
      }

      touchStartX.value = 0;
      touchEndX.value = 0;
    };

    // === ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЙ РАЗМЕРА ===
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

    watch(isMobile, (newVal, oldVal) => {
      if (isClient.value && newVal && paginatedDogs.value.length) {
        nextTick(() => {
          if (carouselRef.value) {
            resetToFirstSlide()
          }
        })
      }
    })

    watch(() => paginatedDogs.value, (newVal, oldVal) => {
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
    }, { deep: true })

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
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
      hasMoreItems,
      loadMore,
      isLoadingMore,
      baseUrl,
      isLoading,
      isMobile,
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
      petType: props.petType,
    }
  }
}
</script>