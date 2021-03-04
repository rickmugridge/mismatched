# What is New (since Jan 2021)

## 5 March 2021

 * `match.string.match()` can now take an argument of a string or a regular expression (eg, `match.string.match(/a.c/)`)
 * When `match.string.match()` fails to match, and the strings are not short, 
   it includes a diff on those strings to help see what's different.

## 28 February 2022

 * Added `match.array.unordered()` and `match.array.unorderedContains()` to handle matching of arrays, disregarding order.
  There may be duplicate elements.
 * See [Array Matchers](./ArrayMatchers.md)

## 27 February 2021

 * Generalised `match.bind()` to:
   * Take an optional matcher argument, which then has to match the first use
   * Once it matches once, it builds a matcher from that, to match subsequent uses. 
     This allows it to bind and then match objects/arrays.
   * See [Binding Matcher](./BindingMatcher.md)



[Home](./README.md)