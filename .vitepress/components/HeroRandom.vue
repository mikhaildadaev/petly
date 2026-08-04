<template>
  <section v-if="item" class="random-hero">
    <div class="container">
      <div class="meta">
        <template v-for="displayField in config.fields.display" :key="displayField">
          <label v-if="item && item[displayField]" :class="`tag ${displayField.replace('Display', '')}-tag`">{{ item[displayField] }}</label>
        </template>
      </div>
      <div class="aspect-hero media">
        <picture>
          <source :srcset="item.imageVertical" media="(max-width: 735px)" />
          <source :srcset="item.imageHorizontal" media="(min-width: 736px)" />
          <img :src="item.imageHorizontal" class="img" :alt="item.title" loading="lazy" />
        </picture>
      </div>
      <div class="content">
        <h1 class="title">{{ item.title || '' }}</h1>
        <div class="description">{{ item.description || '' }}</div>
        <div class="actions">
          <a :href="getItemLink(item)" class="hero-button primary">Узнать историю<span class="button-arrow">→</span></a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useData } from 'vitepress'
import { useConfigItem } from '../utils/useConfigItem'
import { useRandomArray } from '../utils/useRandomArray'
import { useUrlMedia } from '../utils/useUrlMedia'

export default {
  name: 'HeroRandom',
  props: {
    type: { type: String, required: true },
  },
  setup(props) {
    const { lang } = useData()
    const config = useConfigItem[props.type] || useConfigItem['pets']
    const baseUrl = import.meta.env.BASE_URL
    const translate = (category, key) => key
    const item = ref(null)
    const isLoading = ref(true)
    const error = ref(null)
    const transformItem = (data, subtype = '') => {
      const transformed = config.transform ? config.transform(data, lang.value, translate) : {}
      const base = {
        uuid: data.uuid,
        title: data.title || '',
        description: data.description || '',
        covenantID: data.covenantID || '',
        type: props.type,
        subtype: subtype,
        imageHorizontal: useUrlMedia(data.imageHorizontal, 'image'),
        imageVertical: useUrlMedia(data.imageVertical, 'image'),
        filter: data.filter || [],
        ...transformed
      }
      return base
    }
    const loadRandomPet = async () => {
      try {
        isLoading.value = true
        error.value = null
        const indexRes = await fetch(`${baseUrl}data/index.json`)
        if (!indexRes.ok) throw new Error('Failed to load index.json')
        const index = await indexRes.json()
        const files = index.filter(item => 
          item.type === props.type && item.lang === lang.value
        )
        if (files.length === 0) {
          item.value = null
          return
        }
        const results = await Promise.allSettled(
          files.map(async ({ path, subtype }) => {
            const res = await fetch(`${baseUrl}${path}`)
            if (!res.ok) throw new Error(`Failed to load ${path}`)
            const data = await res.json()
            return data.map(item => transformItem(item, subtype))
          })
        )
        const allItems = results
          .filter(r => r.status === 'fulfilled')
          .flatMap(r => r.value)
        if (allItems.length === 0) {
          item.value = null
          return
        }
        const shuffled = useRandomArray(allItems)
        item.value = shuffled[0]
      } catch (err) {
        console.error('❌ Ошибка:', err)
        error.value = err.message
        item.value = null
      } finally {
        isLoading.value = false
      }
    }
    const getItemLink = (item) => {
      const subtype = item.subtype || 'pets'
      if (item.covenantID) {
        return `${baseUrl}${lang.value}/${props.type}/${item.covenantID}/${subtype}/${item.uuid}`
      }
      return `${baseUrl}${lang.value}/${props.type}/${subtype}/${item.uuid}`
    }
    onMounted(() => {
      loadRandomPet()
    })
    watch(lang, () => {
      loadRandomPet()
    })
    return {
      config,
      item,
      isLoading,
      error,
      getItemLink
    }
  }
}
</script>