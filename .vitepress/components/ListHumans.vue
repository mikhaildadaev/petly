<template>
  <div class="filters-compact hide-scrollbar">
      <div class="filter-group">
        <div class="filter-chips">
          <button v-for="option in experienceOptions" :key="option.value" class="chip" :class="[{ active: filters.experience[option.value] }, option.icon]" @click="toggleFilter('experience', option.value)" :title="option.label"/>
        </div>
        <label class="filter-label">{{ translate('filter', 'Опыт') }}</label>
      </div>
      <div class="filter-group">
        <div class="filter-chips">
          <button v-for="option in directionOptions" :key="option.value" class="chip" :class="[{ active: filters.direction[option.value] }, option.icon]" @click="toggleFilter('direction', option.value)" :title="option.label"/>
        </div>
        <label class="filter-label">{{ translate('filter', 'Направление') }}</label>
      </div>
      <button v-if="!areAllActive" class="reset" @click="resetFilters" :title="translate('ui', 'Включить все фильтры')">{{ translate('filter', 'Сбросить') }}</button>
    </div>
  <div v-if="!isMobile" class="cards-grid">
    <a v-for="human in paginatedHumans" :key="human.uuid" :href="`${baseUrl}${lang}/humans/${human.type}/${human.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
      <div class="meta">
        <label v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</label>
        <label v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</label>
      </div>
      <img :src="human.image" loading="lazy" />
      <div :class="['content', useRandomClass(human.uuid)]">
        <h1 class="title">{{ human.nameDisplay }}</h1>
        <p class="description">{{ human.descriptionDisplay }}</p>
      </div>
    </a>
    <div v-if="hasMoreItems" class="load-more" @click="loadMore">
      <div class="content">
        <div class="icon"></div>
        <div class="text">{{ translate('ui', 'Загрузить ещё') }}</div>
        <div class="count">{{ remaining }} {{ translate('ui', 'осталось') }}</div>
        <div class="progress">
          <div class="bar" :style="{ width: `${(visibleCount / filteredHumans.length) * 100}%` }"></div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="cards-carousel">
    <div class="carousel-wrapper">
      <button class="carousel prev" @click="prevSlide" :disabled="currentIndex === 0"></button>
      <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <div v-for="(human, index) in paginatedHumans" :key="human.uuid" class="carousel-slide" :class="{ center: index === currentIndex }" >
          <a :href="`${baseUrl}${lang}/humans/${human.type}/${human.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
            <div class="meta">
              <label v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</label>
              <label v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</label>
            </div>
            <img :src="human.image" loading="lazy" />
            <div :class="['content', useRandomClass(human.uuid)]">
              <h1 class="title">{{ human.nameDisplay }}</h1>
              <p class="description">{{ human.descriptionDisplay }}</p>
            </div>
          </a>
        </div>
        <div v-if="hasMoreItems" class="carousel-slide load-more-slide" :class="{ center: currentIndex === paginatedHumans.length }">
          <div class="load-more" @click="loadMore">
            <div class="content">
              <div class="icon"></div>
              <div class="text">{{ translate('ui', 'Загрузить ещё') }}</div>
              <div class="count">{{ remaining }} {{ translate('ui', 'осталось') }}</div>
              <div class="progress">
                <div class="bar" :style="{ width: `${(visibleCount / filteredHumans.length) * 100}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </div> 
      <button class="carousel next" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1"></button>
    </div>
  </div>
  <div v-if="filteredHumans.length === 0 && !isLoading" class="no-results">
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
import { useTranslate, useDirection, useExperience } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

