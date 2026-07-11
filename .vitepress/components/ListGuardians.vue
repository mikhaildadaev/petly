<template>
  <div v-if="guardians && guardians.length > 0" class="grid-list">
    <div v-if="!isMobile" class="grid-cards">
      <a v-for="guardian in guardians" :key="guardian.uuid" :href="`${baseUrl}ru/volunteers/${guardian.slug}`" class="aspect-list grid-card">
        <div class="grid-meta">
          <span v-if="guardian.direction" class="tag direction-tag">{{ guardian.direction }}</span>
          <span v-if="guardian.experience" class="tag experience-tag">{{ guardian.experience }}</span>
        </div>
        <img :src="guardian.image" :alt="guardian.name" loading="lazy" />
        <div :class="['grid-card-body', getRandomVolunteerClass(guardian.uuid)]">
          <div class="name">{{ guardian.name }}</div>
          <p>{{ guardian.description }}</p>
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
          <div v-for="(guardian, index) in guardians" :key="guardian.uuid" class="carousel-slide" :class="{ center: index === currentIndex }">
            <a :href="`${baseUrl}ru/volunteers/${guardian.slug}`" class="aspect-list grid-card">
              <div class="grid-meta">
                <span v-if="guardian.direction" class="tag direction-tag">{{ guardian.direction }}</span>
                <span v-if="guardian.experience" class="tag experience-tag">{{ guardian.experience }}</span>
              </div>
              <img :src="guardian.image" :alt="guardian.name" loading="lazy" />
              <div :class="['grid-card-body', getRandomVolunteerClass(guardian.uuid)]">
                <div class="name">{{ guardian.name }}</div>
                <p>{{ guardian.description }}</p>
              </div>
            </a>
          </div>
        </div>
        <button class="carousel-btn next" @click="nextSlide" :disabled="currentIndex >= (guardians ? guardians.length - 1 : 0)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
  <div v-else-if="guardians && guardians.length === 0" class="no-guardians">
    <p>Нет назначенных опекунов</p>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'

const baseUrl = import.meta.env.BASE_URL

export default {
  props: {
    guardianUuids: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const allVolunteers = ref([])
    const isLoading = ref(true)

    // === МОБИЛЬНАЯ ВЕРСИЯ ===
    const MOBILE_BREAKPOINT = 736
    const isMobile = ref(false)

    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
      }
    }

    // === КАРУСЕЛЬ ===
    const carouselRef = ref(null)
    const currentIndex = ref(0)
    const touchStartX = ref(0)
    const touchEndX = ref(0)
    const isSwiping = ref(false)

    const scrollToSlide = (index) => {
      if (!carouselRef.value || !guardians.value) return
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
      if (!guardians.value) return
      if (currentIndex.value < guardians.value.length - 1) {
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

    // === ОБРАБОТЧИКИ СВАЙПА ===
    const handleTouchStart = (e) => {
      touchStartX.value = e.touches[0].clientX;
      isSwiping.value = true;
    }

    const handleTouchMove = (e) => {
      if (!isSwiping.value) return;
      e.preventDefault();
    }

    const handleTouchEnd = (e) => {
      if (!isSwiping.value) return;
      isSwiping.value = false;

      touchEndX.value = e.changedTouches[0].clientX;
      const diffX = touchStartX.value - touchEndX.value;
      const minSwipeDistance = 50;

      if (diffX > minSwipeDistance) {
        nextSlide();
      } else if (diffX < -minSwipeDistance) {
        prevSlide();
      }

      touchStartX.value = 0;
      touchEndX.value = 0;
    }

    // === ОБРАБОТЧИК RESIZE ===
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

    // === ЗАГРУЗКА ДАННЫХ ===
    onMounted(async () => {
      checkMobile()
      
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      
      try {
        const modules = import.meta.glob('/ru/volunteers/*.md')
        
        const loaded = await Promise.all(
          Object.entries(modules)
            .filter(([path]) => !path.endsWith('volunteers_index.md'))
            .map(async ([path, loader]) => {
              const mod = await loader()
              const slug = path.replace('/ru/volunteers/', '').replace('.md', '')
              const fm = mod.default?.frontmatter || mod.frontmatter || mod.__pageData?.frontmatter || {}
              
              return {
                slug,
                uuid: fm.uuid || '',
                name: fm.title || slug.charAt(0).toUpperCase() + slug.slice(1),
                description: fm.description || '',
                experience: fm.experience || '',
                direction: fm.direction || '',
                image: fm.image || '/placeholder-volunteer.svg'
              }
            })
        )
        allVolunteers.value = loaded
      } catch (error) {
        console.error('Ошибка загрузки данных волонтеров:', error)
      } finally {
        isLoading.value = false
      }
    })

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
      }
    })

    // === ФИЛЬТРАЦИЯ ===
    const guardians = computed(() => {
      if (!allVolunteers.value || allVolunteers.value.length === 0) {
        return []
      }
      
      if (!props.guardianUuids || props.guardianUuids.length === 0) {
        return []
      }
      
      return allVolunteers.value.filter(v => 
        v.uuid && props.guardianUuids.includes(v.uuid)
      )
    })

    // === РАНДОМНЫЕ ЦВЕТА ДЛЯ ИМЁН СОБАК ===
    const randomClassCache = new Map()
    const getRandomVolunteerClass = (slug) => {
      if (randomClassCache.has(slug)) {
        return randomClassCache.get(slug)
      }
      
      const num = Math.floor(Math.random() * 30) + 1
      const formattedNum = num.toString().padStart(2, '0')
      const className = `rand-${formattedNum}`
      
      randomClassCache.set(slug, className)
      return className
    }

    return {
      guardians,
      isLoading,
      isMobile,
      carouselRef,
      currentIndex,
      scrollToSlide,
      nextSlide,
      prevSlide,
      goToSlide,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      getRandomVolunteerClass,
      baseUrl,
    }
  }
}
</script>