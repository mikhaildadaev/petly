<template>
  <div v-if="randomPets.length > 0" class="cards-carousel">
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(pet, index) in randomPets" :key="pet.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}${lang}/pets/${pet.type}/${pet.uuid}`" class="aspect-list card">
              <div class="meta">
                <label v-if="pet.genderDisplay" class="tag gender-tag" :data-gender="pet.gender">{{ pet.genderDisplay }}</label>
                <label v-if="pet.ageDisplay" class="tag age-tag">{{ pet.ageDisplay }}</label>
                <label v-if="pet.sizeDisplay" class="tag size-tag">{{ pet.sizeDisplay }}</label>
              </div>
              <img :src="pet.imageVertical" loading="lazy" />
              <div :class="['content', useRandomClass(pet.uuid)]">
                <h1 class="title">{{ pet.nameDisplay }}</h1>
                <p class="description">{{ pet.descriptionDisplay }}</p>
              </div>
            </a>
          </div>
          <div class="carousel-slide load-more-slide" :class="{ center: currentIndex === randomPets.length }">
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
  <div v-else-if="randomPets && randomPets.length === 0" class="no-results">
    <p>{{ translate('ui', 'Нет результатов') }}</p>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRandomArray } from '../utils/useRandomArray'
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
  name: 'RandomPets',

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
    const lang = inject('lang', 'ru')
    const translate = (category, key) => useTranslate(lang.value, category, key)

    // ============================================================
    //  3.2. СОСТОЯНИЕ
    // ============================================================
    const randomPets = ref([])
    const isLoading = ref(true)

    // ============================================================
    //  3.3. ПОДКЛЮЧЕНИЕ КОМПОЗАБЛОВ
    // ============================================================

    // --- Рандомные цвета ---
    const { useRandomClass } = useRandomColor()

    // --- Дополнительный слайд "Перейти в раздел" ---
    const hasMoreItems = computed(() => randomPets.value.length > 0)

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
      items: randomPets,
      hasMoreItems: hasMoreItems,
    })

    // ============================================================
    //  3.4. ВЫЧИСЛЯЕМЫЕ
    // ============================================================

    const carouselTotalSlides = computed(() => {
      return randomPets.value.length + (hasMoreItems.value ? 1 : 0)
    })

    const isFirstSlide = computed(() => {
      return currentIndex.value === 0
    })

    const isLastSlide = computed(() => {
      return currentIndex.value >= carouselTotalSlides.value - 1
    })

    const linkUrl = computed(() => {
      const langPath = lang.value || 'ru'
      return `${baseUrl}${langPath}/pets/${props.type}`
    })

    // ============================================================
    //  3.5. МЕТОДЫ
    // ============================================================

    // --- Переход на страницу всех питомцев ---
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

    const loadRandomPets = async () => {
      try {
        isLoading.value = true
        const response = await fetch(`${baseUrl}data/pets-${lang.value}-${props.type}.json`)
        if (response.status === 404) {
          randomPets.value = []
          isLoading.value = false
          return
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const petsData = await response.json()
        loaded = petsData.map(pet => ({
          uuid: pet.uuid,
          nameDisplay: pet.title || '',
          descriptionDisplay: pet.description || '',
          gender: useTranslate('ru', 'gender', pet.gender),
          genderDisplay: useTranslate(lang.value, 'gender', pet.gender),
          age: useAgePetCategory(pet.age),
          ageDisplay: useAge(lang.value, pet.age),
          sizeDisplay: useTranslate(lang.value, 'size', pet.size),
          imageVertical: useUrlMedia(pet.imageVertical, 'image'),
          type: props.type,
        }))
        const shuffled = useRandomArray(loaded)
        randomPets.value = shuffled.slice(0, props.count)
        currentIndex.value = 0
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        randomPets.value = []
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
      await loadRandomPets()
    })

    // --- Watchers ---
    watch(lang, async () => {
      await loadRandomPets()
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
      randomPets,
      
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