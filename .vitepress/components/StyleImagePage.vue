<template>
  <div class="page-image" :class="float">
    <img :src="processedSrc" :width="width" :height="height" loading="lazy" @error="handleImageError" />
  </div>
</template>

<script>
// ============================================================
//  ИМПОРТЫ
// ============================================================
import { computed } from 'vue'

// ============================================================
//  КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

// ============================================================
//  КОМПОНЕНТ
// ============================================================
export default {
  name: 'StyleImagePage',

  props: {
    src: {
      type: String,
      required: true,
      description: 'Путь изображения'
    },
    float: {
      type: String,
      default: 'none',
      description: 'Положение изображения'
    },
    width: {
      type: [String, Number],
      default: '100%',
      description: 'Ширина изображения'
    },
    height: {
      type: [String, Number],
      default: 'auto',
      description: 'Высота изображения'
    }
  },

  setup(props) {
    // ============================================================
    //  ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const processedSrc = computed(() => {
      const src = props.src
      
      if (src.startsWith('/')) {
        return `${baseUrl}${src.slice(1)}`
      }
      
      return src
    })

    // ============================================================
    //  МЕТОДЫ
    // ============================================================

    const handleImageError = (e) => {
      console.warn(`⚠️ Ошибка загрузки изображения: ${props.src}`)
      e.target.style.display = 'none'
    }

    // ============================================================
    //  ВОЗВРАТ
    // ============================================================
    return {
      processedSrc,
      handleImageError,
    }
  }
}
</script>