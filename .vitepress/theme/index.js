import DefaultTheme from 'vitepress/theme'
import { provide } from 'vue'

import BlockStyle from '../components/BlockStyle.vue'
import CardHumanHero from '../components/CardHumanHero.vue'
import CardOrganizationHero from '../components/CardOrganizationHero.vue'
import CardPetHero from '../components/CardPetHero.vue'
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
    app.component('CardHumanHero', CardHumanHero)
    app.component('CardOrganizationHero', CardOrganizationHero)
    app.component('CardPetHero', CardPetHero)
    app.component('GalleryMedia', GalleryMedia)
    app.component('ItemsGroup', ItemsGroup)
    app.component('ItemsList', ItemsList)
    app.component('ItemsRandom', ItemsRandom)
    app.component('ItemsSelect', ItemsSelect)
    app.component('PageStyle', PageStyle)
  },
}