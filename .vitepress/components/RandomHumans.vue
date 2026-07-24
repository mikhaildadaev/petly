<template>
  <div v-if="randomHumans.length > 0" class="cards-carousel">
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(human, index) in randomHumans" :key="human.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="getHumanLink(human)" class="aspect-list card">
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
          <div class="carousel-slide load-more-slide" :class="{ center: currentIndex === randomHumans.length }">
            <div class="load-more" @click="goToLink">
              <div class="content">
                <div class="icon"></div>
                <div class="text">{{ translate('ui', 'Перейти в раздел') }}</div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1"></button>
      </div>
    </div>
  </div>
  <div v-else-if="randomHumans && randomHumans.length === 0" class="no-results">
    <p>{{ translate('ui', 'Нет результатов') }}</p>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import { useRandomArray } from '../utils/useRandomArray'
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
  name: 'RandomHumans',

  props: {
    type: {
      type: String,
      default: 'all',
    },
    count: {
      type: Number,
      default: 8,
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
    const randomHumans = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    // ============================================================
    //  3.3. ПОДКЛЮЧЕНИЕ КОМПОЗАБЛОВ
    // ============================================================

    // --- Рандомные цвета ---
    const { useRandomClass } = useRandomColor()

    // --- Дополнительный слайд ---
    const hasMoreItems = computed(() => randomHumans.value.length > 0)

    // --- Скролл и карусель ---
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
      items: randomHumans,
      hasMoreItems: hasMoreItems,
    })

    // ============================================================
    //  3.4. ВЫЧИСЛЕНИЯ
    // ============================================================

    const goToLink = () => {
      window.location.href = `${baseUrl}${lang.value}/humans/${props.type}`
    }

    const getHumanLink = (human) => {
      return human.covenantID ? `${baseUrl}${lang.value}/humans/${human.covenantID}/${props.type}/${human.uuid}` : `${baseUrl}${lang.value}/humans/${props.type}/${human.uuid}`
    }

    const carouselTotalSlides = computed(() => {
      return randomHumans.value.length + (hasMoreItems.value ? 1 : 0)
    })

    const isFirstSlide = computed(() => {
      return currentIndex.value === 0
    })

    const isLastSlide = computed(() => {
      return currentIndex.value >= carouselTotalSlides.value - 1
    })

    // ============================================================
    //  3.5. RESIZE
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
    //  3.6. ЗАГРУЗКА ДАННЫХ
    // ============================================================

    const loadRandomHumans = async () => {
      try {
        isLoading.value = true
        const response = await fetch(`${baseUrl}data/humans-${lang.value}-${props.type}.json`)
        if (response.status === 404) {
          randomHumans.value = []
          isLoading.value = false
          return
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const humansData = await response.json()
        const loaded = humansData.map(human => ({
          uuid: human.uuid,
          nameDisplay: human.title || '',
          descriptionDisplay: human.description || '',
          directionDisplay: useDirection(lang.value, human.direction),
          experienceDisplay: useExperience(lang.value, human.experience),
          covenantID: human.covenantID || '',
          imageHorizontal: useUrlMedia(human.imageHorizontal, 'image'),
          imageVertical: useUrlMedia(human.imageVertical, 'image'),
          type: props.type,
        }))
        const shuffled = useRandomArray(loaded)
        randomHumans.value = shuffled.slice(0, props.count)
        currentIndex.value = 0
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        randomHumans.value = []
      } finally {
        isLoading.value = false
      }
    }

    // ============================================================
    //  3.7. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
      isClient.value = true
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      await loadRandomHumans()
    })

    watch(lang, async () => {
      await loadRandomHumans()
    })

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
      }
    })

    // ============================================================
    //  3.8. ВОЗВРАТ
    // ============================================================
    return {
      // Данные
      randomHumans,
      
      // Язык
      lang,
      translate,

      // Состояние
      isLoading,
      isMobile,
      
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
      goToLink,
    }
  },
}
</script>