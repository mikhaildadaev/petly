---
layout: home
hero:
  text: "IN GUTER WISSENSCHAFT"
  subtext: "du"
  actions:
    - theme: brand
      text: Посмотреть кошек
      link: /de/pets/cats
    - theme: brand
      text: Посмотреть собак
      link: /de/pets/dogs
---

## Katzen
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Hunde
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Freiwillige
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Tierheime
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>