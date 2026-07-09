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
      
      <!-- Кнопка загрузки для сетки -->
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
        </div>
      </div>
    </div>

    <!-- Режим: Карусель (мобильные) -->
    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0"></button>
        
        <div class="carousel-track" ref="carouselRef">
          <!-- Карточки собак -->
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

          <!-- Карточка "Загрузить ещё" для карусели -->
          <div 
            v-if="hasMoreItems" 
            class="carousel-slide load-more-slide"
            :class="{ center: currentIndex === paginatedDogs.length }"
          >
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
        
        <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1"></button>
      </div>
      
      <!-- Индикаторы -->
      <div class="carousel-indicators">
        <span 
          v-for="(_, index) in carouselTotalSlides" 
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
  </div>
</template>

<script>
import { computed, ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

const baseUrl = import.meta.env.BASE_URL
const modules = import.meta.glob('/ru/dogs/*.md')
const perPage = 8
const MOBILE_BREAKPOINT = 768

export default {
  setup() {
    const allDogs = ref([])
    const visibleCount = ref(perPage)
    const isLoading = ref(true)
    const isMobile = ref(false)
    const isLoadingMore = ref(false)
    
    // Сохраняем индекс, который был до загрузки
    const savedIndex = ref(0)
    
    // Определяем размер экрана
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT
        if (isMobile.value !== newIsMobile) {
          isMobile.value = newIsMobile
        }
      }
    }

    if (typeof window !== 'undefined') {
      isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
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

    const getAgeCategory = (ageStr) => {
      if (!ageStr) return ''
      const match = ageStr.match(/(\d+)/)
      if (!match) return ''
      const num = parseInt(match[1])
      if (ageStr.includes('месяц') || num < 1) return 'щенок'
      if (num <= 3) return 'молодая'
      return 'взрослая'
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
      
      // Сохраняем текущий индекс
      savedIndex.value = currentIndex.value
      
      // Имитация загрузки
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Увеличиваем видимое количество
      visibleCount.value += perPage
      isLoadingMore.value = false
      
      // После загрузки восстанавливаем позицию
      if (isMobile.value) {
        nextTick(() => {
          if (carouselRef.value && paginatedDogs.value.length) {
            let targetIndex = savedIndex.value
            
            // Проверяем, не вышел ли индекс за пределы
            const maxIndex = carouselTotalSlides.value - 1
            
            // Если индекс был на карточке загрузки (последний слайд)
            // или стал больше максимального, показываем последнюю карточку
            if (targetIndex > maxIndex) {
              targetIndex = maxIndex
            }
            
            if (targetIndex < 0) {
              targetIndex = 0
            }
            
            // Плавно переходим к нужной карточке
            scrollToSlide(targetIndex)
            
            // Очищаем сохраненный индекс
            savedIndex.value = 0
          }
        })
      }
    }

    watch([filterAge, filterGender, filterSize], () => {
      visibleCount.value = perPage
      currentIndex.value = 0
      savedIndex.value = 0
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
      if (newVal && paginatedDogs.value.length) {
        nextTick(() => {
          if (carouselRef.value) {
            currentIndex.value = 0
            scrollToSlide(0)
          }
        })
      }
    })

    watch(() => paginatedDogs.value, (newVal, oldVal) => {
      if (isMobile.value && newVal.length) {
        nextTick(() => {
          if (carouselRef.value) {
            const maxIndex = carouselTotalSlides.value - 1
            if (currentIndex.value > maxIndex) {
              currentIndex.value = maxIndex
              scrollToSlide(currentIndex.value)
            }
          }
        })
      }
    }, { deep: true })

    onMounted(() => {
      if (typeof window !== 'undefined') {
        checkMobile()
        window.addEventListener('resize', handleResize)
        
        if (isMobile.value && paginatedDogs.value.length) {
          nextTick(() => {
            if (carouselRef.value) {
              scrollToSlide(0)
            }
          })
        }
      }
    })

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
    }
  }
}
</script>


<style scoped>

/* ===== КАРТОЧКА ЗАГРУЗКИ ===== */
.load-more-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  padding: 40px 20px;
}
.load-more-card:hover {
  background: #f1f3f5;
  border-color: #adb5bd;
  transform: scale(1.02);
}
.load-more-card:active {
  transform: scale(0.98);
}
.load-more-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}
.load-more-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.load-more-card:hover .load-more-icon {
  background: #dee2e6;
  transform: rotate(90deg);
}
.load-more-icon svg {
  color: #495057;
}
.load-more-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
.load-more-count {
  font-size: 14px;
  color: #868e96;
}
.load-more-progress {
  width: 100%;
  max-width: 200px;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4a90d9, #357abd);
  transition: width 0.3s ease;
  border-radius: 2px;
}

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
  overflow: hidden;
  padding: 24px 0;
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
  min-height: 280px;
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
  width: 40px;
  height: 100%;
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
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
  .load-more-card {
    min-height: 300px;
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
  .load-more-card {
    min-height: 260px;
    padding: 30px 16px;
  }
  .load-more-icon {
    width: 48px;
    height: 48px;
  }
  .load-more-icon svg {
    width: 36px;
    height: 36px;
  }
  .load-more-text {
    font-size: 16px;
  }
}
</style>