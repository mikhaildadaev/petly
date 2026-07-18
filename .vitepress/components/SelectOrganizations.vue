<template>
  <div v-if="selectOrganizations && selectOrganizations.length > 0" class="grid-list">
    <div v-if="!isMobile" class="grid-cards">
      <a v-for="organization in selectOrganizations" :key="organization.uuid" :href="`${baseUrl}${lang}/organizations/${organizationType}/${organization.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
        <div class="grid-meta">
          <span v-if="organization.formatDisplay" class="tag format-tag">{{ organization.formatDisplay }}</span>
        </div>
        <img :src="organization.image" loading="lazy" />
        <div :class="['grid-card-body', useRandomClass(organization.uuid)]">
          <div class="name">{{ organization.nameDisplay }}</div>
          <p>{{ organization.descriptionDisplay }}</p>
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
          <div v-for="(organization, index) in selectOrganizations" :key="organization.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}${lang}/organizations/${organizationType}/${organization.uuid}`" target="_blank" rel="noopener noreferrer" class="aspect-list grid-card">
              <div class="grid-meta">
                <span v-if="organization.formatDisplay" class="tag format-tag">{{ organization.formatDisplay }}</span>
              </div>
              <img :src="organization.image" loading="lazy" />
              <div :class="['grid-card-body', useRandomClass(organization.uuid)]">
                <div class="name">{{ organization.nameDisplay }}</div>
                <p>{{ organization.descriptionDisplay }}</p>
              </div>
            </a>
          </div>
        </div>
        <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= (selectOrganizations ? selectOrganizations.length - 1 : 0)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
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
import { computed, ref, onMounted, onUnmounted, nextTick, inject, watch } from 'vue'
import { useRandomColor } from '../composables/useRandomColor'
import { useScroll } from '../composables/useScroll'
import { useTranslate } from '../composables/useTranslate'

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
  name: 'SelectOrganizations',

  props: {
    organizationUUIDs: {
      type: Array,
      default: () => [],
    },
    organizationType: {
      type: String,
      required: true,
      default: 'shelters'
    }
  },

  setup(props) {
    // ============================================================
    //  4.1. ЯЗЫК И ПЕРЕВОДЫ
    // ============================================================
    const lang = inject('lang', 'ru')
    const translate = (category, key) => useTranslate(lang.value, category, key)

    // ============================================================
    //  4.2. СОСТОЯНИЕ
    // ============================================================
    const allOrganizations = ref([])
    const isLoading = ref(true)
    const isClient = ref(false)

    // ============================================================
    //  4.3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const selectOrganizations = computed(() => {
      if (isLoading.value) return []
      if (!allOrganizations.value || allOrganizations.value.length === 0) return []
      if (!props.organizationUUIDs || props.organizationUUIDs.length === 0) return []

      return allOrganizations.value.filter(v =>
        v.uuid && props.organizationUUIDs.includes(v.uuid)
      )
    })

    // ============================================================
    //  4.4. ПОДКЛЮЧЕНИЕ КОМПОЗАБЛОВ
    // ============================================================

    // --- Рандомные цвета ---
    const { useRandomClass } = useRandomColor()

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
      items: selectOrganizations,
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
            modules = import.meta.glob('/en/organizations/*/*.md')
            break
          case 'de':
            modules = import.meta.glob('/de/organizations/*/*.md')
            break
          default:
            modules = import.meta.glob('/ru/organizations/*/*.md')
        }
        const filteredModules = Object.entries(modules).filter(([path]) => {
          return path.includes(`/${lang.value}/organizations/${props.organizationType}/`) && !path.endsWith(`${props.organizationType}_index.md`)
        })

        const loaded = await Promise.all(
          filteredModules.map(async ([path, loader]) => {
            const mod = await loader()
            const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
            const uuid = fm.uuid || path.replace(`/${lang.value}/organizations/${props.organizationType}/`, '').replace('.md', '')

            return {
              uuid: uuid,
              nameDisplay: fm.title || '',
              descriptionDisplay: fm.description || '',
              formatDisplay: fm.format ? translate('format', fm.format) : '',
              image: processImage(fm.image, props.organizationType, uuid),
            }
          })
        )

        allOrganizations.value = loaded
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
      
      // Свайп
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      touchStartX,
      touchStartY,
      touchEndX,
      touchEndY,
      
      // Прочее
      organizationType: props.organizationType,
      useRandomClass,
      baseUrl,
    }
  },
}
</script>