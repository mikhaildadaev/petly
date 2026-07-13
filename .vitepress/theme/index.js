import DefaultTheme from 'vitepress/theme'
import CardHumanHero from '../components/CardHumanHero.vue'
import CardPetHero from '../components/CardPetHero.vue'
import GalleryMedia from '../components/GalleryMedia.vue'
import ListHumans from '../components/ListHumans.vue'
import ListPets from '../components/ListPets.vue'
import SelectHumans from '../components/SelectHumans.vue'
import StyleImagePage from '../components/StyleImagePage.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CardHumanHero', CardHumanHero)
    app.component('CardPetHero', CardPetHero)
    app.component('GalleryMedia', GalleryMedia)
    app.component('ListHumans', ListHumans)
    app.component('ListPets', ListPets)
    app.component('SelectHumans', SelectHumans)
    app.component('StyleImagePage', StyleImagePage)
  }
}