# PrettyPrinter for displaying Any JS

This is an alternative to `JSON.stringify()`.

It has two aims:
 
  - to make it easy to copy the actual result from a match failure when it's actually correct
  - to display the JS value (such as an object or array) in a compact fashion, respecting line width

## Differences from `JSON.stringify()`

 - Provides JS rather than JSON. This makes it easier to use the result.
 - Can specify the required line length and how compact the display is to be, from extremely compact to sparsely laid out.
   It uses a layout algorithm to do this. This aims to make the display readable, both for simple and complex/long displays.
 - Allows for objects of certain classes to be displayed in custom ways.
   This makes the display easier to read, and especially when an object has a large number of fields 
   that of no interest (eg, a `Moment`).
 - Handles self-referencing structures, and shows exactly what any self-reference refers to, as a path. 
   Not often needed, but very handy when it is.
 - Handles the display of mocks (or other specialised objects), by looking at a special symbol-based property 
  (the specific symbol is optionally specified to the constuctor)
 
# To Do

 - Should it handle BigInt and other standard library classes (eg, Map, Set, WeakMap, WeakSet, Promise)?
 - How about Iterators?
