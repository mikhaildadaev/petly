<template>
  <div v-if="paginatedHumans && paginatedHumans.length > 0" class="cards-carousel">
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>      
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(human, index) in paginatedHumans" :key="human.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="getHumanLink(human)" target="_blank" rel="noopener noreferrer" class="aspect-list card">
              <div class="meta">
                <label v-if="human.directionDisplay" class="tag direction-tag">{{ human.directionDisplay }}</label>
                <label v-if="human.experienceDisplay" class="tag experience-tag">{{ human.experienceDisplay }}</label>
              </div>
              <img :src="human.imageVertical" loading="lazy" />
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
                  <div class="bar" :style="{ width: `${(visibleCount / groupHumans.length) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1"></button>
      </div>
    </div>
  </div>
  <div v-else-if="!isLoading && (!groupHumans || groupHumans.length === 0)" class="no-results">
    <p>{{ translate('ui', 'Нет результатов') }}</p>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useData } from 'vitepress'
import { useRandomColor } from '../utils/useRandomColor'
import { useScrollCarusel } from '../utils/useScrollCarusel'
import { usePagination } from '../utils/usePagination'
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
  name: 'GroupHumans',
  props: {
    uuids: {
      type: String,
      required: true,
      default: ''
    },
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
    const { lang } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)

    // ============================================================
    //  3.2. СОСТОЯНИЕ
    // ============================================================
    const allHumans = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    // ============================================================
    //  3.3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const groupHumans = computed(() => {
      if (isLoading.value) return []
      if (!allHumans.value || allHumans.value.length === 0) return []
      if (!props.uuids) return []

      const filtered = allHumans.value.filter(human =>
        human.shelters && human.shelters.includes(props.uuids)
      )
      
      return filtered.reverse()
    })

    // ============================================================
    //  3.4. ПАГИНАЦИЯ
    // ============================================================

    const {
      paginatedItems: paginatedHumans,
      remaining,
      hasMoreItems,
      loadMore: originalLoadMore,
      isLoadingMore,
      resetPagination,
      visibleCount,
    } = usePagination(groupHumans, {
      perPage: 8,
    })

    const loadMore = async () => {
      const currentPosition = currentIndex.value
      await originalLoadMore()
      await nextTick()
      if (paginatedPets.value.length > 0) {
        goToSlide(currentPosition)
      }
    }

    // ============================================================
    //  3.5. ПОДКЛЮЧЕНИЕ КОМПОЗАБЛОВ
    // ============================================================

    const { useRandomClass } = useRandomColor()

    const hasMoreItemsForCarousel = computed(() => hasMoreItems.value)

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
      hasMoreItems: hasMoreItemsForCarousel,
    })

    // ============================================================
    //  3.6. ВЫЧИСЛЕНИЯ ДЛЯ КАРУСЕЛИ
    // ============================================================

    const getHumanLink = (human) => {
      return human.covenantID ? `${baseUrl}${lang.value}/humans/${human.covenantID}/${props.type}/${human.uuid}` : `${baseUrl}${lang.value}/humans/${props.type}/${human.uuid}`
    }

    const carouselTotalSlides = computed(() => {
      return paginatedHumans.value.length + (hasMoreItems.value ? 1 : 0)
    })

    const isFirstSlide = computed(() => {
      return currentIndex.value === 0
    })

    const isLastSlide = computed(() => {
      return currentIndex.value >= carouselTotalSlides.value - 1
    })

    // ============================================================
    //  3.7. RESIZE
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
    //  3.8. ЗАГРУЗКА ДАННЫХ
    // ============================================================

    const loadGroupHumans = async () => {
      try {
        isLoading.value = true
        const response = await fetch(`${baseUrl}data/humans-${lang.value}-${props.type}.json`)
        if (response.status === 404) {
          allHumans.value = []
          isLoading.value = false
          return
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const humansData = await response.json()
        allHumans.value = humansData.map(human => ({
          uuid: human.uuid,
          nameDisplay: human.title || '',
          descriptionDisplay: human.description || '',
          directionDisplay: useDirection(lang.value, human.direction),
          experienceDisplay: useExperience(lang.value, human.experience),
          covenantID: human.covenantID || '',
          imageHorizontal: useUrlMedia(pet.imageHorizontal, 'image'),
          imageVertical: useUrlMedia(human.imageVertical, 'image'),
          shelters: human.shelters || [],
          type: props.type,
        }))
        resetPagination()
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        allHumans.value = []
      } finally {
        isLoading.value = false
      }
    }

    // ============================================================
    //  3.9. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
      isClient.value = true
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      await loadGroupHumans()
    })

    watch(lang, async () => {
      await loadGroupHumans()
      resetToFirstSlide()
    })

    // 🔥 Сброс пагинации при изменении фильтрации
    watch(groupHumans, () => {
      resetPagination()
    }, { deep: true })

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
      }
    })

    // ============================================================
    //  3.10. ВОЗВРАТ
    // ============================================================
    return {
      // Данные
      groupHumans,
      paginatedHumans,
      
      // Язык
      lang,
      translate,
      
      // Состояние
      isLoading,
      isMobile,
      
      // Пагинация
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
      getHumanLink,
    }
  },
}
</script>