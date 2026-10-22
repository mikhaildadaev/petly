<template>
  <section v-if="items && items.length" class="main-block">
    <div v-for="(item, index) in items" :key="index" class="main-item">
      <img v-if="item.img" :src="item.img" :alt="item.name" class="image" loading="lazy"/>
      <div class="text">
        <h1 class="name">{{ item.name }}</h1>
        <p class="description">{{ item.description }}</p>
        <a v-if="item.link" :href="item.link" class="link">{{ translate('ui', 'Подробнее')}} →</a>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { useTranslate, useAge, useAgePetCategory, useDirection, useExperience } from '../utils/useTranslate'

export default {
  name: 'MainBlock',
  props: {
    type: { type: String, required: true }
  },
  setup(props) {
    const { lang, frontmatter } = useData()
    const translate = (category, key) => useTranslate(lang.value, category, key)
    const items = computed(() => {
      const mainArray = frontmatter.value?.main || []
      const block = mainArray.find(item => item.type === props.type)
      return block ? block.list : []
    })
    return {
      items,
      translate
    }
  }
}
</script>