<template>
  <div class="filters-compact hide-scrollbar">
    <div class="filter-group">
      <div class="filter-chips">
        <button v-for="option in genderOptions" :key="option.value" class="chip" :class="{ active: filters.gender[option.value] }" @click="toggleFilter('gender', option.value)" :title="option.label" v-html="option.icon"/>
      </div>
      <span class="filter-label">{{ translate('filter', 'Пол') }}</span>
    </div>
    <div class="filter-group">
      <div class="filter-chips">
        <button v-for="option in ageOptions" :key="option.value" class="chip" :class="{ active: filters.age[option.value] }" @click="toggleFilter('age', option.value)" :title="option.label" v-html="option.icon"/>
      </div>
      <span class="filter-label">{{ translate('filter', 'Возраст') }}</span>
    </div>
    <div class="filter-group">
      <div class="filter-chips">
        <button v-for="option in sizeOptions" :key="option.value" class="chip" :class="{ active: filters.size[option.value] }" @click="toggleFilter('size', option.value)" :title="option.label" v-html="option.icon"/>
      </div>
      <span class="filter-label">{{ translate('filter', 'Размер') }}</span>
    </div>
    <button v-if="!areAllActive" class="btn-reset-compact" @click="resetFilters" :title="translate('ui', 'Включить все фильтры')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
      </svg>
      {{ translate('filter', 'Сбросить') }}
    </button>
  </div>
  <div v-if="!isMobile" class="grid-cards">
    <a v-for="pet in paginatedPets" :key="pet.uuid" :href="`${baseUrl}${lang}/pets/${type}/${pet.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
      <div class="grid-meta">
        <span v-if="pet.genderDisplay" class="tag gender-tag" :data-gender="pet.gender">{{ pet.genderDisplay }}</span>
        <span v-if="pet.ageDisplay" class="tag age-tag">{{ pet.ageDisplay }}</span>
        <span v-if="pet.sizeDisplay" class="tag size-tag">{{ pet.sizeDisplay }}</span>
      </div>
      <img :src="pet.image" loading="lazy" />
      <div :class="['grid-card-body', useRandomClass(pet.uuid)]">
        <div class="name">{{ pet.nameDisplay }}</div>
        <p>{{ pet.descriptionDisplay }}</p>
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
        <span class="load-more-text">{{ translate('ui', 'Загрузить ещё') }}</span>
        <span class="load-more-count">{{ remaining }} {{ translate('ui', 'осталось') }}</span>
        <div class="load-more-progress">
          <div class="progress-bar" :style="{ width: `${(visibleCount / filteredPets.length) * 100}%` }"></div>
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
        <div v-for="(pet, index) in paginatedPets" :key="pet.uuid" class="carousel-slide" :class="{ center: index === currentIndex }" >
          <a :href="`${baseUrl}${lang}/pets/${type}/${pet.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
            <div class="grid-meta">
              <span v-if="pet.genderDisplay" class="tag gender-tag" :data-gender="pet.gender">{{ pet.genderDisplay }}</span>
              <span v-if="pet.ageDisplay" class="tag age-tag">{{ pet.ageDisplay }}</span>
              <span v-if="pet.sizeDisplay" class="tag size-tag">{{ pet.sizeDisplay }}</span>
            </div>
            <img :src="pet.image" loading="lazy" />
            <div :class="['grid-card-body', useRandomClass(pet.uuid)]">
              <div class="name">{{ pet.nameDisplay }}</div>
              <p>{{ pet.descriptionDisplay }}</p>
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
              <span class="load-more-text">{{ translate('ui', 'Загрузить ещё') }}</span>
              <span class="load-more-count">{{ remaining }} {{ translate('ui', 'осталось') }}</span>
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
    <p>{{ translate('ui', 'Нет результатов') }}</p>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, watch, nextTick, onUnmounted, reactive, inject } from 'vue'
import { usePagination } from '../utils/usePagination'
import { useRandomColor } from '../utils/useRandomColor'
import { useScrollCarusel } from '../utils/useScrollCarusel'
import { useTranslate, useAge, useAgePetCategory } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

