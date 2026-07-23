<template>
  <div v-if="selectPets && selectPets.length > 0" class="cards-carousel">
    <div v-if="!isMobile" class="cards-grid">
      <a v-for="pet in selectPets" :key="pet.uuid" :href="`${baseUrl}${lang}/pets/${type}/${pet.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
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
    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>      
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(pet, index) in selectPets" :key="pet.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}${lang}/pets/${type}/${pet.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list card">
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
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= (selectPets ? selectPets.length - 1 : 0)"></button>
      </div>
    </div>
  </div>
  <div v-else-if="selectPets && selectPets.length === 0" class="no-results">
    <p>{{ translate('ui', 'Нет выбранных любимцев') }}</p>
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
  name: 'SelectPets',

  props: {
    uuids: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      required: true,
      default: 'pets'
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
    const allPets = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    // ============================================================
    //  3.3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const selectPets = computed(() => {
      if (isLoading.value) return []
      if (!allPets.value || allPets.value.length === 0) return []
      if (!props.uuids || props.uuids.length === 0) return []

      return allPets.value.filter(v =>
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
      items: selectPets,
      hasMoreItems: hasMoreItems,
    })

    // ============================================================
    //  3.4. ВЫЧИСЛЕНИЯ
    // ============================================================

    const carouselTotalSlides = computed(() => {
      return selectPets.value.length + (hasMoreItems.value ? 1 : 0)
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

    const loadSelectPets = async () => {
      try {
        isLoading.value = true
        const response = await fetch(`${baseUrl}data/pets-${lang.value}-${props.type}.json`)
        if (response.status === 404) {
          allPets.value = []
          isLoading.value = false
          return
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const petsData = await response.json()
        allPets.value = petsData.map(pet => ({
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
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        allPets.value = []
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
      await loadSelectPets()
    })

    // --- Watchers ---
    watch(lang, async () => {
      await loadSelectPets()
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
      selectPets,
      
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