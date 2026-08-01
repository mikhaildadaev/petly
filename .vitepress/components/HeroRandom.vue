<template>
  <section v-if="item" class="random-hero">
    <div class="container">
      <div class="hero-card">
        <div class="aspect-hero hero-image">
          <picture>
            <source :srcset="item.imageVertical" media="(max-width: 735px)" />
            <source :srcset="item.imageHorizontal" media="(min-width: 736px)" />
            <img :src="item.imageHorizontal" class="hero-image-img" :alt="item.title" loading="lazy" />
          </picture>
        </div>
        <div class="hero-content">
          <div class="hero-tags">
            <span v-for="tag in petTags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <h2 class="hero-name">{{ item.title || '' }}</h2>
          <p class="hero-description">{{ item.description || '' }}</p>
          <div class="hero-actions">
            <a :href="getItemLink(item)" class="hero-button primary">
              Узнать историю
              <span class="button-arrow">→</span>
            </a>
          </div>
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
        ...(config.transform ? config.transform(data, lang.value, translate) : {})
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
        error.value = err.message
        item.value = null
      } finally {
        isLoading.value = false
      }
    }
    const petTags = computed(() => {
      if (!item.value) return []
      const tags = []
      const filter = item.value.filter || []
      const gender = filter.find(f => f.gender)?.gender
      const age = filter.find(f => f.age)?.age
      const size = filter.find(f => f.size)?.size
      if (gender) tags.push(gender)
      if (age) tags.push(age)
      if (size) tags.push(size)
      return tags
    })
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
      item,
      isLoading,
      error,
      petTags,
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
.container {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}
.hero-badge {
  display: inline-block;
  padding: 4px 16px;
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  background: rgba(230, 126, 34, 0.1);
  border-radius: 20px;
  letter-spacing: 0.02em;
}
.hero-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  background: var(--vp-c-bg-soft);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--vp-c-border);
  transition: border-color 0.3s ease;
}
.hero-card:hover {
  border-color: var(--vp-c-brand-1);
}
.hero-image {
  position: relative;
  overflow: hidden;
  min-height: 380px;
}
.hero-image picture {
  display: block;
  width: 100%;
  height: 100%;
}
.hero-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.hero-card:hover .hero-image-img {
  transform: scale(1.03);
}
.hero-content {
  padding: 32px 32px 32px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.hero-tags .tag {
  display: inline-block;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border-radius: 20px;
  border: 1px solid var(--vp-c-border);
}
.hero-name {
  font-size: 32px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
  font-family: var(--vp-font-family-print);
}
.hero-description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0 0 20px;
}
.hero-actions {
  margin-top: auto;
}
.hero-button {
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
.hero-button.primary {
  background: var(--vp-c-brand-1);
  color: white;
}
.hero-button.primary:hover {
  background: var(--vp-c-brand-2);
}
.button-arrow {
  font-size: 18px;
  transition: transform 0.3s ease;
}
.hero-button.primary:hover .button-arrow {
  transform: translateX(4px);
}
.hero-loading {
  padding: 40px;
  text-align: center;
  color: var(--vp-c-text-2);
}
.hero-debug {
  padding: 40px;
  margin: 20px;
  background: var(--vp-c-bg-soft);
  border: 2px dashed var(--vp-c-border);
  border-radius: 12px;
  text-align: center;
}
.hero-debug p {
  margin: 8px 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .hero-card {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .hero-image {
    min-height: 240px;
  }
  .hero-content {
    padding: 24px;
  }
  .hero-name {
    font-size: 24px;
  }
}
</style>