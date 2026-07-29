<template>
  <div class="redirect">
    <div class="container" :class="statusClass">
      <!-- Круговой лоадер -->
      <div class="loader-wrapper">
        <svg class="loader" viewBox="0 0 50 50">
          <circle class="bg" cx="25" cy="25" r="20" />
          <circle 
            class="progress-ring" 
            cx="25" 
            cy="25" 
            r="20"
            :style="{ strokeDashoffset: 125.6 - (125.6 * progress) / 100 }"
          />
        </svg>
        <span class="loader-text">{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const progress = ref(0)
const statusClass = ref('')
const redirectUrl = ref('')
let progressInterval = null

// Функция для плавного обновления прогресса к цели
const animateToProgress = (target, duration = 800) => {
  return new Promise((resolve) => {
    const start = progress.value
    const diff = target - start
    const startTime = Date.now()
    
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
    
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 2)
      progress.value = Math.round(start + diff * eased)
      
      if (t >= 1) {
        progress.value = target
        clearInterval(progressInterval)
        progressInterval = null
        resolve()
      }
    }, 16)
  })
}

// Функция для обновления статуса с анимацией прогресса
const updateStatusWithProgress = async (cls, progressTarget, delay = 800) => {
  return new Promise((resolve) => {
    statusClass.value = cls
    animateToProgress(progressTarget, delay)
    setTimeout(() => {
      resolve()
    }, delay)
  })
}

// Основная логика перенаправления
const performRedirect = async () => {
  const base = '/petly/'
  const url = new URL(window.location.href)
  const path = window.location.pathname

  const langMatch = path.match(/^\/petly\/([a-z]{2})(?:\/|$)/)
  if (langMatch) {
    await updateStatusWithProgress('status-success', 100, 1500)
    const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
    setTimeout(() => {
      window.location.href = `${base}${savedLang}/`
    }, 500)
    return
  }

  const shortCode = url.searchParams.get('s')

  if (shortCode && shortCode.length > 5) {
    try {
      await updateStatusWithProgress('status-loading', 30, 1000)
      
      const indexResponse = await fetch('/petly/data/index.json')
      const index = await indexResponse.json()

      await updateStatusWithProgress('status-loading', 60, 1000)

      const results = await Promise.allSettled(
        index.map(async ({ file, type, subtype }) => {
          const response = await fetch(`/petly/data/${file}`)
          if (!response.ok) throw new Error(`Failed to load ${file}`)
          const data = await response.json()
          return data.map(item => ({ ...item, _type: type, _subtype: subtype }))
        })
      )

      const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)

      await updateStatusWithProgress('status-loading', 85, 1000)

      const item = allItems.find(p => p.short === shortCode)

      if (item) {
        const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
        let redirectPath = `/${savedLang}/${item._type}/${item._subtype}/${item.uuid}`
        if (item.covenantID) {
          redirectPath = `/${savedLang}/${item._type}/${item.covenantID}/${item._subtype}/${item.uuid}`
        }
        redirectUrl.value = `${base}${redirectPath}`
        
        await updateStatusWithProgress('status-success', 100, 1500)
        await new Promise(resolve => setTimeout(resolve, 500))
        window.location.href = redirectUrl.value
      } else {
        await updateStatusWithProgress('status-error', 100, 1500)
        await new Promise(resolve => setTimeout(resolve, 500))
        const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
        window.location.href = `${base}${savedLang}/`
      }
    } catch (error) {
      await updateStatusWithProgress('status-error', 100, 1500)
      await new Promise(resolve => setTimeout(resolve, 500))
      const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
      window.location.href = `${base}${savedLang}/`
    }
  } else {
    await updateStatusWithProgress('status-loading', 100, 1500)
    await new Promise(resolve => setTimeout(resolve, 300))
    const savedLang = localStorage.getItem('vitepress-lang') || 'ru'
    window.location.href = `${base}${savedLang}/`
  }
}

onMounted(() => {
  performRedirect()
})
</script>

<style scoped>
.redirect {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg, #fdfaf6);
  z-index: 9999;
}

.container {
  max-width: 380px;
  width: 90%;
  padding: 48px 32px 40px;
  text-align: center;
}

/* Круговой лоадер */
.loader-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
}

.loader {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.loader .bg {
  fill: none;
  stroke: var(--vp-c-border, #e0d5c5);
  stroke-width: 3;
}

.loader .progress-ring {
  fill: none;
  stroke: var(--vp-c-brand, #e67e22);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 125.6;
  stroke-dashoffset: 125.6;
  transition: stroke-dashoffset 0.3s ease;
}

.container.status-success .progress-ring {
  stroke: #4ade80;
}

.container.status-error .progress-ring {
  stroke: #f87171;
}

.loader-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text, #3e3232);
}
</style>