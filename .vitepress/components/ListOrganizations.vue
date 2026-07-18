<template>
  <div class="filters-compact hide-scrollbar">
    <div class="filter-group">
      <div class="filter-chips">
        <button v-for="option in formatOptions" :key="option.value" class="chip" :class="{ active: filters.format[option.value] }" @click="toggleFilter('format', option.value)" :title="option.label" v-html="option.icon"/>
      </div>
      <span class="filter-label">{{ translate('filter', 'Формат') }}</span>
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
    <a v-for="organization in paginatedOrganizations" :key="organization.uuid" :href="`${baseUrl}${lang}/organizations/${organizationType}/${organization.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
      <div class="grid-meta">
        <span v-if="organization.formatDisplay" class="tag format-tag">{{ organization.formatDisplay }}</span>
      </div>
      <img :src="organization.image" loading="lazy" />
      <div :class="['grid-card-body', useRandomClass(organization.uuid)]">
        <div class="name">{{ organization.nameDisplay }}</div>
        <p>{{ organization.descriptionDisplay }}</p>
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
          <div class="progress-bar" :style="{ width: `${(visibleCount / filteredOrganizations.length) * 100}%` }"></div>
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
        <div v-for="(organization, index) in paginatedOrganizations" :key="organization.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
          <a :href="`${baseUrl}${lang}/organizations/${organizationType}/${organization.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
            <div class="grid-meta">
              <span v-if="organization.formatDisplay" class="tag format-tag">{{ organization.formatDisplay }}</span>
            </div>
            <img :src="organization.image" loading="lazy" />
            <div :class="['grid-card-body', useRandomClass(organization.uuid)]">
              <div class="name">{{ organization.nameDisplay }}</div>
              <p>{{ organization.descriptionDisplay }}</p>
            </div>
          </a>
        </div>
        <div v-if="hasMoreItems" class="carousel-slide load-more-slide" :class="{ center: currentIndex === paginatedOrganizations.length }">
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
                <div class="progress-bar" :style="{ width: `${(visibleCount / filteredOrganizations.length) * 100}%` }"></div>
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
  <div v-if="filteredOrganizations.length === 0 && !isLoading" class="no-results">
    <p>{{ translate('ui', 'Нет результатов') }}</p>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, watch, nextTick, onUnmounted, reactive, inject } from 'vue'
import { usePagination } from '../composables/usePagination'
import { useRandomColor } from '../composables/useRandomColor'
import { useScroll } from '../composables/useScroll'
import { useTranslate } from '../composables/useTranslate'

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
    organizationType: {
      type: String,
      required: true,
      default: 'shelters'
    }
  },

  setup(props) {
    // ============================================================
    //  4.1. ЯЗЫК И ПЕРЕВОДЫ
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => useTranslate(lang.value, category, key)

    // ============================================================
    //  4.2. ОПЦИИ ФИЛЬТРОВ
    // ============================================================
    const FORMAT_KEYS = ['Частный', 'Государственный']
    const formatOptions = computed(() => {
      const formatIcons = {
        'Государственный': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
        'Частный': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1"/></svg>`
      }
      return FORMAT_KEYS.map(key => ({
        value: key,
        label: translate('format', key), 
        icon: formatIcons[key] || ''
      }))
    })

    // ============================================================
    //  4.3. СОСТОЯНИЕ
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
    //  4.4. ВЫЧИСЛЯЕМЫЕ
    // ============================================================

    const filteredOrganizations = computed(() => {
      return allOrganizations.value.filter(org => {
        if (!filters.format[org.format]) return false
        return true
      })
    })

    const areAllActive = computed(() => {
      return filters.format['Частный'] && filters.format['Государственный']
    })

    // ============================================================
    //  4.5. ПАГИНАЦИЯ
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

    // ============================================================
    //  4.6. СКРОЛЛ И КАРУСЕЛЬ
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
    } = useScroll({
      containerRef: carouselRef,
      items: paginatedOrganizations,
      hasMoreItems: hasMoreItems,
    })

    // ============================================================
    //  4.7. РАНДОМНЫЕ ЦВЕТА
    // ============================================================

    const { useRandomClass } = useRandomColor()

    // ============================================================
    //  4.8. МЕТОДЫ (ФИЛЬТРЫ)
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
    //  4.9. ОБРАБОТЧИК ИЗОБРАЖЕНИЙ
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

    // ============================================================
    //  4.10. RESIZE
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
    //  4.11. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    // --- Загрузка данных ---
    const loadData = async () => {
      try {
        let modules
        switch (lang.value) {
          case 'en':
            modules = import.meta.glob('/en/organizations/*/*.md')
            break
          case 'de':
            modules = import.meta.glob('/de/organizations/*/*.md')
            break
          default:
            modules = import.meta.glob('/ru/organizations/*/*.md')
        }
        const filteredModules = Object.entries(modules).filter(([path]) => {
          return path.includes(`/${lang.value}/organizations/${props.organizationType}/`) && !path.endsWith(`${props.organizationType}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/organizations/${props.organizationType}/`, '').replace('.md', '')

            return {
              uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              format: fm.format || '',
              formatDisplay: fm.format ? translate('format', fm.format) : '',
              image: processImage(fm.image, props.organizationType, uuid),
            }
          })
        )
        allOrganizations.value = loaded.reverse()
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      }
    }

    // --- Монтирование ---
    onMounted(async () => {
      isClient.value = true

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }

      isLoading.value = true
      await loadData()
      resetPagination()
      isLoading.value = false
    })

    // --- Следим за изменением языка ---
    watch(lang, async () => {
      isLoading.value = true
      await loadData()
      resetPagination()
      resetToFirstSlide()
      isLoading.value = false
    })

    // --- Watchers ---
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
    //  4.12. ВОЗВРАТ
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

      // Свайп
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,

      // Прочее
      organizationType: props.organizationType,
      useRandomClass,
    }
  },
}
</script>