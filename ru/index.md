---
layout: home
hero:
  text: "В ДОБРОЛОГИЯХ"
  subtext: "ты"
  actions:
    - theme: brand
      text: Посмотреть кошек
      link: /ru/pets/cats
    - theme: brand
      text: Посмотреть собак
      link: /ru/pets/dogs
---

## Кошки
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Собаки
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Волонтеры
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Приюты
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>