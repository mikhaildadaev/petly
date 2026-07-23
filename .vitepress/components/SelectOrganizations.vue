<template>
  <div v-if="selectOrganizations && selectOrganizations.length > 0" class="cards-carousel">
    <div v-if="!isMobile" class="cards-grid">
      <a v-for="organization in selectOrganizations" :key="organization.uuid" :href="`${baseUrl}${lang}/organizations/${type}/${organization.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
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
    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>      
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(organization, index) in selectOrganizations" :key="organization.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}${lang}/organizations/${type}/${organization.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
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
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= (selectOrganizations ? selectOrganizations.length - 1 : 0)"></button>
      </div>
    </div>
  </div>
  <div v-else-if="selectOrganizations && selectOrganizations.length === 0" class="no-results">
    <p>{{ translate('ui', 'Нет назначенных организаций') }}</p>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useData } from 'vitepress'
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
  name: 'SelectOrganizations',

  props: {
    uuids: {
      type: Array,
      default: () => [],
    },
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
    const { lang } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)

    // ============================================================
    //  3.2. СОСТОЯНИЕ
    // ============================================================
    const allOrganizations = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    // ============================================================
    //  3.3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const selectOrganizations = computed(() => {
      if (isLoading.value) return []
      if (!allOrganizations.value || allOrganizations.value.length === 0) return []
      if (!props.uuids || props.uuids.length === 0) return []

      return allOrganizations.value.filter(v =>
        v.uuid && props.uuids.includes(v.uuid)
      )
    })

    // ============================================================
    //  3.3. ПОДКЛЮЧЕНИЕ КОМПОЗАБЛОВ
    // ============================================================

    // --- Рандомные цвета ---
    const { useRandomClass } = useRandomColor()

    // --- Дополнительный слайд ---
    const hasMoreItems = computed(() => false)

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
      items: selectOrganizations,
      hasMoreItems: hasMoreItems,
    })

    // ============================================================
    //  3.4. ВЫЧИСЛЕНИЯ
    // ============================================================

    const carouselTotalSlides = computed(() => {
      return selectOrganizations.value.length + (hasMoreItems.value ? 1 : 0)
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

    const loadSelectOrganizations = async () => {
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
          formatDisplay: organization.format ? translate('format', organization.format) : '',
          imageVertical: useUrlMedia(organization.imageVertical, 'image'),
          type: props.type,
        }))
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        allOrganizations.value = []
      } finally {
        isLoading.value = false
      }
    }

    // ============================================================
    //  3.6. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
      isClient.value = true
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      await loadSelectOrganizations()
    })

    // --- Watchers ---
    watch(lang, async () => {
      await loadSelectOrganizations()
      resetToFirstSlide()
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
    //  3.7. ВОЗВРАТ
    // ============================================================
    return {
      // Данные
      selectOrganizations,
      
      // Язык
      lang,
      translate,
      
      // Состояние
      isLoading,
      isMobile,
      
      // Карусель
      carouselRef,
      currentIndex,
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
      type: props.type,
      useRandomClass,
      baseUrl,
    }
  },
}
</script>