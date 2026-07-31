<template>
  <section v-if="hasCards" class="home-section">
    <div class="container">
      <!-- Заголовок -->
      <div class="header">
        <div class="name">{{ name }}</div>
        <div class="highlight">{{ highlight }}</div>
      </div>
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
const name = computed(() => home.value?.name || '')
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
  margin: 0 -24px;
  padding: 24px 0;
  background: var(--vp-c-bg-soft);
  border-radius: var(--radius)
}
.home-section .container {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}
.home-section .container .header .name {
  font-family: var(--vp-font-family-print);
  font-size: clamp(28px, 6vw, 56px);
  font-weight: 700;
  box-sizing: border-box;
  color: var(--vp-c-text-1);
  text-align: center;
  animation: moveRigth 0.6s ease forwards;
}
.home-section .container .header .highlight {
  font-family: var(--vp-font-family-write);
  font-size: clamp(56px, 12vw, 112px);
  font-weight: 700;
  padding-right: 48px;
  box-sizing: border-box;
  color: var(--vp-c-brand-1);
  text-align: right;
  animation: moveLeft 0.6s ease forwards;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
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
  .home-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes moveLeft {
  from { transform: translateX(48px); }
  to { transform: translateX(0); }
}
@keyframes moveRight {
  from { transform: translateX(-48px); }
  to { transform: translateX(0); }
}
</style>