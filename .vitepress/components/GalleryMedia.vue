<template>
  <div>
    <div class="gallery-media">
      <div  v-for="(item, index) in mediaItems" :key="index"  class="gallery-item" :style="{ '--delay': index * 0.05 + 's' }" @click="openFullslider(index)">
        <img  v-if="item.type === 'image'" :src="item.src" :alt="'Медиа ' + (index + 1)" loading="lazy" />
        <div v-else class="video-preview">
          <video  :src="item.src"  muted  playsinline @mouseenter="playVideo" @mouseleave="pauseVideo" ref="videoPreviewRefs" />
        </div>
      </div>
    </div>
    <div v-if="fullsliderOpen" class="fullslider" @click.self="closeFullslider">
      <button class="fullslider-close" @click="closeFullslider" aria-label="Закрыть">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <button v-if="mediaItems.length > 1" class="fullslider-prev" @click="prevImage" aria-label="Предыдущее">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button v-if="mediaItems.length > 1" class="fullslider-next" @click="nextImage" aria-label="Следующее">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      <div class="fullslider-content">
        <img v-if="currentMedia.type === 'image'" :src="currentMedia.src" :alt="'Медиа ' + (currentIndex + 1)" />
        <video v-else :src="currentMedia.src" controls autoplay playsinline class="fullslider-video"ref="fullsliderVideoRef"/>
      </div>
      <div class="fullslider-footer">
        <div class="fullslider-dots">
          <span v-for="(_, index) in mediaItems" :key="index" class="dot" :class="{ active: index === currentIndex }" @click="goToImage(index)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// ============================================================
//  ИМПОРТЫ
// ============================================================
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

// ============================================================
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'GalleryPhoto',

  props: {
    photos: {
      type: Array,
      default: () => [],
      description: 'Массив URL изображений'
    },
    videos: {
      type: Array,
      default: () => [],
      description: 'Массив URL видео'
    }
  },

  setup(props) {
    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================
    const fullsliderOpen = ref(false)
    const currentIndex = ref(0)
    const fullsliderVideoRef = ref(null)

    // ============================================================
    //  ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    /**
     * Объединенный список медиа (фото + видео)
     */
    const mediaItems = computed(() => {
      const items = []
      const maxLength = Math.max(props.photos.length, props.videos.length)
      
      for (let i = 0; i < maxLength; i++) {
        if (i < props.photos.length) {
          items.push({ type: 'image', src: props.photos[i] })
        }
        if (i < props.videos.length) {
          items.push({ type: 'video', src: props.videos[i] })
        }
      }
      
      return items
    })

    /**
     * Текущий медиа-элемент
     */
    const currentMedia = computed(() => {
      return mediaItems.value[currentIndex.value] || { type: 'image', src: '' }
    })

    /**
     * Проверка, есть ли медиа
     */
    const hasMedia = computed(() => mediaItems.value.length > 0)

    // ============================================================
    //  МЕТОДЫ
    // ============================================================

    /**
     * Открыть лайтбокс
     */
    const openFullslider = (index) => {
      if (!hasMedia.value) return
      currentIndex.value = index
      fullsliderOpen.value = true
      document.body.style.overflow = 'hidden'
    }

    /**
     * Закрыть лайтбокс
     */
    const closeFullslider = () => {
      fullsliderOpen.value = false
      document.body.style.overflow = ''
      if (fullsliderVideoRef.value) {
        fullsliderVideoRef.value.pause()
      }
    }

    /**
     * Следующее медиа
     */
    const nextImage = () => {
      currentIndex.value = (currentIndex.value + 1) % mediaItems.value.length
    }

    /**
     * Предыдущее медиа
     */
    const prevImage = () => {
      currentIndex.value = (currentIndex.value - 1 + mediaItems.value.length) % mediaItems.value.length
    }

    /**
     * Перейти к конкретному медиа
     */
    const goToImage = (index) => {
      currentIndex.value = index
    }

    /**
     * Воспроизвести видео (превью)
     */
    const playVideo = (e) => {
      const video = e.target
      video.play().catch(() => {})
    }

    /**
     * Остановить видео (превью)
     */
    const pauseVideo = (e) => {
      const video = e.target
      video.pause()
      video.currentTime = 0
    }

    /**
     * Остановка видео при смене слайда
     */
    const stopCurrentVideo = () => {
      if (fullsliderVideoRef.value) {
        fullsliderVideoRef.value.pause()
        fullsliderVideoRef.value.currentTime = 0
      }
    }

    /**
     * Воспроизведение видео при смене слайда
     */
    const playCurrentVideo = () => {
      if (fullsliderVideoRef.value && currentMedia.value.type === 'video') {
        setTimeout(() => {
          fullsliderVideoRef.value?.play().catch(() => {})
        }, 100)
      }
    }

    /**
     * Обработка клавиатуры
     */
    const handleKeydown = (e) => {
      if (!fullsliderOpen.value) return

      switch (e.key) {
        case 'Escape':
          closeFullslider()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'ArrowLeft':
          prevImage()
          break
      }
    }

    // ============================================================
    //  WATCHERS
    // ============================================================

    /**
     * Перезапускаем видео при смене слайда
     */
    watch(currentIndex, () => {
      stopCurrentVideo()
      playCurrentVideo()
    })

    // ============================================================
    //  ЖИЗНЕННЫЙ ЦИКЛ
    // ============================================================

    onMounted(() => {
      window.addEventListener('keydown', handleKeydown)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    })

    // ============================================================
    //  ВОЗВРАТ
    // ============================================================
    return {
      fullsliderOpen,
      currentIndex,
      fullsliderVideoRef,
      mediaItems,
      currentMedia,
      hasMedia,
      openFullslider,
      closeFullslider,
      nextImage,
      prevImage,
      goToImage,
      playVideo,
      pauseVideo,
      handleKeydown,
    }
  }
}
</script>