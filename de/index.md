---
layout: home
main:
  - type: 'general'
    list:
      - name: 'Überschrift 1'
        description: 'Die Beschreibung 1'
        link: 'Der Link 1'
      - name: 'Überschrift 2'
        description: 'Die Beschreibung 2'
        link: 'Der Link 1'
  - type: 'join'
    list:
      - name: 'Überschrift'
        description: 'Die Beschreibung'
        link: 'Der Link'
  - type: 'support'
    list:
      - name: 'Überschrift'
        description: 'Die Beschreibung'
        link: 'Der Link'
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