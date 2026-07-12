<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <span v-if="direction" class="tag direction-tag">{{ direction }}</span>
      <span v-if="experience" class="tag experience-tag">{{ experience }}</span>
    </div>
    <img :src="image" :alt="name" class="hero-image" loading="lazy" @error="handleImageError"/>
    <div class="hero-overlay glass">
      <div class="name">{{ name }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  petType: {
    type: String,
    required: false,
    default: 'dogs'
  }
})
const { frontmatter } = useData()

// Безопасное получение frontmatter
const fm = computed(() => frontmatter?.value || frontmatter || {})

const name = computed(() => fm.value.title || 'Безымянный друг')
const direction = computed(() => fm.value.direction || '')
const experienceRaw = computed(() => fm.value.experience || '')
const image = computed(() => fm.value.image || '/placeholder-dog.svg')

// === ПРЕОБРАЗОВАНИЕ ОПЫТА В УРОВЕНЬ ===
const experience = computed(() => {
  const exp = experienceRaw.value.toLowerCase()
  
  // Проверяем ключевые слова
  if (exp.includes('эксперт')) return 'Эксперт'
  if (exp.includes('опытный')) return 'Опытный'
  if (exp.includes('начинающий')) return 'Начинающий'
  
  // Проверяем числа
  const years = parseInt(exp.match(/(\d+)/)?.[0] || '0')
  if (years === 0) return 'Нет опыта'
  if (years <= 1) return 'Начинающий'
  if (years <= 3) return 'Опытный'
  return 'Эксперт'
})

// Обработчик ошибки загрузки изображения
const handleImageError = (e) => {
  e.target.src = '/placeholder-dog.svg'
  e.target.alt = 'Изображение временно недоступно'
}
</script>