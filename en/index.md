---
layout: home
hero:
  name: "IN GOODOLOGY"
  highlight: "- you"
  cards:
    - icon: 🐱
      title: 'Cats'
      description: '...'
      link: '/en/pets/cats'
    - icon: 🐶
      title: 'Dogs'
      description: '...'
      link: '/en/pets/dogs'
---

<HomeStyle/>

## Cats
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Dogs
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Volunteers
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Shelters
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>