<template>
  <section v-if="hasCards" class="home-section">
    <div class="container">
      <!-- Заголовок -->
      <h2 class="home-title">
        {{ title }} <span class="highlight">{{ highlight }}</span>
      </h2>
      <!-- Карточки -->
      <div class="home-grid">
        <div v-for="(card, index) in cards" :key="index" class="home-card" @click="navigateTo(card.link)">
          <div class="card-icon">{{ card.icon }}</div>
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-desc">{{ card.description }}</p>
          <span class="card-arrow">→</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

// Безопасное получение данных
const home = computed(() => frontmatter.value?.home || {})
const title = computed(() => home.value?.title || '')
const highlight = computed(() => home.value?.highlight || '')
const cards = computed(() => home.value?.cards || [])
const hasCards = computed(() => cards.value && cards.value.length > 0)

const navigateTo = (link) => {
  if (typeof window !== 'undefined' && link) {
    window.location.href = link
  }
}
</script>

<style scoped>
.home-section {
  padding: 60px 0;
  background: var(--vp-c-bg);
}

.container {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}

.home-title {
  font-size: 42px;
  font-weight: 700;
  text-align: center;
  color: var(--vp-c-text-1);
  margin-bottom: 48px;
  letter-spacing: -0.02em;
}

.highlight {
  color: var(--vp-c-brand-1);
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.home-card {
  background: var(--vp-c-bg-soft);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  border: 1px solid var(--vp-c-border);
  transition: all 0.3s ease;
  cursor: pointer;
}

.home-card:hover {
  transform: translateY(-6px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
}

.card-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--vp-c-text-1);
}

.card-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin: 0 0 16px;
  line-height: 1.4;
}

.card-arrow {
  display: inline-block;
  font-size: 24px;
  color: var(--vp-c-brand-1);
  transition: transform 0.3s ease;
}

.home-card:hover .card-arrow {
  transform: translateX(6px);
}

@media (max-width: 768px) {
  .home-title {
    font-size: 30px;
  }
  
  .home-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .home-card {
    padding: 24px 20px;
  }
}
</style>