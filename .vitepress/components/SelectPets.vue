<template>
  <div v-if="selectPets && selectPets.length > 0" class="grid-list">
    <div v-if="!isMobile" class="grid-cards">
      <a v-for="pet in selectPets" :key="pet.uuid" :href="`${baseUrl}${lang}/pets/${petType}/${pet.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
        <div class="grid-meta">
          <span v-if="pet.genderDisplay" class="tag gender-tag" :data-gender="pet.gender">{{ pet.genderDisplay }}</span>
          <span v-if="pet.ageDisplay" class="tag age-tag">{{ pet.ageDisplay }}</span>
          <span v-if="pet.sizeDisplay" class="tag size-tag">{{ pet.sizeDisplay }}</span>
        </div>
        <img :src="pet.image" loading="lazy" />
        <div :class="['grid-card-body', getRandomClass(pet.uuid)]">
          <div class="name">{{ pet.nameDisplay }}</div>
          <p>{{ pet.descriptionDisplay }}</p>
        </div>
      </a>
    </div>
    <div v-else class="carousel-container">
      <div class="carousel-wrapper">
        <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>      
        <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div v-for="(pet, index) in selectPets" :key="pet.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}${lang}/pets/${petType}/${pet.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
              <div class="grid-meta">
                <span v-if="pet.genderDisplay" class="tag gender-tag" :data-gender="pet.gender">{{ pet.genderDisplay }}</span>
                <span v-if="pet.ageDisplay" class="tag age-tag">{{ pet.ageDisplay }}</span>
                <span v-if="pet.sizeDisplay" class="tag size-tag">{{ pet.sizeDisplay }}</span>
              </div>
              <img :src="pet.image" loading="lazy" />
              <div :class="['grid-card-body', getRandomClass(pet.uuid)]">
                <div class="name">{{ pet.nameDisplay }}</div>
                <p>{{ pet.descriptionDisplay }}</p>
              </div>
            </a>
          </div>
        </div>
        <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= (selectPets ? selectPets.length - 1 : 0)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
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
import { computed, ref, onMounted, onUnmounted, nextTick, inject, watch } from 'vue'
import { getTranslate, getAge, getAgePetCategory } from '../composables/i18n'
import { useRandomColor } from '../composables/useRandomColor'
import { useScroll } from '../composables/useScroll'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

// ============================================================
//  3. УТИЛИТЫ
// ============================================================

/**
 * Обработка пути к изображению
 */
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
//  4. КОМПОНЕНТ
// ============================================================
export default {
  name: 'SelectPets',

  props: {
    petUUIDs: {
      type: Array,
      default: () => [],
    },
    petType: {
      type: String,
      required: true,
      default: 'pets'
    }
  },

  setup(props) {
    // ============================================================
    //  4.1. ЯЗЫК И ПЕРЕВОДЫ
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => getTranslate(lang.value, category, key)

    // ============================================================
    //  4.2. СОСТОЯНИЕ
    // ============================================================
    const allPets = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    // ============================================================
    //  4.3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const selectPets = computed(() => {
      if (isLoading.value) return []
      if (!allPets.value || allPets.value.length === 0) return []
      if (!props.petUUIDs || props.petUUIDs.length === 0) return []

      return allPets.value.filter(v =>
        v.uuid && props.petUUIDs.includes(v.uuid)
      )
    })

    // ============================================================
    //  4.4. ПОДКЛЮЧЕНИЕ КОМПОЗАБЛОВ
    // ============================================================

    // --- Рандомные цвета ---
    const { getRandomClass } = useRandomColor()

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
    } = useScroll({
      containerRef: carouselRef,
      items: selectPets,
    })

    // ============================================================
    //  4.5. RESIZE
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
    //  4.6. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    // --- Загрузка данных ---
    const loadData = async () => {
      try {
        let modules
        switch (lang.value) {
          case 'en':
            modules = import.meta.glob('/en/pets/*/*.md')
            break
          case 'de':
            modules = import.meta.glob('/de/pets/*/*.md')
            break
          default:
            modules = import.meta.glob('/ru/pets/*/*.md')
        }
        const filteredModules = Object.entries(modules).filter(([path]) => {
          return path.includes(`/${lang.value}/pets/${props.petType}/`) && !path.endsWith(`${props.petType}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/pets/${props.petType}/`, '').replace('.md', '')

            return {
              uuid: uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              gender: getTranslate('ru', 'gender', fm.gender),
              genderDisplay: getTranslate(lang.value, 'gender', fm.gender),
              ageDisplay: getAge(lang.value, fm.age),
              sizeDisplay: getTranslate(lang.value, 'size', fm.size),
              image: processImage(fm.image, props.petType, uuid),
            }
          })
        )

        allPets.value = loaded
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
      isLoading.value = false
    })

    // --- Следим за изменением языка ---
    watch(lang, async () => {
      isLoading.value = true
      await loadData()
      resetToFirstSlide()
      isLoading.value = false
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
    //  4.7. ВОЗВРАТ
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
      
      // Свайп
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
      
      // Прочее
      petType: props.petType,
      getRandomClass,
      baseUrl,
    }
  },
}
</script>