<template>
  <div class="hero-card">
    <!-- Мета-информация -->
    <div class="hero-meta">
      <span v-if="gender" class="tag gender-tag" :data-gender="gender">
        {{ gender }}
      </span>
      <span v-if="age" class="tag age-tag">
        {{ age }}
      </span>
      <span v-if="size" class="tag size-tag">
        {{ size }}
      </span>
    </div>

    <!-- Изображение -->
    <img 
      :src="image" 
      :alt="name" 
      class="hero-image"
      loading="lazy"
      @error="handleImageError"
    />

    <!-- Оверлей с именем -->
    <div class="hero-overlay">
      <h1 class="name">{{ name }}</h1>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
const getFrontmatter = () => {
  return frontmatter?.value || frontmatter || {}
}

const name = computed(() => getFrontmatter().title || 'Безымянный друг')
const gender = computed(() => getFrontmatter().gender || '')
const age = computed(() => getFrontmatter().age || '')
const size = computed(() => getFrontmatter().size || '')
const image = computed(() => getFrontmatter().image || '/placeholder-dog.svg')


// Обработчик ошибки загрузки изображения
const handleImageError = (e) => {
  e.target.src = '/placeholder-dog.svg'
  e.target.alt = 'Изображение временно недоступно'
}
</script>