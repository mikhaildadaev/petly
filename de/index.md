---
layout: home
---

<MainSlider :type="'general'"/>

## Hunde
<ItemsRandom :type="'pets'" :item-type="'dogs'"/>

## Katzen
<ItemsRandom :type="'pets'" :item-type="'cats'"/>

## Tierheime
<ItemsRandom :type="'organizations'" :item-type="'shelters'"/>

## Unterstützen
<MainBlock :type="'support'"/>

## Freiwillige
<ItemsRandom :type="'humans'" :item-type="'volunteers'"/>

## Mitmachen
<MainBlock :type="'join'"/>