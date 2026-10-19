---
layout: home
hero:
  name: 'IN GUTER WISSENSCHAFT'
  highlight: '- du'
---

<HomeStyle :type="'pets'"/>

## Hunde
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Katzen
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Tierheime
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>

## Freiwillige
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>