// ============================================================
//  3. КОМПОНЕНТ
// ============================================================
export default {
  name: 'ListPets',

  props: {
    type: {
      type: String,
      required: true,
      default: 'dogs'
    }
  },

  setup(props) {
    // ============================================================
    //  3.1. ЯЗЫК И ПЕРЕВОДЫ
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => useTranslate(lang.value, category, key)

    // ============================================================
    //  3.2. ОПЦИИ ФИЛЬТРОВ
    // ============================================================
    const GENDER_KEYS = ['Девочка', 'Мальчик']
    const genderOptions = computed(() => {
      const genderIcons = {
        'Девочка': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">♀</text></svg>`,
        'Мальчик': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">♂</text></svg>`
      }
      return GENDER_KEYS.map(key => ({
        value: key,
        label: translate('gender', key),
        icon: genderIcons[key] || ''
      }))
    })

    const AGE_KEYS = ['Детеныш', 'Молодая', 'Взрослая']
    const ageOptions = computed(() => {
      const ageIcons = {
        'Детеныш': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10c0-1.5.8-3 2-3s2 1.5 2 3-.8 2.5-2 2.5S6 11.5 6 10z"/><path d="M14 10c0-1.5.8-3 2-3s2 1.5 2 3-.8 2.5-2 2.5-2-1-2-2.5z"/><path d="M4 13.5c0-1.5 1.5-2.5 3.5-2.5h9c2 0 3.5 1 3.5 2.5v1.5H4z"/><path d="M7.5 17v2"/><path d="M16.5 17v2"/></svg>`,
        'Молодая': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10c0-2 1-4 3-4s3 2 3 4-1 3-3 3-3-1-3-3z"/><path d="M17 10c0-2-1-4-3-4s-3 2-3 4 1 3 3 3 3-1 3-3z"/><path d="M5 16c0-3 2-4 5-4h4c3 0 5 1 5 4v2H5z"/><path d="M9 18v2"/><path d="M15 18v2"/></svg>`,
        'Взрослая': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10c0-3 2-5 4-5s4 2 4 5-2 4-4 4-4-1-4-4z"/><path d="M18 10c0-3-2-5-4-5s-4 2-4 5 2 4 4 4 4-1 4-4z"/><path d="M4 16c0-4 3-5 6-5h4c3 0 6 1 6 5v2H4z"/><path d="M8 18v2"/><path d="M16 18v2"/></svg>`
      }
      return AGE_KEYS.map(key => ({
        value: key,
        label: translate('age', key),
        icon: ageIcons[key] || ''
      }))
    })

    const SIZE_KEYS = ['Маленькая', 'Средняя', 'Крупная']
    const sizeOptions = computed(() => {
      const sizeIcons = {
        'Маленькая': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">S</text></svg>`,
        'Средняя': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">M</text></svg>`,
        'Крупная': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="12" font-weight="100" fill="currentColor">L</text></svg>`
      }
      return SIZE_KEYS.map(key => ({
        value: key,
        label: translate('size', key),
        icon: sizeIcons[key] || ''
      }))
    })

    // ============================================================
    //  3.3. СОСТОЯНИЕ
    // ============================================================
    const allPets = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    const filters = reactive({
      gender: { 'Девочка': true, 'Мальчик': true },
      age: { 'Детеныш': true, 'Молодая': true, 'Взрослая': true },
      size: { 'Маленькая': true, 'Средняя': true, 'Крупная': true }
    })

    // ============================================================
    //  3.3. ВЫЧИСЛЯЕМЫЕ
    // ============================================================

    const filteredPets = computed(() => {
      return allPets.value.filter(pet => {
        if (!filters.gender[pet.gender]) return false
        if (!filters.age[pet.age]) return false
        if (!filters.size[pet.size]) return false
        return true
      })
    })

    const areAllActive = computed(() => {
      return (
        filters.gender['Девочка'] && filters.gender['Мальчик'] &&
        filters.age['Детеныш'] && filters.age['Молодая'] && filters.age['Взрослая'] &&
        filters.size['Маленькая'] && filters.size['Средняя'] && filters.size['Крупная']
      )
    })

    // ============================================================
    //  3.5. ПАГИНАЦИЯ
    // ============================================================

    const {
      paginatedItems: paginatedPets,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,
      resetPagination,
      visibleCount,
    } = usePagination(filteredPets, {
      perPage: 8,
    })

    const carouselTotalSlides = computed(() => {
      return paginatedPets.value.length + (hasMoreItems.value ? 1 : 0)
    })

    // ============================================================
    //  3.6. СКРОЛЛ И КАРУСЕЛЬ
    // ============================================================

    const carouselRef = ref(null)
    const {
      isMobile,
      currentIndex,
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
    } = useScrollCarusel({
      containerRef: carouselRef,
      items: paginatedPets,
      hasMoreItems: hasMoreItems,
    })

    // ============================================================
    //  3.7. РАНДОМНЫЕ ЦВЕТА
    // ============================================================

    const { useRandomClass } = useRandomColor()

    // ============================================================
    //  3.8. МЕТОДЫ
    // ============================================================

    const toggleFilter = (group, value) => {
      filters[group][value] = !filters[group][value]
      resetPagination()
      resetToFirstSlide()
    }

    const resetFilters = () => {
      Object.keys(filters.gender).forEach(k => filters.gender[k] = true)
      Object.keys(filters.age).forEach(k => filters.age[k] = true)
      Object.keys(filters.size).forEach(k => filters.size[k] = true)
      resetPagination()
      resetToFirstSlide()
    }

    // ============================================================
    //  3.9. RESIZE
    // ============================================================
    let resizeTimeout = null

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        resizeTimeout = null
      }, 100)
    }

    // ============================================================
    //  3.10. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
      isClient.value = true

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }

      try {
        let modules
        switch (lang.value) {
          case 'en':
            modules = import.meta.glob('/en/pets/*/*.md')
            break
          case 'de':
            modules = import.meta.glob('/de/pets/*/*.md')
            break
          default:
            modules = import.meta.glob('/ru/pets/*/*.md')
        }
        const filteredModules = Object.entries(modules).filter(([path]) => {
          return path.includes(`/${lang.value}/pets/${props.type}/`) && !path.endsWith(`${props.type}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/pets/${props.type}/`, '').replace('.md', '')

            return {
              uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              gender: useTranslate('ru', 'gender', fm.gender),
              genderDisplay: useTranslate(lang.value, 'gender', fm.gender),
              age: useAgePetCategory(fm.age),
              ageDisplay: useAge(lang.value, fm.age),
              size: useTranslate('ru', 'size', fm.size),
              sizeDisplay: useTranslate(lang.value, 'size', fm.size),
              image: useUrlMedia(fm.image, props.type, uuid, 'image'),
              type: props.type,
            }
          })
        )
        allPets.value = loaded.reverse()
        resetPagination()
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }
    })

    // --- Watchers ---
    watch(
      [() => filters.gender, () => filters.age, () => filters.size],
      () => {
        resetPagination()
        resetToFirstSlide()
      },
      { deep: true }
    )

    watch(isMobile, (newVal) => {
      if (isClient.value && newVal && paginatedPets.value.length) {
        resetToFirstSlide()
      }
    })

    watch(
      () => paginatedPets.value,
      (newVal) => {
        if (isClient.value && isMobile.value && newVal.length) {
          const maxIndex = carouselTotalSlides.value - 1
          if (currentIndex.value > maxIndex) {
            resetToFirstSlide()
          }
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
    //  3.11. ВОЗВРАТ
    // ============================================================
    return {
      // Опции фильтров
      genderOptions,
      ageOptions,
      sizeOptions,

      // Данные
      paginatedPets,
      filteredPets,

      // Фильтры
      filters,
      areAllActive,
      toggleFilter,
      resetFilters,

      // Пагинация
      visibleCount,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,

      // Язык
      lang,
      translate,

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
      useRandomClass,
    }
  }
}
</script>