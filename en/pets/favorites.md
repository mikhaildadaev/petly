---
title: Favorites
description: Pets that have won your heart, whose photos you rewatch several times. Those whom you have already mentally named as your own.
blocks:
  - type: 'intro'
    title: '«The heart is an amazing thing. It doesn’t ask who you are, where you are, or why. It just starts beating faster when it sees those very eyes, that very smile, that very look that makes you feel warm inside.»'
  - type: 'rects'
    list: 
      - name: 'Your personal corner'
        description: 'The heart is an amazing thing. It does not ask who you are, where you are or why. It just starts beating faster when it sees those eyes, that smile, that look that makes you feel so warm inside. This section is your own personal space. Only those who have already touched something inside you live here. Those whose photos you look through again and again. Those you have already called your own in your mind. Come back to them. Browse through the cards. Maybe today you will decide: «This is my pet.»'
---

# Favorites
<BlockStyle :type="'intro'"/>
<ItemsSelect :type="'pets'" :item-type="'dogs'"/>
<ItemsSelect :type="'pets'" :item-type="'cats'"/>
<BlockStyle :type="'rects'"/>

<PageStyle/>