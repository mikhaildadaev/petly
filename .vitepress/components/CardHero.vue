<template>
  <div v-if="config && config.fields" class="aspect-card hero-card">
    <div class="hero-meta">
      <template v-for="displayField in config.fields.display" :key="displayField">
        <label v-if="item && item[displayField]" :class="`tag ${displayField.replace('Display', '')}-tag`" :data-gender="displayField === 'genderDisplay' ? item.gender : null">{{ item[displayField] }}</label>
      </template>
    </div>
    <picture>
      <source :srcset="item.imageVertical || ''" media="(max-width: 735px)" />
      <source :srcset="item.imageHorizontal || item.imageVertical || ''" media="(min-width: 736px)" />
      <img :src="item.imageHorizontal || item.imageVertical || ''" class="hero-image" loading="lazy" />
    </picture>
    <div :class="['hero-overlay', useRandomClass(item.uuid || '')]">
      <h1 class="title">{{ item.nameDisplay || '' }}</h1>
      <button v-if="type === 'pets' && item.uuid" class="like favorite" :class="{ 'is-favorite': isFavorite }" @click.stop="toggleFavorite(item.uuid)" :title="translate('ui', 'Добавить в избранное')"></button>
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
    type: { type: String, required: true },
    itemType: { type: String, required: true }
  },
  setup(props) {
    const { lang, frontmatter } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)
    const config = useConfigItem[props.type]
    const { useRandomClass } = useRandomColor()
    const { isFavorite, toggleFavorite, checkIsFavorite } = useFavorites()
    const fm = computed(() => frontmatter.value || {})
    const transformItem = (data) => {
      const base = {
        uuid: data.uuid,
        nameDisplay: data.title || '',
        descriptionDisplay: data.description || '',
        covenantID: data.covenantID || '',
        imageHorizontal: useUrlMedia(
          data.image?.find(img => img.horizontal)?.horizontal || '',
          'image'
        ),
        imageVertical: useUrlMedia(
          data.image?.find(img => img.vertical)?.vertical || '',
          'image'
        ),
        type: props.itemType,
        ...(config.transform ? config.transform(data, lang.value, translate) : {})
      }
      return base
    }
    const item = computed(() => {
      const data = fm.value || {}
      const result = transformItem(data)
      return result
    })
    const checkFavoriteStatus = (uuid) => {
      if (uuid) {
        isFavorite.value = checkIsFavorite(uuid)
      }
    }
    const handleToggleFavorite = (uuid) => {
      console.log('🔄 Клик по кнопке избранного для:', uuid)
      toggleFavorite(uuid)
      setTimeout(() => {
        checkFavoriteStatus(uuid)
      }, 50)
    }
    let resizeTimeout = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => { resizeTimeout = null }, 100)
    }
    onMounted(() => {
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize)
      }
      nextTick(() => checkFavoriteStatus(item.value.uuid))
    })
    watch(() => item.value.uuid, (newUuid) => {
      if (newUuid) {
        isFavorite.value = false
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
      toggleFavorite: handleToggleFavorite,
      translate,
    }
  }
}
</script>