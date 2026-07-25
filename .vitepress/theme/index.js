import DefaultTheme from 'vitepress/theme'
import { provide } from 'vue'

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