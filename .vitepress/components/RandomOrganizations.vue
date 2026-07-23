<template>
  <div v-if="randomOrganizations.length > 0" class="cards-carousel">
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(organization, index) in randomOrganizations" :key="organization.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}${lang}/organizations/${organization.type}/${organization.uuid}`" class="aspect-list card">
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
          <div class="carousel-slide load-more-slide" :class="{ center: currentIndex === randomOrganizations.length }">
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
  <div v-else-if="randomOrganizations && randomOrganizations.length === 0" class="no-results">
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
  name: 'RandomOrganizations',

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
    const randomOrganizations = ref([])
    const isLoading = ref(true)

    // ============================================================
    //  3.3. ПОДКЛЮЧЕНИЕ КОМПОЗАБЛОВ
    // ============================================================

    // --- Рандомные цвета ---
    const { useRandomClass } = useRandomColor()

    // --- Дополнительный слайд "Перейти в раздел" ---
    const hasMoreItems = computed(() => randomOrganizations.value.length > 0)

    // --- Скролл и карусель ---
    const carouselRef = ref(null)
    const {
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    } = useScrollCarusel({
      containerRef: carouselRef,
      items: randomOrganizations,
      hasMoreItems: hasMoreItems,
    })

    // ============================================================
    //  3.4. ВЫЧИСЛЯЕМЫЕ
    // ============================================================

    const carouselTotalSlides = computed(() => {
      return randomOrganizations.value.length + (hasMoreItems.value ? 1 : 0)
    })

    const isFirstSlide = computed(() => {
      return currentIndex.value === 0
    })

    const isLastSlide = computed(() => {
      return currentIndex.value >= carouselTotalSlides.value - 1
    })

    const linkUrl = computed(() => {
      const langPath = lang.value || 'ru'
      return `${baseUrl}${langPath}/organizations/${props.type}`
    })

    // ============================================================
    //  3.5. МЕТОДЫ
    // ============================================================

    // --- Переход на страницу всех организаций ---
    const goToLink = () => {
      window.location.href = linkUrl.value
    }

    // ============================================================
    //  3.6. RESIZE
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

    const loadRandomOrganizations = async () => {
      try {
        isLoading.value = true
        const response = await fetch(`${baseUrl}data/organizations-${lang.value}-${props.type}.json`)
        if (response.status === 404) {
          randomOrganizations.value = []
          isLoading.value = false
          return
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const organizationsData = await response.json()
        const loaded = organizationsData.map(organization => ({
          uuid: organization.uuid,
          nameDisplay: organization.title || '',
          descriptionDisplay: organization.description || '',
          formatDisplay: organization.format ? translate('format', organization.format) : '',
          imageVertical: useUrlMedia(organization.imageVertical, 'image'),
          type: props.type,
        }))
        const shuffled = useRandomArray(loaded)
        randomOrganizations.value = shuffled.slice(0, props.count)
        currentIndex.value = 0
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        randomOrganizations.value = []
      } finally {
        isLoading.value = false
      }
    }

    // ============================================================
    //  3.7. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      await loadRandomOrganizations()
    })

    // --- Watchers ---
    watch(lang, async () => {
      await loadRandomOrganizations()
    })

    // --- Unmount ---
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
      randomOrganizations,
      
      // Язык
      lang,
      translate,

      // Состояние
      isLoading,
      
      // Карусель
      carouselRef,
      currentIndex,
      carouselTotalSlides,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      isFirstSlide,
      isLastSlide,
      
      // Свайп
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      
      // Прочее
      baseUrl,
      linkUrl,
      goToLink,
      useRandomClass,
    }
  },
}
</script>