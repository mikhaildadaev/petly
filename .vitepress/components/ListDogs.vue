<template>
  <div>
    <!-- Фильтры -->
    <div class="filters-bar">
      <div class="filters">
        <select v-model="filterGender" class="filter-select">
          <option value="">Гендер</option>
          <option value="Девочка">Девочки</option>
          <option value="Мальчик">Мальчики</option>
        </select>
        <select v-model="filterAge" class="filter-select">
          <option value="">Возраст</option>
          <option value="щенок">Щенки (до 1 года)</option>
          <option value="молодая">Молодые (1–3 года)</option>
          <option value="взрослая">Взрослые (3+ лет)</option>
        </select>
        <select v-model="filterSize" class="filter-select">
          <option value="">Размер</option>
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

      <!-- Переключатель режимов -->
      <div class="view-toggle">
        <button @click="viewMode = 'grid'" :class="['toggle-btn', { active: viewMode === 'grid' }]" title="Сетка">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
        <button @click="viewMode = 'carousel'" :class="['toggle-btn', { active: viewMode === 'carousel' }]" title="Карусель">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <circle cx="9" cy="12" r="2" />
            <circle cx="15" cy="12" r="2" />
            <line x1="2" y1="8" x2="4" y2="8" />
            <line x1="20" y1="8" x2="22" y2="8" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Режим: Сетка (оригинальная) -->
    <div v-if="viewMode === 'grid'" class="grid-cards">
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

    <!-- Режим: Карусель -->
    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0">‹</button>
        <div class="carousel-track" ref="carouselRef">
          <div v-for="(dog, index) in paginatedDogs" :key="dog.slug" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}ru/dogs/${dog.slug}`" target="_blank" rel="noopener noreferrer" class="carousel-card" >
              <div class="carousel-meta">
                <span v-if="dog.gender" class="tag gender-tag" :data-gender="dog.gender">{{ dog.gender }}</span>
                <span v-if="dog.age" class="tag age-tag">{{ dog.age }}</span>
                <span v-if="dog.size" class="tag size-tag">{{ dog.size }}</span>
              </div>
              <img :src="dog.image" :alt="dog.name" loading="lazy" />
              <div class="carousel-card-body">
                <h3>{{ dog.name }}</h3>
                <p>{{ dog.description }}</p>
              </div>
            </a>
          </div>
        </div>

        <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= paginatedDogs.length - 1" >›</button>
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
import { computed, ref, onMounted, watch, nextTick } from 'vue'

const baseUrl = import.meta.env.BASE_URL
const modules = import.meta.glob('/ru/dogs/*.md')
const perPage = 8

export default {
  setup() {
    const allDogs = ref([])
    const visibleCount = ref(perPage)
    const isLoading = ref(true)
    const viewMode = ref('grid')

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

    const updateIndex = () => {
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

    // Сбрасываем карусель при смене режима
    watch(viewMode, (newMode) => {
      if (newMode === 'carousel') {
        nextTick(() => {
          if (carouselRef.value && paginatedDogs.value.length) {
            scrollToSlide(0)
          }
        })
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
      viewMode,
      carouselRef,
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      updateIndex,
    }
  }
}
</script>

<style scoped>

/* ===== ОБЪЕДИНЕННАЯ ПАНЕЛЬ ===== */
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 0.75rem 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
}

.filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;
}

.filter-select {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  background: var(--vp-c-bg);
  color: var(--vp-c-text);
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-width: 120px;
}

.filter-select:hover {
  border-color: #e67e22;
}

.filter-select:focus {
  outline: none;
  border-color: #e67e22;
  box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.2);
}

.dark .filter-select {
  background: #252525;
  border-color: #3a3530;
}

/* Кнопка сброса */
.btn-reset {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #e67e22;
  background: transparent;
  color: #e67e22;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-reset:hover {
  background: #e67e22;
  color: white;
  transform: scale(1.02);
}

.btn-reset:active {
  transform: scale(0.95);
}

.btn-reset svg {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.btn-reset:hover svg {
  transform: rotate(30deg);
}

.dark .btn-reset {
  border-color: #e67e22;
  color: #e67e22;
}

.dark .btn-reset:hover {
  background: #e67e22;
  color: #fff;
}

/* ===== ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ ===== */
.view-toggle {
  display: flex;
  gap: 4px;
  background: var(--vp-c-bg);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  flex-shrink: 0;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--vp-c-text-light);
  transition: all 0.2s;
}

.toggle-btn:hover {
  color: var(--vp-c-text);
  background: var(--vp-c-bg-soft);
}

.toggle-btn.active {
  background: var(--vp-c-brand);
  color: white;
}

.toggle-btn svg {
  flex-shrink: 0;
}

.dark .view-toggle {
  background: #1a1a1a;
  border-color: #3a3530;
}

.dark .toggle-btn:hover {
  background: #2a2a2a;
}

.dark .toggle-btn.active {
  background: var(--vp-c-brand);
  color: white;
}

/* ===== АДАПТИВНОСТЬ ===== */
@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .filters {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .filter-select {
    flex: 1 1 calc(50% - 0.5rem);
    min-width: 100px;
  }

  .view-toggle {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .filters-bar {
    padding: 0.5rem;
  }

  .filter-select {
    flex: 1 1 100%;
    font-size: 0.8rem;
    padding: 0.35rem 0.6rem;
  }
  .btn-reset {
    font-size: 0.75rem;
    padding: 0.35rem 0.6rem;
  }
  .view-toggle {
    align-self: stretch;
  }
  .toggle-btn {
    flex: 1;
    padding: 5px 8px;
  }
}

/* ===== КАРУСЕЛЬ ===== */
.carousel-container {
  width: calc(100% + 48px);
  margin: 2rem -24px;
}

.carousel-wrapper {
  position: relative;
  align-items: center;
  gap: 10px;
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
  flex: 0 0 calc(100% - 96px);
  scroll-snap-align: center;
  transition: all 0.5s ease;
}
.carousel-slide.center {
  transform: scale(1.08);
  z-index: 2;
}
.carousel-slide:not(.center) {
  opacity: 0.5;
  transform: scale(0.85);
}
.carousel-slide:first-child {
  margin-left: 48px
}
.carousel-slide:last-child {
  margin-right: 48px
}

.carousel-card {
  display: block;
  text-decoration: none;
  color: inherit;
  background: var(--vp-c-bg-soft);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--vp-c-border);
  transition: all 0.3s;
}
.dark .carousel-card {
  background: #252525;
  border-color: #3a3530;
}
.carousel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}
.carousel-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding: 0.5rem 1rem 0;
}
.carousel-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.carousel-card-body {
  padding: 1rem;
}
.carousel-card-body h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}
.carousel-card-body p {
  font-size: 0.9rem;
  color: var(--vp-c-text-light);
  margin: 0;
}

/* Кнопки карусели */
.carousel-btn {
  position: absolute;
  width: 40px;
  height: 100%;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}
.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.carousel-btn.prev {
  left: 0;
}
.carousel-btn.next {
  right: 0;
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
  .filters {
    gap: 0.75rem;
  }
  .filter-select {
    min-width: 120px;
    flex: 1 1 calc(50% - 0.75rem);
  }
  .btn-reset {
    flex: 0 1 auto;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
  .carousel-btn {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }
}

@media (max-width: 640px) {
  .filters {
    flex-direction: column;
    gap: 0.5rem;
  }
  .filter-select {
    min-width: 100%;
    flex: 1 1 100%;
  }
  .btn-reset {
    width: 100%;
    justify-content: center;
    padding: 0.6rem;
  }
  .grid-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .grid-card-body {
    padding: 1rem;
  }
  .grid-card-body h3 {
    font-size: 1.3rem;
  }
  .grid-card::after {
    top: 8px;
    right: 12px;
    font-size: 16px;
    padding: 2px 6px;
  }
}

@media (max-width: 480px) {
  .grid-card-body p {
    font-size: 0.9rem;
  }
  .tag {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
  }
  .no-results {
    padding: 2rem 1rem;
  }
  .no-results p {
    font-size: 1rem;
  }
  .carousel-card img {
    height: 150px;
  }
  .carousel-btn {
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
}
</style>