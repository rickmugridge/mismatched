# What is New (since Jan 2021)

## 17 December 2021

* Can now match JS objects with self-references (cycles).

## 26 November 2021

* Documented `assertThat().throwsError()` in [assertThat](./ASSERTTHAT.md) and [FAQ](./FAQ.md).
* Added maximum size for objects etc. in PrettyPrinter to avoid heap overflow.

## 19 November 2021

* Allowed use of `.is()` as well as `.satisfies()` for `validateThat()` checks.
* Improved error messages for array validation.

## 31 October 2021

* Extended the [FAQ](./FAQ.md) considerably, including [Custom Matchers](./CustomMatchers.md)and [DecompiledActual](./DecompiledActual.md)
* Added  [MismatchedAtWork](./MismatchedAtWork.md)
* Revised the algorithms for matching arrays:
  * Used fast-diff for all matching
* Revised the algorithms for matching sets and unordered arrays (bags):
  * Used a new algorithm, based on the "complexity" of the matchers, which aims to measure how constrained a matcher is.
  * The matchers are tried from most constrained to least, to try and find the best overall match
* For both of these algorithm changes:
  * Takes account of `match.object.keys()` in matching. If the key matches:
    * The whole is considered to matched (even if there are other differences)
    * Those differences are displayed in the final result
  * Now a `match.bind()` only binds once the actual/expected have been matched up

## 5 June 2021

* Added `match.object.key()` to improve diffs and to narrow down `validateThat` errors when matching subtypes with `match.anyOf()`.
* See `anyOf()` in [MATCHERS](./MATCHERS.md)

## 26 April 2021

* Fixed `match.aSet.match()` when all actual match but there are extra expected elements.

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
