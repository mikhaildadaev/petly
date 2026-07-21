<template>
  <div class="page-image" :class="float">
    <img :src="imageUrl" :width="width" :height="height" loading="lazy" @error="handleImageError" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useUrlMedia } from '../utils/useUrlMedia'

const baseUrl = import.meta.env.BASE_URL

export default {
  name: 'StyleImagePage',

  props: {
    src: {
      type: String,
      required: true,
    },
    float: {
      type: String,
      default: 'none',
    },
    width: {
      type: [String, Number],
      default: '100%',
    },
    height: {
      type: [String, Number],
      default: 'auto',
    }
  },

  setup(props) {
    const imageUrl = computed(() => {
      const src = props.src
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return src
      }
      return useUrlMedia(src, 'image')
    })
    const handleImageError = (e) => {
      console.warn(`⚠️ Ошибка загрузки изображения: ${props.src}`)
      e.target.style.display = 'none'
    }
    return {
      imageUrl,
      handleImageError,
    }
  }
}
</script>