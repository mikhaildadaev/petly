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
          <a :href="`${baseUrl}${lang}/pets/${pet.petType}/${pet.uuid}`" class="grid-card">
            <div class="grid-meta">
              <span v-if="pet.gender" class="tag gender-tag" :data-gender="pet.gender">{{ translate('gender', pet.gender) }}</span>
              <span v-if="pet.age" class="tag age-tag">{{ translateAge(pet.age) }}</span>
              <span v-if="pet.size" class="tag size-tag">{{ translate('size', pet.size) }}</span>
            </div>
            <img :src="pet.image" :alt="pet.name" loading="lazy" />
            <div :class="['grid-card-body', getRandomClass(pet.uuid)]">
              <div class="name">{{ pet.name }}</div>
              <p>{{ pet.description }}</p>
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
//  ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { translations, getTranslate, getTranslateAge } from '../composables/i18n'

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL
const randomClassCache = new Map()
let previousColor = 0

// ============================================================
//  УТИЛИТЫ
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

/**
 * Получение случайного класса для карточки
 */
const getRandomClass = (uuid) => {
  if (!uuid) return 'rand-01'
  if (randomClassCache.has(uuid)) {
    return randomClassCache.get(uuid)
  }
  let num
  do {
    num = Math.floor(Math.random() * 30) + 1
  } while (num === previousColor)
  previousColor = num
  const formattedNum = num.toString().padStart(2, '0')
  const className = `rand-${formattedNum}`
  randomClassCache.set(uuid, className)
  return className
}

// ============================================================
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'RandomPets',

  props: {
    petType: {
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
    //  ЯЗЫК
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => getTranslate(lang.value, category, key)
    const translateAge = (ageStr) => getTranslateAge(lang.value, ageStr)

    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================
    const randomPets = ref([])
    const isLoading = ref(true)

    // ============================================================
    //  ССЫЛКА ДЛЯ "ПОСМОТРЕТЬ ЕЩЁ"
    // ============================================================
    const linkUrl = computed(() => {
      const langPath = lang.value || 'ru'
      return `/${langPath}/${props.petType}`
    })

    // Карусель
    const carouselRef = ref(null)
    const currentIndex = ref(0)

    // Свайп
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const isSwiping = ref(false)

    // ============================================================
    //  ВЫЧИСЛЯЕМЫЕ
    // ============================================================

    const carouselTotalSlides = computed(() => {
      return randomPets.value.length + 1
    })

    // ============================================================
    //  ПЕРЕХОД (ССЫЛКА)
    // ============================================================
    const goToLink = () => {
      window.location.href = linkUrl.value
    }

    // ============================================================
    //  МЕТОДЫ (КАРУСЕЛЬ)
    // ============================================================

    const scrollToSlide = (index) => {
      if (!carouselRef.value) return
      const container = carouselRef.value
      const slides = container.querySelectorAll('.carousel-slide')
      if (!slides.length || index < 0 || index >= slides.length) return

      const slide = slides[index]
      const containerWidth = container.offsetWidth
      const slideWidth = slide.offsetWidth
      const scrollPosition = slide.offsetLeft - (containerWidth - slideWidth) / 2

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth'
      })

      currentIndex.value = index
    }

    const nextSlide = () => {
      if (currentIndex.value < carouselTotalSlides.value - 1) {
        scrollToSlide(currentIndex.value + 1)
      }
    }

    const prevSlide = () => {
      if (currentIndex.value > 0) {
        scrollToSlide(currentIndex.value - 1)
      }
    }

    const goToSlide = (index) => {
      scrollToSlide(index)
    }

    // ============================================================
    //  МЕТОДЫ (СВАЙП)
    // ============================================================

    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      touchStartX.value = touch.clientX
      touchStartY.value = touch.clientY
      isSwiping.value = true
    }

    const handleTouchMove = (e) => {
      if (!isSwiping.value) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartX.value
      const deltaY = touch.clientY - touchStartY.value
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isSwiping.value = false
        return
      }
      e.preventDefault()
    }

    const handleTouchEnd = (e) => {
      if (!isSwiping.value) return
      isSwiping.value = false
      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartX.value
      const minSwipeDistance = 50
      if (deltaX < -minSwipeDistance) {
        nextSlide()
      } else if (deltaX > minSwipeDistance) {
        prevSlide()
      }
      touchStartX.value = 0
      touchStartY.value = 0
    }

    // ============================================================
    //  RESIZE
    // ============================================================
    let resizeTimeout = null

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        checkMobile()
        resizeTimeout = null
      }, 100)
    }

    // ============================================================
    //  ЖИЗНЕННЫЙ ЦИКЛ
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
          return path.includes(`/${lang.value}/pets/${props.petType}/`) && !path.endsWith(`${props.petType}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/pets/${props.petType}/`, '').replace('.md', '')

            return {
              uuid,
              name: fm.title || '',
              description: fm.description || '',
              gender: fm.gender || '',
              age: fm.age || '',
              size: fm.size || '',
              tags: fm.tags || [],
              image: processImage(fm.image, props.petType, uuid),
              petType: props.petType,
            }
          })
        )

        // Перемешиваем и берем нужное количество
        const shuffled = shuffleArray(loaded)
        randomPets.value = shuffled.slice(0, props.count)

        // Сбрасываем индекс после загрузки
        currentIndex.value = 0
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        isLoading.value = false
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
    //  ВОЗВРАТ
    // ============================================================
    return {
      // Данные
      randomPets,
      
      // Язык
      lang,
      translate,
      translateAge,

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
      touchStartX,
      touchStartY,
      
      // Прочее
      baseUrl,
      linkUrl,
      getRandomClass,
    }
  },
}
</script>