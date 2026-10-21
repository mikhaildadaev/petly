---
layout: home
---

<MainSlider :type="'general'"/>

## Собаки
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Кошки
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Приюты
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>

## Поддержать
<MainBlock :type="'support'"/>

## Волонтеры
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Присоединиться
<MainBlock :type="'join'"/>