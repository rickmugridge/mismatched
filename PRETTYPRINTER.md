# PrettyPrinter for displaying Any JS

This is an alternative to `JSON.stringify()`.

It aims to layout the JS object/value to make it convenient to read.
It tries to strike a balance between all being on one line and being spread out over many lines.
Either extreme can make it difficult to read.

It has three aims:
 
  - to make it easy to copy the actual result from a match failure when it's actually correct.
  - to display the JS value (such as an object or array) in a compact fashion, respecting line width.
  - to support diff-trees for showing difference with `mismatched` assertions.
  - to support the display of `thespian` mocks.
  - to support custom renderers

## Differences from `JSON.stringify()`

 - Provides JS rather than JSON. This makes it easier to use the result. Unlike with JSON, it shows values that are symbols.
 - You can specify the required line length and how compact the display is to be, from extremely compact to sparsely laid out.
   It uses a layout algorithm to do this. This aims to make the display readable, both for simple and complex/long displays.
 - Allows for objects of certain classes to be displayed in custom ways.
   This makes the display easier to read, and especially when an object has a large number of fields 
   that of no interest (eg, a `Moment`).
 - Handles self-referencing structures, and shows exactly what any self-reference refers to, as a path. 
   Not often needed, but very handy when it is.
 - Handles the display of mocks (or other specialised objects), by looking at a special symbol-based property 
  (the specific symbol is optionally specified to the constructor, such as by `thespian`).
  
## Custom Renderers

Some objects, such as a `moment`, have a large number of fields. 
These clutter up the display, when all we need to know is the UTC date string.

We can use customer renderers with `PrettyPrinter` to handle such cases. One or more can be registered.

A custom renderer is registered as follows, for example:
   - `PrettyPrinter.addCustomPrettyPrinter(match.instanceOf(MyClass), (myObject) => "MyObject()`)
   - The first argument is a matcher. In this example, we match on the class. We can use any matcher.
   - The second argument is a function that takes the object to be rendered and returns a string.
   
Unfortunately, `nodejs` seems to provide no mechanism which allows such renderers to be registered implicitly.
It's necessary to explicitly register them at the point of use. 
Define a function that registers them, and call this where needed. Eg:

```
export function registerPrettyPrinterCustomRenderers() {
    PrettyPrinter.addCustomPrettyPrinter(match.instanceOf(DateTime),
        (date: DateTime) => 'DateTime(' + date.toUtcString() + ')');
    PrettyPrinter.addCustomPrettyPrinter(match.instanceOf(DateOnly),
        (date: DateOnly) => 'DateOnly(' + date.toUtcString() + ')');
}
```
 
## To Do

 - Consider if it should handle Iterators, BigInt and other standard library classes and values 
    (eg, ArrayBuffer, Map, Set, WeakMap, WeakSet, Promise, Infinity, the typed arrays).
 - Document weirdness of Error - Error objects don't follow standard object protocols.
