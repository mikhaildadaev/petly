<template>
  <div v-if="imageConfig" class="page-image" :class="imageConfig.float">
    <img :src="imageUrl" :width="imageConfig.width" :height="imageConfig.height || 'auto'" :alt="imageConfig.alt || 'Изображение'" loading="lazy" @error="handleImageError"/>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { usePageStyle } from '../utils/usePageStyle'
import { useUrlMedia } from '../utils/useUrlMedia'

export default {
  name: 'PageStyle',
  props: {
    src: {
      type: String,
      default: null,
    },
    float: {
      type: String,
      default: null,
    },
    width: {
      type: [String, Number],
      default: null,
    },
    height: {
      type: [String, Number],
      default: null,
    },
    path: {
      type: String,
      default: null,
    }
  },
  setup(props) {
    const { page, lang } = useData()
    const imageConfig = computed(() => {
      if (props.src) {
        return {
          src: props.src,
          float: props.float || 'center',
          width: props.width || 300,
          height: props.height || 'auto',
          alt: 'Изображение'
        }
      }
      let currentPath = props.path || page.value.relativePath?.replace(/\.md$/, '') || '/'
      const langPrefix = lang.value
      if (currentPath.startsWith(langPrefix)) {
        currentPath = currentPath.slice(langPrefix.length)
      }
      if (!currentPath) currentPath = '/'
      const config = usePageStyle(currentPath)
      if (!config) {
        console.warn(`⚠️ Нет конфига для пути: ${currentPath}`)
        return {
          src: '/assets/webp/default.webp',
          float: 'center',
          width: 300,
          height: 'auto',
          alt: 'Изображение'
        }
      }
      return {
        ...config,
        float: props.float || config.float || 'center',
        width: props.width || config.width || 300,
        height: props.height || config.height || 'auto',
      }
    })
    const imageUrl = computed(() => {
      if (!imageConfig.value) return ''
      return useUrlMedia(imageConfig.value.src, 'image')
    })
    const handleImageError = (e) => {
      console.warn(`⚠️ Ошибка загрузки изображения: ${imageConfig.value?.src}`)
      e.target.style.display = 'none'
    }
    return {
      imageConfig,
      imageUrl,
      handleImageError,
    }
  }
}
</script>