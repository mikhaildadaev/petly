---
layout: home
hero:
  name: "IN GUTER WISSENSCHAFT"
  highlight: "- du"
  cards:
    - icon: 🐱
      title: 'Katzen'
      description: '...'
      link: '/de/pets/cats'
    - icon: 🐶
      title: 'Hunde'
      description: '...'
      link: '/de/pets/dogs'
---

<HomeStyle/>

## Katzen
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Hunde
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Freiwillige
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Tierheime
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>