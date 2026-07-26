import DefaultTheme from 'vitepress/theme'
import './index.css'
import { watch, onMounted, nextTick, provide } from 'vue'
import { useData, useRoute, useRouter } from 'vitepress'

import BlockStyle from '../components/BlockStyle.vue'
import CardHero from '../components/CardHero.vue'
import GalleryMedia from '../components/GalleryMedia.vue'
import ItemsGroup from '../components/ItemsGroup.vue'
import ItemsList from '../components/ItemsList.vue'
import ItemsRandom from '../components/ItemsRandom.vue'
import ItemsSelect from '../components/ItemsSelect.vue'
import PageStyle from '../components/PageStyle.vue'

export default {
  extends: DefaultTheme,
  setup() {
    const { lang, page } = useData()
    const route = useRoute()
    const router = useRouter()
    const supportedLangs = ['ru', 'en', 'de']
    const base = '/petly/'
    watch(
      () => lang.value,
      (newLang) => {
        if (newLang) {
          localStorage.setItem('vitepress-lang', newLang)
        }
      },
      { immediate: true }
    )
    onMounted(() => {
      const savedLang = localStorage.getItem('vitepress-lang')
      const currentLang = lang.value
      const currentPath = route.path
      let hasLang = false
      for (const l of supportedLangs) {
        if (currentPath.startsWith(`${base}${l}/`)) {
          hasLang = true
          break
        }
      }
      if (!hasLang && savedLang && supportedLangs.includes(savedLang)) {
        const newPath = `${base}${savedLang}/`
        router.go(newPath)
        return
      }
      if (savedLang && supportedLangs.includes(savedLang) && savedLang !== currentLang) {
        const currentPath = route.path
        const pathWithoutBase = currentPath.replace(base, '')
        const langPattern = new RegExp(`^${currentLang}/`)
        const cleanPath = pathWithoutBase.replace(langPattern, '') || '/'
        const newPath = `${base}${savedLang}/${cleanPath}`
        router.go(newPath)
      }
    })
    watch(
      () => route.path,
      (newPath) => {
        const doubleLangPattern = /\/(ru|en|de)\/(ru|en|de)\//
        if (doubleLangPattern.test(newPath)) {
          const pathWithoutBase = newPath.replace(base, '')
          const segments = pathWithoutBase.split('/')
          const correctLang = segments[0]
          const restPath = segments.slice(2).join('/')
          const correctPath = `${base}${correctLang}/${restPath}`
          localStorage.setItem('vitepress-lang', correctLang)
          nextTick(() => {
            router.go(correctPath)
          })
        }
        if (page.value?.isNotFound) {
          const currentPath = route.path
          const pathWithoutBase = currentPath.replace(base, '')
          const langFromUrl = pathWithoutBase.split('/')[0]
          if (langFromUrl && supportedLangs.includes(langFromUrl)) {
            localStorage.setItem('vitepress-lang', langFromUrl)
          }
          if (currentPath.includes('/ly/')) {
            const fixedPath = currentPath.replace('/ly/', '/')
            nextTick(() => {
              router.go(fixedPath)
            })
          }
        }
      },
      { immediate: true }
    )
    const switchLanguage = (newLang) => {
      if (newLang === lang.value) return
      localStorage.setItem('vitepress-lang', newLang)
      const currentPath = route.path
      const pathWithoutBase = currentPath.replace(base, '')
      const langPattern = new RegExp(`^${lang.value}/`)
      const cleanPath = pathWithoutBase.replace(langPattern, '') || '/'
      const newPath = `${base}${newLang}/${cleanPath}`
      router.go(newPath)
    }
    if (typeof window !== 'undefined') {
      window.__switchLanguage = switchLanguage
    }
    return {
      switchLanguage
    }
  },
  enhanceApp({ app }) {
    app.component('BlockStyle', BlockStyle)
    app.component('CardHero', CardHero)
    app.component('GalleryMedia', GalleryMedia)
    app.component('ItemsGroup', ItemsGroup)
    app.component('ItemsList', ItemsList)
    app.component('ItemsRandom', ItemsRandom)
    app.component('ItemsSelect', ItemsSelect)
    app.component('PageStyle', PageStyle)
  },
}