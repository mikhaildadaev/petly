<template>
  <div v-if="config && config.fields" class="aspect-card hero-card">
    <div class="hero-meta">
      <template v-for="displayField in config.fields.display" :key="displayField">
        <label v-if="item && item[displayField]" :class="`tag ${displayField.replace('Display', '')}-tag`">{{ item[displayField] }}</label>
      </template>
    </div>
    <img :src="item.image || ''" class="hero-image" loading="lazy" />
    <div :class="['hero-overlay', useRandomClass(item.uuid || '')]">
      <h1 class="title">{{ item.nameDisplay || '' }}</h1>
      <button v-if="type === 'pets' && item.uuid" class="favorite" :class="{ 'is-favorite': isFavorite }" @click.stop="toggleFavorite(item.uuid)" :title="translate('ui', 'Добавить в избранное')">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 3.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <p class="description">{{ item.descriptionDisplay || '' }}</p>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import { useConfigItem } from '../utils/useConfigItem'
import { useFavorites } from '../utils/useFavorites'
import { useRandomColor } from '../utils/useRandomColor'
import { useTranslate } from '../utils/useTranslate'
import { useUrlMedia } from '../utils/useUrlMedia'

export default {
  name: 'CardHero',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['humans', 'organizations', 'pets'].includes(value)
    }
  },
  setup(props) {
    const { lang, frontmatter } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)
    const config = useConfigItem[props.type]
    const { useRandomClass } = useRandomColor()
    const { isFavorite, toggleFavorite, checkIsFavorite } = useFavorites()
    const fm = computed(() => frontmatter.value || {})
    const isMobile = ref(false)
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        isMobile.value = window.innerWidth < 735
      }
    }
    const item = computed(() => {
      const data = fm.value || {}
      const uuid = data.uuid || ''
      const images = data.image || []
      let image = isMobile.value ? images.find(img => img.vertical)?.vertical || '' : images.find(img => img.horizontal)?.horizontal || ''
      const transformed = config && config.transform ? config.transform(data, lang.value, translate) : {}
      return {
        uuid,
        nameDisplay: data.title || '',
        descriptionDisplay: data.description || '',
        image: useUrlMedia(image, 'image'),
        ...transformed
      }
    })
    const checkFavoriteStatus = (uuid) => {
      if (uuid) {
        isFavorite.value = checkIsFavorite(uuid)
      }
    }
    let resizeTimeout = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        checkMobile()
      }, 100)
    }
    onMounted(() => {
      checkMobile()
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      nextTick(() => checkFavoriteStatus(item.value.uuid))
    })
    watch(() => item.value.uuid, (newUuid) => {
      if (newUuid) {
        setTimeout(() => checkFavoriteStatus(newUuid), 50)
      }
    }, { immediate: true })
    watch(fm, (newFm) => {
      if (newFm?.uuid) {
        isFavorite.value = checkIsFavorite(newFm.uuid)
      }
    }, { deep: true })
    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        if (resizeTimeout) clearTimeout(resizeTimeout)
      }
    })
    return {
      config,
      item,
      isFavorite,
      useRandomClass,
      toggleFavorite,
      translate,
    }
  }
}
</script>