<template>
  <div class="page-image" :class="float">
    <img :src="processedSrc" :width="width" :height="height" loading="lazy" @error="handleImageError" />
  </div>
</template>

<script>
// ============================================================
//  1. ИМПОРТЫ
// ============================================================
import { computed } from 'vue'

// ============================================================
//  2. КОНСТАНТЫ
// ============================================================
const baseUrl = import.meta.env.BASE_URL

// ============================================================
//  3. КОМПОНЕНТ
// ============================================================
export default {
  name: 'StyleImagePage',

  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: 'Изображение',
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
    //  3.1. ВЫЧИСЛЯЕМЫЕ СВОЙСТВА
    // ============================================================

    const processedSrc = computed(() => {
      const src = props.src
      if (src.startsWith('/')) {
        return `${baseUrl}${src.slice(1)}`
      }
      return src
    })

    // ============================================================
    //  3.2. МЕТОДЫ
    // ============================================================

    const handleImageError = (e) => {
      console.warn(`⚠️ Ошибка загрузки изображения: ${props.src}`)
      e.target.style.display = 'none'
    }

    // ============================================================
    //  3.3. ВОЗВРАТ
    // ============================================================
    return {
      processedSrc,
      handleImageError,
    }
  }
}
</script>