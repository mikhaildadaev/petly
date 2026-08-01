<template>
  <section v-if="pet" class="random-hero">
    <div class="container">
      <div class="hero-card">
        <div class="hero-image">
          <picture>
            <source 
              :srcset="getImageUrl(pet.imageVertical, 'image')" 
              media="(max-width: 735px)"
            />
            <source 
              :srcset="getImageUrl(pet.imageHorizontal || pet.imageVertical, 'image')" 
              media="(min-width: 736px)"
            />
            <img 
              :src="getImageUrl(pet.imageHorizontal || pet.imageVertical, 'image')" 
              :alt="pet.title" 
              loading="lazy"
            />
          </picture>
        </div>
        <div class="hero-content">
          <div class="hero-tags">
            <span v-for="tag in petTags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <h2 class="hero-name">{{ pet.title || 'Без имени' }}</h2>
          <p class="hero-description">{{ pet.description || '' }}</p>
          <div class="hero-actions">
            <a :href="getItemLink(pet)" class="hero-button primary">
              Узнать историю
              <span class="button-arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <div v-else-if="!isLoading" class="hero-debug">
    <p>🔍 Отладка:</p>
    <p>isLoading: {{ isLoading }}</p>
    <p>pet: {{ pet ? 'есть' : 'null' }}</p>
    <p v-if="error" style="color: red;">❌ Ошибка: {{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useData } from 'vitepress'
import { useConfigItem } from '../utils/useConfigItem'
import { useRandomArray } from '../utils/useRandomArray'
import { useUrlMedia } from '../utils/useUrlMedia'

const { lang } = useData()
const config = useConfigItem['pets']
const baseUrl = import.meta.env.BASE_URL

const pet = ref(null)
const isLoading = ref(true)
const error = ref(null)

// ⭐ Функция для обработки изображений
const getImageUrl = (url, type = 'image') => {
  return useUrlMedia(url, type)
}

const loadRandomPet = async () => {
  try {
    isLoading.value = true
    error.value = null

    const catsUrl = `${baseUrl}data/pets-${lang.value}-cats.json`
    const dogsUrl = `${baseUrl}data/pets-${lang.value}-dogs.json`

    const [catsRes, dogsRes] = await Promise.all([
      fetch(catsUrl),
      fetch(dogsUrl)
    ])

    const catsData = catsRes.ok ? await catsRes.json() : []
    const dogsData = dogsRes.ok ? await dogsRes.json() : []

    const allPets = [...catsData, ...dogsData]

    if (allPets.length === 0) {
      pet.value = null
      return
    }

    const shuffled = useRandomArray(allPets)
    pet.value = shuffled[0]

  } catch (err) {
    console.error('❌ Ошибка:', err)
    error.value = err.message
    pet.value = null
  } finally {
    isLoading.value = false
  }
}

const petTags = computed(() => {
  if (!pet.value) return []
  const tags = []
  const filter = pet.value.filter || []
  const gender = filter.find(f => f.gender)?.gender
  const age = filter.find(f => f.age)?.age
  const size = filter.find(f => f.size)?.size
  if (gender) tags.push(gender)
  if (age) tags.push(age)
  if (size) tags.push(size)
  return tags
})

const getItemLink = (item) => {
  const basePath = config.linkPath(item)
  
  if (item.covenantID) {
    return `${baseUrl}${lang.value}${basePath}${item.covenantID}/pets/${item.uuid}`
  }
  
  return `${baseUrl}${lang.value}${basePath}pets/${item.uuid}`
}

onMounted(() => {
  loadRandomPet()
})

watch(lang, () => {
  loadRandomPet()
})
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

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.hero-image picture {
  width: 100%;
  height: 100%;
}

.hero-image picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-card:hover .hero-image img {
  transform: scale(1.03);
}

.hero-content {
  padding: 32px 32px 32px 0;
  display: flex;
  border-radius: var(--radius);
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