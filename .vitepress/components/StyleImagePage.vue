<template>
  <div class="page-image" :class="float">
    <img :src="imageUrl" :width="width" :height="height" loading="lazy" @error="handleImageError" />
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed } from 'vue'
import { useUrlMedia } from '../utils/useUrlMedia'

// ============================================================
//  2. КОМПОНЕНТ
// ============================================================
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
    // ============================================================
    //  2.1. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const imageUrl = computed(() => {
      // Если src начинается с http:// или https:// — это полный URL
      if (props.src.startsWith('http://') || props.src.startsWith('https://')) {
        return props.src
      }
      
      // Используем useUrlMedia для обработки пути
      // Передаём src, тип 'image' и пустой uuid
      return useUrlMedia(props.src, 'images', '', 'image')
    })

    // ============================================================
    //  2.2. МЕТОДЫ
    // ============================================================

    const handleImageError = (e) => {
      console.warn(`⚠️ Ошибка загрузки изображения: ${props.src}`)
      e.target.style.display = 'none'
      //e.target.src = '/placeholder-image.svg'
    }

    // ============================================================
    //  2.3. ВОЗВРАТ
    // ============================================================
    return {
      imageUrl,
      handleImageError,
    }
  }
}
</script>