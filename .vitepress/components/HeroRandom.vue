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

<style scoped>
.random-hero {
  margin: 40px -24px 0;
  background: var(--vp-c-bg);
}
.random-hero .container {
  display: grid;
  grid-template-columns: auto minmax(312px, 1fr);
  margin: 0 auto;
  background: var(--vp-c-bg-soft);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.3s ease;
}
.random-hero .container .meta {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 14px;
  margin-bottom: 0.8rem;
}
.random-hero .container .media {
  position: relative;
  overflow: hidden;
  min-height: 380px;
}
.random-hero .container .media picture {
  display: block;
  width: 100%;
  height: 100%;
}
.random-hero .container .media .img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.random-hero .container .content {
  margin: 0 0 0 -24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--vp-c-bg-soft);
  border-radius: var(--radius);
  z-index: 1;
}
.random-hero .container .content .actions {
  margin-top: auto;
}
.random-hero .container .content .name {
  font-size: 32px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
  font-family: var(--vp-font-family-print);
}
.random-hero .container .content .description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 0 20px;
}
.random-hero .container .content .hero-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}
.random-hero .container .content .hero-button.primary {
  background: var(--vp-c-brand-1);
  color: white;
}
.random-hero .container .content .hero-button.primary:hover {
  background: var(--vp-c-brand-2);
}
.random-hero .container .content .hero-button .button-arrow {
  font-size: 18px;
  transition: transform 0.3s ease;
}
.random-hero .container .content .hero-button.primary:hover .button-arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .random-hero .container {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .random-hero .container .media {
    min-height: 240px;
  }
  .random-hero .container .content {
    margin: -24px 0 0;
    padding: 24px;
  }
}
</style>