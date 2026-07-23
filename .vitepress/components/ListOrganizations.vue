<template>
  <div class="filters-compact hide-scrollbar">
    <div class="filter-group">
      <div class="filter-chips">
        <button v-for="option in formatOptions" :key="option.value" class="chip" :class="[{ active: filters.format[option.value] }, option.icon]" @click="toggleFilter('format', option.value)" :title="option.label"/>
      </div>
      <label class="filter-label">{{ translate('filter', 'Формат') }}</label>
    </div>
    <button v-if="!areAllActive" class="reset" @click="resetFilters" :title="translate('ui', 'Включить все фильтры')">{{ translate('filter', 'Сбросить') }}</button>
  </div>
  <div v-if="!isMobile" class="cards-grid">
    <a v-for="organization in paginatedOrganizations" :key="organization.uuid" :href="`${baseUrl}${lang}/organizations/${organization.type}/${organization.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
      <div class="meta">
        <label v-if="organization.formatDisplay" class="tag format-tag">{{ organization.formatDisplay }}</label>
      </div>
      <img :src="organization.imageVertical" loading="lazy" />
      <div :class="['content', useRandomClass(organization.uuid)]">
        <h1 class="title">{{ organization.nameDisplay }}</h1>
        <p class="description">{{ organization.descriptionDisplay }}</p>
      </div>
    </a>
    <div v-if="hasMoreItems" class="load-more" @click="loadMore">
      <div class="content">
        <div class="icon"></div>
        <div class="text">{{ translate('ui', 'Загрузить ещё') }}</div>
        <div class="count">{{ remaining }} {{ translate('ui', 'осталось') }}</div>
        <div class="progress">
          <div class="bar" :style="{ width: `${(visibleCount / filteredOrganizations.length) * 100}%` }"></div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="cards-carousel">
    <div class="carousel-wrapper">
      <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>      
      <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <div v-for="(organization, index) in paginatedOrganizations" :key="organization.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
          <a :href="`${baseUrl}${lang}/organizations/${organization.type}/${organization.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
            <div class="meta">
              <label v-if="organization.formatDisplay" class="tag format-tag">{{ organization.formatDisplay }}</label>
            </div>
            <img :src="organization.imageVertical" loading="lazy" />
            <div :class="['content', useRandomClass(organization.uuid)]">
              <h1 class="title">{{ organization.nameDisplay }}</h1>
              <p class="description">{{ organization.descriptionDisplay }}</p>
            </div>
          </a>
        </div>
        <div v-if="hasMoreItems" class="carousel-slide load-more-slide" :class="{ center: currentIndex === paginatedOrganizations.length }">
          <div class="load-more" @click="loadMore">
            <div class="content">
              <div class="icon"></div>
              <div class="text">{{ translate('ui', 'Загрузить ещё') }}</div>
              <div class="count">{{ remaining }} {{ translate('ui', 'осталось') }}</div>
              <div class="progress">
                <div class="bar" :style="{ width: `${(visibleCount / filteredOrganizations.length) * 100}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div> 
      <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1"></button>
    </div>
  </div>
  <div v-if="filteredOrganizations.length === 0 && !isLoading" class="no-results">
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
import { useTranslate } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

// ============================================================
//  3. КОМПОНЕНТ
// ============================================================
export default {
  name: 'ListOrganizations',

  props: {
    type: {
      type: String,
      required: true,
      default: 'shelters'
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
    const FORMAT_KEYS = ['Частный', 'Государственный']
    const formatOptions = computed(() => {
      const formatIcons = {
        'Государственный': `state`,
        'Частный': `private`
      }
      return FORMAT_KEYS.map(key => ({
        value: key,
        label: translate('format', key), 
        icon: formatIcons[key] || ''
      }))
    })

    // ============================================================
    //  3.3. СОСТОЯНИЕ
    // ============================================================
    const allOrganizations = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    const filters = reactive({
      format: {
        'Частный': true,
        'Государственный': true
      }
    })

    // ============================================================
    //  3.3. ВЫЧИСЛЯЕМЫЕ
    // ============================================================

    const filteredOrganizations = computed(() => {
      return allOrganizations.value.filter(organization => {
        if (!filters.format[organization.format]) return false
        return true
      })
    })

    const areAllActive = computed(() => {
      return filters.format['Частный'] && filters.format['Государственный']
    })

    // ============================================================
    //  3.5. ПАГИНАЦИЯ
    // ============================================================

    const {
      paginatedItems: paginatedOrganizations,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,
      resetPagination,
      visibleCount,
    } = usePagination(filteredOrganizations, {
      perPage: 8,
    })

    const carouselTotalSlides = computed(() => {
      return paginatedOrganizations.value.length + (hasMoreItems.value ? 1 : 0)
    })

    const isFirstSlide = computed(() => {
      return currentIndex.value === 0
    })

    const isLastSlide = computed(() => {
      return currentIndex.value >= carouselTotalSlides.value - 1
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
      items: paginatedOrganizations,
      hasMoreItems: hasMoreItems,
    })

    // ============================================================
    //  3.7. РАНДОМНЫЕ ЦВЕТА
    // ============================================================

    const { useRandomClass } = useRandomColor()

    // ============================================================
    //  3.8. МЕТОДЫ (ФИЛЬТРЫ)
    // ============================================================

    const toggleFilter = (group, value) => {
      filters[group][value] = !filters[group][value]
      resetPagination()
      resetToFirstSlide()
    }

    const resetFilters = () => {
      Object.keys(filters.format).forEach(k => filters.format[k] = true)
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

    const loadOrganizations = async () => {
      try {
        isLoading.value = true
        const response = await fetch(`${baseUrl}data/organizations-${lang.value}-${props.type}.json`)
        if (response.status === 404) {
          allOrganizations.value = []
          isLoading.value = false
          return
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const organizationsData = await response.json()
        allOrganizations.value = organizationsData.map(organization => ({
          uuid: organization.uuid,
          nameDisplay: organization.title || '',
          descriptionDisplay: organization.description || '',
          format: organization.format || '',
          formatDisplay: organization.format ? translate('format', organization.format) : '',
          imageHorizontal: useUrlMedia(organization.imageHorizontal, 'image'),
          imageVertical: useUrlMedia(organization.imageVertical, 'image'),
          type: props.type,
        }))
        allOrganizations.value = allOrganizations.value.reverse()
        resetPagination()
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        allOrganizations.value = []
      } finally {
        isLoading.value = false
      }
    }

    // ============================================================
    //  3.10. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
      isClient.value = true
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      await loadOrganizations()
    })

    // --- Watchers ---
    watch(lang, async () => {
      await loadOrganizations()
      resetToFirstSlide()
    })
    watch(
      () => filters.format,
      () => {
        resetPagination()
        resetToFirstSlide()
      },
      { deep: true }
    )
    watch(isMobile, (newVal) => {
      if (isClient.value && newVal && paginatedOrganizations.value.length) {
        resetToFirstSlide()
      }
    })
    watch(
      () => paginatedOrganizations.value,
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
    //  3.12. ВОЗВРАТ
    // ============================================================
    return {
      // Опции фильтров
      formatOptions,

      // Данные
      paginatedOrganizations,
      filteredOrganizations,

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
      isFirstSlide,
      isLastSlide,

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
  },
}
</script>