# Why and How PrettyPrinter Works

`PrettyPrinter` aims to avoid the downsides of using `JSON.stringify()`.

## Example of Why

For example, consider the following value:
```typescript
const value = [
    1000001, 1000002, 1000003, 1000004,
    1000001, 1000002, 1000003, 1000004,
    1000001, 1000002, 1000003, 1000004,
    1000001, 1000002, 1000003, {was: 1000004, expected: 100005}
];
```

This is rendered compactly with JSON.stringify(value) (with an added new-line) as:
```json
[1000001,1000002,1000003,1000004,1000001,1000002,1000003,1000004,1000001,1000002,1000003,1000004,1000001,1000002,
  1000003,{"was":1000004,"expected":100005}]
```

But, in general, that can be hard to read as it gets more complex. 
We can lay it out better with `JSON.stringify(value, undefined, 4)`, giving:

```json
[
  1000001,
  1000002,
  1000003,
  1000004,
  1000001,
  1000002,
  1000003,
  1000004,
  1000001,
  1000002,
  1000003,
  1000004,
  1000001,
  1000002,
  1000003,
  {
    "was": 1000004,
    "expected": 100005
  }
]
```

But this layout can take a lot of vertical space, when the array (or object) won't fit on a single line.

Instead, `PrettyPrinter` makes it more compact, but limits how much textual detail can be included on any line.
This aims to approximate how easy/hard it is for a person to read the line:

```
[
  1000001, 1000002, 1000003, 1000004, 1000001, 1000002, 1000003, 1000004, 
  1000001, 1000002, 1000003, 1000004, 1000001, 1000002, 1000003, 
  {was: 1000004, expected: 100005}
]
```

It also includes extra capability, such as not quoting field names, displaying symbol field names, symbol values, etc.

## How it Works

`PrettyPrinter` rendering layout is configured by two values that affect the amount of text on any line:
 * `lineWidth` - the width of a line
 * `maxComplexity` - which limits how much textual detail (defined below) is allowed on a line. 
 If this is very large, it has no impact, as the `lineWidth` dictates the layout.

The complexity is a rough measure of how much detail the tokens (numbers, string, punctuation) contribute to a line.

The JS value is recursively walked over to convert tokens into `tiles`.
Strings, numbers and other simple values are managed with a `SimpleToken`.
Each token is assigned a textual length and a complexity value.
For example, the length and complexity of a string, boolean or number is dependent on the length 
of the (rendered) string.

Arrays and objects are managed by `ArrayTiles` and `ObjectTiles` respectively, each containing sub-tiles.
Their length and complexity is computed from those values of sub-tiles, plus allowance for extra punctuation, 
such as "[]", ",", ":", "{}".

The layout algorithm walks over those recursive tokens, respecting the configured values as it renders the JS value.

## Notes

* It allows for self-referential JS values, a flaw with `JSON.stringify()`.
* It can be configured to render objects of specific classes in a customised way.
* To support `thespian` mocks, it can also render function calls.
* This general layout approach could also be used for pretty printing code.
Tools like Prettify suffer from layout issues comparable to formatted JSON (too wide or too long).