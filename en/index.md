---
layout: home
hero:
  text: "IN GOODOLOGY"
  subtext: "you"
  actions:
    - theme: brand
      text: Посмотреть кошек
      link: /en/pets/cats
    - theme: brand
      text: Посмотреть собак
      link: /en/pets/dogs
---

## Cats
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Dogs
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Volunteers
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Shelters
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>