// ============================================================
//  3. КОМПОНЕНТ
// ============================================================
export default {
  name: 'ListHumans',

  props: {
    type: {
      type: String,
      required: true,
      default: 'volunteers'
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
    const EXPERIENCE_KEYS = ['Начинающий', 'Опытный', 'Эксперт']
    const experienceOptions = computed(() => {
      const experienceIcons = {
        'Начинающий': `begin`,
        'Опытный': `versed`,
        'Эксперт': `expert`
      }
      return EXPERIENCE_KEYS.map(key => ({
        value: key,
        label: translate('experience', key),
        icon: experienceIcons[key] || ''
      }))
    })

    const DIRECTION_KEYS = ['Выгул', 'Социализация', 'Лечение', 'Передержка', 'Креатив', 'Фандрайзинг']
    const directionOptions = computed(() => {
      const directionIcons = {
        'Выгул': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
        'Социализация': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
        'Лечение': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9-4-18-3 9H2"/></svg>`,
        'Передержка': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1"/></svg>`,
        'Креатив': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M3.93 3.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M3.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
        'Фандрайзинг': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M8 8l4 4 4-4"/></svg>`
      }
      return DIRECTION_KEYS.map(key => ({
        value: key,
        label: translate('direction', key),
        icon: directionIcons[key] || ''
      }))
    })

    // ============================================================
    //  3.3. СОСТОЯНИЕ
    // ============================================================
    const allHumans = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    const filters = reactive({
      experience: {
        'Начинающий': true,
        'Опытный': true,
        'Эксперт': true
      },
      direction: {
        'Выгул': true,
        'Социализация': true,
        'Лечение': true,
        'Передержка': true,
        'Креатив': true,
        'Фандрайзинг': true
      }
    })

    // ============================================================
    //  3.3. ВЫЧИСЛЯЕМЫЕ
    // ============================================================

    const filteredHumans = computed(() => {
      return allHumans.value.filter(human => {
        if (!filters.experience[human.experience]) return false
        const directionStr = human.direction || ''
        const directions = directionStr.replace(/,/g, '/').split('/').map(d => d.trim())
        const hasActiveDirection = directions.some(d => filters.direction[d] === true)
        if (!hasActiveDirection) return false
        return true
      })
    })

    const areAllActive = computed(() => {
      return (
        filters.experience['Начинающий'] && filters.experience['Опытный'] && filters.experience['Эксперт'] &&
        filters.direction['Выгул'] && filters.direction['Социализация'] && filters.direction['Лечение'] &&
        filters.direction['Передержка'] && filters.direction['Креатив'] && filters.direction['Фандрайзинг']
      )
    })

    // ============================================================
    //  3.5. ПАГИНАЦИЯ
    // ============================================================

    const {
      paginatedItems: paginatedHumans,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,
      resetPagination,
      visibleCount,
    } = usePagination(filteredHumans, {
      perPage: 8,
    })

    const carouselTotalSlides = computed(() => {
      return paginatedHumans.value.length + (hasMoreItems.value ? 1 : 0)
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
      items: paginatedHumans,
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
      Object.keys(filters.experience).forEach(k => filters.experience[k] = true)
      Object.keys(filters.direction).forEach(k => filters.direction[k] = true)
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

    // --- Загрузка данных ---
    const loadData = async () => {
      try {
        let modules
        switch (lang.value) {
          case 'en':
            modules = import.meta.glob('/en/humans/*/*.md')
            break
          case 'de':
            modules = import.meta.glob('/de/humans/*/*.md')
            break
          default:
            modules = import.meta.glob('/ru/humans/*/*.md')
        }
        const filteredModules = Object.entries(modules).filter(([path]) => {
          return path.includes(`/${lang.value}/humans/${props.type}/`) && !path.endsWith(`${props.type}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/humans/${props.type}/`, '').replace('.md', '')

            return {
              uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              experience: useExperience('ru', fm.experience),
              experienceDisplay: useExperience(lang.value, fm.experience),
              direction: useDirection('ru', fm.direction),
              directionDisplay: useDirection(lang.value, fm.direction),
              image: useUrlMedia(fm.image, 'image'),
              type: props.type,
            }
          })
        )
        allHumans.value = loaded.reverse()
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
      [() => filters.experience, () => filters.direction],
      () => {
        resetPagination()
        resetToFirstSlide()
      },
      { deep: true }
    )

    watch(isMobile, (newVal) => {
      if (isClient.value && newVal && paginatedHumans.value.length) {
        resetToFirstSlide()
      }
    })

    watch(
      () => paginatedHumans.value,
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
      experienceOptions,
      directionOptions,

      // Данные
      paginatedHumans,
      filteredHumans,

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
  },
}
</script>