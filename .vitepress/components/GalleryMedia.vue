<template>
  <div>
    <div class="gallery-media">
      <div v-for="(item, index) in mediaItems" :key="index" class="gallery-item" :style="{ '--delay': index * 0.05 + 's' }" @click="openFullScreen(index)">
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
    <div v-if="fullScreenOpen" class="fullScreen" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
      <button class="fullScreen-close" @click.stop="closefullScreen" aria-label="Закрыть">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <button v-if="mediaItems.length > 1" class="fullScreen-prev" @click.stop="prevMedia" aria-label="Предыдущее">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button v-if="mediaItems.length > 1" class="fullScreen-next" @click.stop="nextMedia" aria-label="Следующее">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <div class="fullScreen-content" @click.stop>
        <!-- Фотографии -->
        <img v-if="currentMedia.type === 'image'" :src="currentMedia.src" />
        <!-- Видеозаписи -->
        <video v-else-if="currentMedia.type === 'video'" :src="currentMedia.src" controls autoplay playsinline class="fullScreen-video" ref="fullScreenVideoRef"/>
        <!-- Аудиозаписи -->
        <audio v-else-if="currentMedia.type === 'audio'" :src="currentMedia.src" controls autoplay class="fullScreen-audio"/>
      </div>
      <div class="fullScreen-footer" @click.stop>
        <div class="fullScreen-dots">
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
import { useScrollGallery } from '../utils/useScrollGallery'

// ============================================================
//  2. КОМПОНЕНТ
// ============================================================
export default {
  name: 'GalleryMedia',

  props: {
    audios: {
      type: Array,
      default: () => [],
    },
    photos: {
      type: Array,
      default: () => [],
    },
    videos: {
      type: Array,
      default: () => [],
    }
  },

  setup(props) {
    // ============================================================
    //  2.1. СОСТОЯНИЕ
    // ============================================================
    const fullScreenOpen = ref(false)
    const fullScreenVideoRef = ref(null)

    // ============================================================
    //  2.2. МЕДИА
    // ============================================================
    const mediaItems = ref([])

    const updateMediaItems = () => {
      const items = []
      const audios = props.audios || []
      const photos = props.photos || []
      const videos = props.videos || []
      const maxLength = Math.max(audios.length, photos.length, videos.length)
      
      for (let i = 0; i < maxLength; i++) {
        if (i < audios.length) items.push({ type: 'audio', src: audios[i] })
        if (i < photos.length) items.push({ type: 'image', src: photos[i] })
        if (i < videos.length) items.push({ type: 'video', src: videos[i] })
      }
      
      mediaItems.value = items
    }

    // ============================================================
    //  2.3. КОМПОЗАБЛ ДЛЯ ГАЛЕРЕИ
    // ============================================================

    const {
      currentIndex,
      goTo,
      next,
      prev,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleKeydown,
    } = useScrollGallery({
      items: mediaItems,
      initialIndex: 0,
    })

    // ============================================================
    //  2.4. ВЫЧИСЛЯЕМЫЕ
    // ============================================================

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
    //  2.5. МЕТОДЫ
    // ============================================================

    const openFullScreen = (index) => {
      if (!hasMedia.value) return
      goTo(index)
      fullScreenOpen.value = true
      document.body.style.overflow = 'hidden'
    }

    const closeFullScreen = () => {
      fullScreenOpen.value = false
      document.body.style.overflow = ''
      if (fullScreenVideoRef.value) {
        fullScreenVideoRef.value.pause()
      }
    }

    const nextMedia = () => next()
    const prevMedia = () => prev()
    const goToMedia = (index) => goTo(index)

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
      if (fullScreenVideoRef.value) {
        fullScreenVideoRef.value.pause()
        fullScreenVideoRef.value.currentTime = 0
      }
    }

    const playCurrentVideo = () => {
      if (fullScreenVideoRef.value && currentMedia.value.type === 'video') {
        setTimeout(() => {
          fullScreenVideoRef.value?.play().catch(() => {})
        }, 100)
      }
    }

    // ============================================================
    //  2.6. WATCHERS
    // ============================================================

    watch(currentIndex, () => {
      stopCurrentVideo()
      playCurrentVideo()
    })

    // ============================================================
    //  2.7. ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      updateMediaItems()
      window.addEventListener('keydown', handleKeydown)
    })

    watch(() => [props.audios, props.photos, props.videos], updateMediaItems, { 
      deep: true,
      immediate: true 
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    })

    // ============================================================
    //  2.8. ВОЗВРАТ
    // ============================================================
    return {
      fullScreenOpen,
      currentIndex,
      fullScreenVideoRef,
      mediaItems,
      currentMedia,
      hasMedia,
      openFullScreen,
      closeFullScreen,
      nextMedia,
      prevMedia,
      goToMedia,
      playVideo,
      pauseVideo,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    }
  }
}
</script>