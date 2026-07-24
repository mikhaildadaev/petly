<template>
  <div v-if="paginatedPets && paginatedPets.length > 0" class="cards-carousel">
    <div class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel prev" :class="{ none: isFirstSlide }" @click="prevSlide" :disabled="currentIndex === 0"></button>      
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(pet, index) in paginatedPets" :key="pet.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="getPetLink(pet)" target="_blank" rel="noopener noreferrer" class="aspect-list card">
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
          <div v-if="hasMoreItems" class="carousel-slide load-more-slide" :class="{ center: currentIndex === paginatedPets.length }">
            <div class="load-more" @click="loadMore">
              <div class="content">
                <div class="icon"></div>
                <div class="text">{{ translate('ui', 'Загрузить ещё') }}</div>
                <div class="count">{{ remaining }} {{ translate('ui', 'осталось') }}</div>
                <div class="progress">
                  <div class="bar" :style="{ width: `${(visibleCount / groupPets.length) * 100}%` }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="carousel next" :class="{ none: isLastSlide }" @click="nextSlide" :disabled="currentIndex >= carouselTotalSlides - 1"></button>
      </div>
    </div>
  </div>
  <div v-else-if="!isLoading && (!groupPets || groupPets.length === 0)" class="no-results">
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
  name: 'GroupPets',
  props: {
    uuids: {
      type: String,
      required: true,
      default: ''
    },
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

    // Фильтруем питомцев по приюту
    const groupPets = computed(() => {
      if (isLoading.value) return []
      if (!allPets.value || allPets.value.length === 0) return []
      if (!props.uuids) return []

      const filtered = allPets.value.filter(pet =>
        pet.shelters && pet.shelters.includes(props.uuids)
      )
      
      return filtered.reverse()
    })

    // ============================================================
    //  3.4. ПАГИНАЦИЯ
    // ============================================================

    const {
      paginatedItems: paginatedPets,
      remaining,
      hasMoreItems,
      loadMore,
      isLoadingMore,
      resetPagination,
      visibleCount,
    } = usePagination(groupPets, {
      perPage: 8,
    })

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
      items: paginatedPets,
      hasMoreItems: hasMoreItemsForCarousel,
    })

    // ============================================================
    //  3.6. ВЫЧИСЛЕНИЯ ДЛЯ КАРУСЕЛИ
    // ============================================================

    const getPetLink = (pet) => {
      return pet.covenantID ? `${baseUrl}${lang.value}/pets/${pet.covenantID}/${props.type}/${pet.uuid}` : `${baseUrl}${lang.value}/pets/${props.type}/${pet.uuid}`
    }

    const carouselTotalSlides = computed(() => {
      return paginatedPets.value.length + (hasMoreItems.value ? 1 : 0)
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

    const loadGroupPets = async () => {
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
          covenantID: pet.covenantID || '',
          imageHorizontal: useUrlMedia(pet.imageHorizontal, 'image'),
          imageVertical: useUrlMedia(pet.imageVertical, 'image'),
          shelters: pet.shelters || [],
          volunteers: pet.volunteers || [],
          type: props.type,
        }))
        resetPagination()
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
        allPets.value = []
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
      await loadGroupPets()
    })

    watch(lang, async () => {
      await loadGroupPets()
      resetToFirstSlide()
    })

    watch(groupPets, () => {
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
      groupPets,
      paginatedPets,
      
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
      getPetLink,
    }
  },
}
</script>