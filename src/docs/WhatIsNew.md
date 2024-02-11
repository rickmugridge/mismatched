# What is New

## 10 Feb 2024 (version "2.15.2")

* Array matching now uses a fuzzy diff algorithm to give better results.

## 6 Feb 2024 (version "2.15.0")**

* Fixed problem with: assertThat({}).is({})
* Fixed problem with: assertThat(mock.object, mock.object)

## 8 Jan 2024 (version "2.13.4")

* Added `match.selectMatch()` which can be used to improve error messages when matching complex subtypes, etc.
  See [`Matching Subtypes](MatchingSubtypes.md)

## 3 Jan 2024 (version "2.13.4")

* Extended [`primitiveBuilder`](PrimitiveBuilder.md) with arrayOf(), setOf(), mapOf()

## 2 Jan 2024

* Added [`primitiveBuilder`](PrimitiveBuilder.md)

*## 20 December 2023

* Added `match.number.inRange()`
* Added `match.ofType.date()`
* Added `match.string.nonEmpty()`

## 19 December 2023

* Improved error message when `match.array.every()` fails to match

## 18 December 2023

* Date (see [Matchers](MATCHERS.md)):
    * Addition of DateMatcher, which matches Dates properly (given that Date, along with Error, is a weird object)
    * Added `match.date.before()`, which checks that the actual Date is before the expected Date
    * Added `match.date.after()`, which checks that the actual Date is after the expected Date

* String (see [String Matchers](StringMatchers.md)):
    * Added `match.string.asDate()` that parses the actual string and checks it against the expected Date (or matcher)
    * Added `match.string.asSplit()` that splits the actual string based on a separator, and checks the resulting
      string[] against the expected array (or matcher)
    * Added `match.string.asNumber()` that parses the actual string as a number, and checks the resulting number against
      the expected number (or matcher)
    * Added `match.string.asDecimal()` that parses the actual string as a number, requiring the specified decimal
      places, and checks the resulting number against the expected number (or matcher)
    * Added `match.string.fromJson()` that JSON.parses the actual string and checks it against the expected value (or
      matcher)

* Added a generic argument to `match.mapped()` for the result type from the mapping function

* Renamed all tests as *.test.ts instead of *.micro.ts

## 7 December 2023

* Changes to match.mappedMatcher:
    * Changed error message when fails - now shows the mapped value rather than the original
    * Now catches any exceptions thrown in the provided map() function and gives suitable error

## 17 December 2021

* Can now match JS objects with self-references (cycles).

## 26 November 2021

* Documented `assertThat().throwsError()` in [assertThat](ASSERTTHAT.md) and [FAQ](FAQ.md).
* Added maximum size for objects etc. in PrettyPrinter to avoid heap overflow.

## 19 November 2021

* Allowed use of `.is()` as well as `.satisfies()` for `validateThat()` checks.
* Improved error messages for array validation.

## 31 October 2021

* Extended the [FAQ](FAQ.md) considerably, including [Custom Matchers](CustomMatchers.md)
  and [DecompiledActual](DecompiledActual.md)
* Added  [MismatchedAtWork](MismatchedAtWork.md)
* Revised the algorithms for matching arrays:
    * Used fast-diff for all matching
* Revised the algorithms for matching sets and unordered arrays (bags):
    * Used a new algorithm, based on the "complexity" of the matchers, which aims to measure how constrained a matcher
      is.
    * The matchers are tried from most constrained to least, to try and find the best overall match
* For both of these algorithm changes:
    * Takes account of `match.object.keys()` in matching. If the key matches:
        * The whole is considered to matched (even if there are other differences)
        * Those differences are displayed in the final result
    * Now a `match.bind()` only binds once the actual/expected have been matched up

## 5 June 2021

* Added `match.object.key()` to improve diffs and to narrow down `validateThat` errors when matching subtypes
  with `match.anyOf()`.
* See `anyOf()` in [MATCHERS](MATCHERS.md)

## 26 April 2021

* Fixed `match.aSet.match()` when all actual match but there are extra expected elements.

## 30 March 2021

* Added and documented `match.enum()`

## 26 March 2021

* Documented `match.mapped()`
* Sometimes, it's difficult to match directly on an object or a part of it. This matcher allows the actual value to be
  mapped and the matcher is applied to the result.

* See [MappedMatcher](MappedMatcher.md)

## 19 March 2021 (2.6.5)

* Added `match.decompiledActual(actual, contributors, enums)`. This provides a very useful form that can be used as the
  expected part in an `assertThat()`. It takes an actual result and replaces values within it by any contributors or
  enums used. A contributor is some value/object/array that was used as an input into testing some code.
  See [Decompiled Actual](DecompiledActual.md) for an example to make sense of this.
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
* See [Array Matchers](ArrayMatchers.md)

## 27 February 2021

* Generalised `match.bind()` to:
    * Take an optional matcher argument, which then has to match the first use
    * Once it matches once, it builds a matcher from that, to match subsequent uses. This allows it to bind and then
      match objects/arrays.
    * See [Binding Matcher](BindingMatcher.md)

[Home](../../README.md)
