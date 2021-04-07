# What is New (since Jan 2021)

## 30 March 2021

* Added and documented `match.enum()`

## 26 March 2021

* Documented `match.mapped()`
* Sometimes, it's difficult to match directly on an object or a part of it. This matcher allows the actual value to be
  mapped and the matcher is applied to the result.

* See [MappedMatcher](./MappedMatcher.md)

## 19 March 2021 (2.6.5)

* Added `match.decompiledActual(actual, contributors, enums)`. This provides a very useful form that can be used as the
  expected part in an `assertThat()`. It takes an actual result and replaces values within it by any contributors or
  enums used. A contributor is some value/object/array that was used as an input into testing some code.
  See [Decompiled Actual](./DecompiledActual.md) for an example to make sense of this.
* Added `match.uuid()` for matching a string containing a UUID.

## 12 March 2021

* When the actual and expected arrays are of different length, a full diff is provided.

## 5 March 2021

* `match.string.match()` can now take an argument of a string or a regular expression (eg, `match.string.match(/a.c/)`)
* When `match.string.match()` fails to match, and the strings are not short, it includes a diff on those strings to help
  see what's different.

## 28 February 2021

* Added `match.array.unordered()` and `match.array.unorderedContains()` to handle matching of arrays, disregarding
  order. There may be duplicate elements.
* See [Array Matchers](./ArrayMatchers.md)

## 27 February 2021

* Generalised `match.bind()` to:
    * Take an optional matcher argument, which then has to match the first use
    * Once it matches once, it builds a matcher from that, to match subsequent uses. This allows it to bind and then
      match objects/arrays.
    * See [Binding Matcher](./BindingMatcher.md)

[Home](./README.md)