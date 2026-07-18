<template>
  <div v-if="randomPets.length > 0" class="carousel-cards">
    <div class="carousel-wrapper">
      <button class="carousel-btn prev" @click="prevSlide" :disabled="currentIndex === 0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div class="carousel-track" ref="carouselRef" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <div v-for="(pet, index) in randomPets" :key="pet.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
          <a :href="`${baseUrl}${lang}/pets/${pet.type}/${pet.uuid}`" class="aspect-list grid-card">
            <div class="grid-meta">
              <span v-if="pet.genderDisplay" class="tag gender-tag" :data-gender="pet.gender">{{ pet.genderDisplay }}</span>
              <span v-if="pet.ageDisplay" class="tag age-tag">{{ pet.ageDisplay }}</span>
              <span v-if="pet.sizeDisplay" class="tag size-tag">{{ pet.sizeDisplay }}</span>
            </div>
            <img :src="pet.image" loading="lazy" />
            <div :class="['grid-card-body', useRandomClass(pet.uuid)]">
              <div class="name">{{ pet.nameDisplay }}</div>
              <p>{{ pet.descriptionDisplay }}</p>
            </div>
          </a>
        </div>
        <div class="carousel-slide load-more-slide" :class="{ center: currentIndex === randomPets.length }">
          <div class="load-more" @click="goToLink">
            <div class="load-more-content">
              <div class="load-more-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <span class="load-more-text">{{ translate('ui', 'Перейти в раздел') }}</span>
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
  <div v-else-if="randomPets && randomPets.length === 0" class="no-results">
    <p>{{ translate('ui', 'Нет результатов') }}</p>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRandomColor } from '../composables/useRandomColor'
import { useScroll } from '../composables/useScroll'
import { useTranslate, useAge, useAgePetCategory } from '../composables/useTranslate'
import { useUrlMedia } from '../composables/useUrlMedia'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

/**
 * Перемешивание массива (алгоритм Фишера-Йетса)
 */
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

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
    } = useScroll({
      containerRef: carouselRef,
      items: randomPets,
      hasMoreItems: hasMoreItems,
    })

    // ============================================================
    //  3.3. ВЫЧИСЛЯЕМЫЕ
    // ============================================================

    const carouselTotalSlides = computed(() => {
      return randomPets.value.length + (hasMoreItems.value ? 1 : 0)
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

    // ============================================================
    //  3.7. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(async () => {
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
          return path.includes(`/${lang.value}/pets/${props.type}/`) && !path.endsWith(`${props.type}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/pets/${props.type}/`, '').replace('.md', '')

            return {
              uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              gender: useTranslate('ru', 'gender', fm.gender),
              genderDisplay: useTranslate(lang.value, 'gender', fm.gender),
              age: useAgePetCategory(fm.age),
              ageDisplay: useAge(lang.value, fm.age),
              sizeDisplay: useTranslate(lang.value, 'size', fm.size),
              image: useUrlMedia(fm.image, props.type, uuid, 'image'),
              type: props.type,
            }
          })
        )

        // Перемешиваем и берём нужное количество
        const shuffled = shuffleArray(loaded)
        randomPets.value = shuffled.slice(0, props.count)
        currentIndex.value = 0
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
      }
    })

    // --- Следим за изменением языка ---
    watch(lang, async () => {
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
          return path.includes(`/${lang.value}/pets/${props.type}/`) && !path.endsWith(`${props.type}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/pets/${props.type}/`, '').replace('.md', '')

            return {
              uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              gender: useTranslate('ru', 'gender', fm.gender),
              genderDisplay: useTranslate(lang.value, 'gender', fm.gender),
              age: useAgePetCategory(fm.age),
              ageDisplay: useAge(lang.value, fm.age),
              sizeDisplay: useTranslate(lang.value, 'size', fm.size),
              image: useUrlMedia(fm.image, props.type, uuid, 'image'),
              type: props.type,
            }
          })
        )

        const shuffled = shuffleArray(loaded)
        randomPets.value = shuffled.slice(0, props.count)
        currentIndex.value = 0
      } catch (error) {
        console.error('Ошибка загрузки данных при смене языка:', error)
      }
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