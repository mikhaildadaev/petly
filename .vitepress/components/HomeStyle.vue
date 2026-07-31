<template>
  <div v-if="imageConfig" class="home-image" :class="imageConfig.float">
    <img :src="imageUrl" :width="imageConfig.width" :height="imageConfig.height || 'auto'" :alt="imageConfig.alt || 'Изображение'" loading="lazy" @error="handleImageError"/>
    <div v-if="imageConfig.caption" class="caption">
      {{ imageConfig.caption }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { usePageStyle } from '../utils/usePageStyle'
import { useUrlMedia } from '../utils/useUrlMedia'

export default {
  name: 'HomeStyle',
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
    },
    caption: {
      type: String,
      default: null,
    }
  },
  setup(props) {
    const { page, lang } = useData()
    
    const imageConfig = computed(() => {
      // Если переданы пропсы напрямую
      if (props.src) {
        return {
          src: props.src,
          float: props.float || 'center',
          width: props.width || '100%',
          height: props.height || 'auto',
          alt: 'Изображение',
          caption: props.caption || null,
        }
      }
      
      // Иначе берем из конфига
      let currentPath = props.path || page.value.relativePath?.replace(/\.md$/, '') || '/'
      const langPrefix = lang.value
      if (currentPath.startsWith(langPrefix)) {
        currentPath = currentPath.slice(langPrefix.length)
      }
      if (!currentPath) currentPath = '/'
      
      const config = usePageStyle(currentPath)
      if (!config) {
        return {
          src: '/assets/webp/default.webp',
          float: 'center',
          width: '100%',
          height: 'auto',
          alt: 'Изображение',
          caption: null,
        }
      }
      
      return {
        ...config,
        float: props.float || config.float || 'center',
        width: props.width || config.width || '100%',
        height: props.height || config.height || 'auto',
        caption: props.caption || config.caption || null,
      }
    })
    
    const imageUrl = computed(() => {
      if (!imageConfig.value) return ''
      return useUrlMedia(imageConfig.value.src, 'image')
    })
    
    const handleImageError = (e) => {
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

<style scoped>
.home-image {
  width: 100%;
  margin: 0 auto 24px;
  line-height: 0;
}

.home-image img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
}

.home-image.left {
  float: left;
  margin-right: 24px;
  max-width: 50%;
}

.home-image.right {
  float: right;
  margin-left: 24px;
  max-width: 50%;
}

.home-image.center {
  text-align: center;
}

.home-image .caption {
  font-size: 14px;
  color: var(--vp-c-text-2);
  text-align: center;
  margin-top: 8px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .home-image.left,
  .home-image.right {
    float: none;
    margin: 0 auto 16px;
    max-width: 100%;
  }
}
</style>