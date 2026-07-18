<template>
  <div>
    <div class="gallery-media">
      <div v-for="(item, index) in mediaItems" :key="index" class="gallery-item" :style="{ '--delay': index * 0.05 + 's' }" @click="openFullslider(index)">
        <!-- Фотографии (превью) -->
        <img v-if="item.type === 'image'" :src="item.src" loading="lazy" />
        <!-- Видеозаписи (превью) -->
        <div v-else-if="item.type === 'video'" class="video-preview">
          <video :src="item.src" muted playsinline @mouseenter="playVideo" @mouseleave="pauseVideo" ref="videoPreviewRefs" />
        </div>
        <!-- Аудиозаписи (превью) -->
        <div v-else class="audio-preview">
          <div class="audio-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div v-if="fullsliderOpen" class="fullslider" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
      <button class="fullslider-close" @click.stop="closeFullslider" aria-label="Закрыть">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <button v-if="mediaItems.length > 1" class="fullslider-prev" @click.stop="prevMedia" aria-label="Предыдущее">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button v-if="mediaItems.length > 1" class="fullslider-next" @click.stop="nextMedia" aria-label="Следующее">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <div class="fullslider-content" @click.stop>
        <!-- Фотографии -->
        <img v-if="currentMedia.type === 'image'" :src="currentMedia.src" />
        <!-- Видеозаписи -->
        <video v-else-if="currentMedia.type === 'video'" :src="currentMedia.src" controls autoplay playsinline class="fullslider-video" ref="fullsliderVideoRef"/>
        <!-- Аудиозаписи -->
        <audio v-else-if="currentMedia.type === 'audio'" :src="currentMedia.src" controls autoplay class="fullslider-audio"/>
      </div>
      <div class="fullslider-footer" @click.stop>
        <div class="fullslider-dots">
          <span v-for="(_, index) in mediaItems" :key="index" class="dot" :class="{ active: index === currentIndex }" @click.stop="goToMedia(index)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useScroll } from '../utils/useScroll'

// ============================================================
//  2. КОМПОНЕНТ
// ============================================================
export default {
  name: 'GalleryMedia',

  props: {
    audios: {
      type: Array,
      default: () => [],
      description: 'Массив URL аудиозаписей'
    },
    photos: {
      type: Array,
      default: () => [],
      description: 'Массив URL изображений'
    },
    videos: {
      type: Array,
      default: () => [],
      description: 'Массив URL видеозаписей'
    }
  },

  setup(props) {
    // ============================================================
    //  2.1. СОСТОЯНИЕ
    // ============================================================
    const fullsliderOpen = ref(false)
    const currentIndex = ref(0)
    const fullsliderVideoRef = ref(null)

    // ============================================================
    //  2.2. КОМПОЗАБЛЫ
    // ============================================================

    const carouselRef = ref(null)

    const {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    } = useScroll({
      containerRef: carouselRef,
      items: computed(() => mediaItems.value),
    })

    // ============================================================
    //  2.3. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const mediaItems = computed(() => {
      const items = []
      const audios = props.audios || []
      const photos = props.photos || []
      const videos = props.videos || []
      const maxLength = Math.max(audios.length, photos.length, videos.length)
      for (let i = 0; i < maxLength; i++) {
        if (i < audios.length) {
          items.push({ type: 'audio', src: audios[i] })
        }
        if (i < photos.length) {
          items.push({ type: 'image', src: photos[i] })
        }
        if (i < videos.length) {
          items.push({ type: 'video', src: videos[i] })
        }
      }
      return items
    })
    const currentMedia = computed(() => {
      return mediaItems.value[currentIndex.value] || { type: 'image', src: '' }
    })
    const hasMedia = computed(() => {
      const audios = props.audios || []
      const photos = props.photos || []
      const videos = props.videos || []
      return audios.length > 0 || photos.length > 0 || videos.length > 0
    })

    // ============================================================
    //  2.4. МЕТОДЫ
    // ============================================================

    const openFullslider = (index) => {
      if (!hasMedia.value) return
      currentIndex.value = index
      fullsliderOpen.value = true
      document.body.style.overflow = 'hidden'
    }
    const closeFullslider = () => {
      fullsliderOpen.value = false
      document.body.style.overflow = ''
      if (fullsliderVideoRef.value) {
        fullsliderVideoRef.value.pause()
      }
    }
    const nextMedia = () => {
      currentIndex.value = (currentIndex.value + 1) % mediaItems.value.length
    }
    const prevMedia = () => {
      currentIndex.value = (currentIndex.value - 1 + mediaItems.value.length) % mediaItems.value.length
    }
    const goToMedia = (index) => {
      currentIndex.value = index
    }
    const playVideo = (e) => {
      const video = e.target
      video.play().catch(() => {})
    }
    const pauseVideo = (e) => {
      const video = e.target
      video.pause()
      video.currentTime = 0
    }
    const stopCurrentVideo = () => {
      if (fullsliderVideoRef.value) {
        fullsliderVideoRef.value.pause()
        fullsliderVideoRef.value.currentTime = 0
      }
    }
    const playCurrentVideo = () => {
      if (fullsliderVideoRef.value && currentMedia.value.type === 'video') {
        setTimeout(() => {
          fullsliderVideoRef.value?.play().catch(() => {})
        }, 100)
      }
    }
    const handleKeydown = (e) => {
      if (!fullsliderOpen.value) return
      switch (e.key) {
        case 'Escape':
          closeFullslider()
          break
        case 'ArrowRight':
          nextMedia()
          break
        case 'ArrowLeft':
          prevMedia()
          break
      }
    }

    // ============================================================
    //  2.5. WATCHERS
    // ============================================================

    watch(currentIndex, () => {
      stopCurrentVideo()
      playCurrentVideo()
    })

    // ============================================================
    //  2.6. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    })

    // ============================================================
    //  2.7. ВОЗВРАТ
    // ============================================================
    return {
      // Состояние
      fullsliderOpen,
      currentIndex,
      fullsliderVideoRef,

      // Вычисляемые
      mediaItems,
      currentMedia,
      hasMedia,

      // Методы управления
      openFullslider,
      closeFullslider,
      nextMedia,
      prevMedia,
      goToMedia,

      // Видео
      playVideo,
      pauseVideo,

      // События
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    }
  }
}
</script>