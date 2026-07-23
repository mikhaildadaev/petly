import DefaultTheme from 'vitepress/theme'
import { provide } from 'vue'

import CardHumanHero from '../components/CardHumanHero.vue'
import CardOrganizationHero from '../components/CardOrganizationHero.vue'
import CardPetHero from '../components/CardPetHero.vue'
import GalleryMedia from '../components/GalleryMedia.vue'
import ListHumans from '../components/ListHumans.vue'
import ListOrganizations from '../components/ListOrganizations.vue'
import ListPets from '../components/ListPets.vue'
import RandomHumans from '../components/RandomHumans.vue'
import RandomOrganizations from '../components/RandomOrganizations.vue'
import RandomPets from '../components/RandomPets.vue'
import SelectHumans from '../components/SelectHumans.vue'
import SelectOrganizations from '../components/SelectOrganizations.vue'
import SelectPets from '../components/SelectPets.vue'
import StyleBlockPage from '../components/StyleBlockPage.vue'
import StyleImagePage from '../components/StyleImagePage.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CardHumanHero', CardHumanHero)
    app.component('CardOrganizationHero', CardOrganizationHero)
    app.component('CardPetHero', CardPetHero)
    app.component('GalleryMedia', GalleryMedia)
    app.component('ListHumans', ListHumans)
    app.component('ListOrganizations', ListOrganizations)
    app.component('ListPets', ListPets)
    app.component('RandomHumans', RandomHumans)
    app.component('RandomOrganizations', RandomOrganizations)
    app.component('RandomPets', RandomPets)
    app.component('SelectHumans', SelectHumans)
    app.component('SelectOrganizations', SelectOrganizations)
    app.component('SelectPets', SelectPets)
    app.component('StyleBlockPage', StyleBlockPage)
    app.component('StyleImagePage', StyleImagePage)
  },
}