<template>
  <div class="aspect-card hero-card">
    <div class="hero-meta">
      <span v-if="gender" class="tag gender-tag" :data-gender="gender">{{ gender }}</span>
      <span v-if="age" class="tag age-tag">{{ age }}</span>
      <span v-if="size" class="tag size-tag">{{ size }}</span>
    </div>
    <img :src="image" :alt="name" class="hero-image" loading="lazy" @error="handleImageError"/>
    <div class="hero-overlay">
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
const gender = computed(() => fm.value.gender || '')
const age = computed(() => fm.value.age || '')
const size = computed(() => fm.value.size || '')
const image = computed(() => fm.value.image || '/placeholder-dog.svg')

// Обработчик ошибки загрузки изображения
const handleImageError = (e) => {
  e.target.src = '/placeholder-dog.svg'
  e.target.alt = 'Изображение временно недоступно'
}
</script>