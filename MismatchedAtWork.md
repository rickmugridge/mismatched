# Mismatched at Work

In the following, we distinguish between:
 * `actual` - the value that resulted from calling the code under test (applied recursively)
 * `expected` - what we expect a result to be (applied recursively)

## matchMaker

`matchMaker` is responsible for creating a `matcher` for an arbitrary expected object.

It walks over expected JS objects as follows:
 * For an object, it walks over the fields and creates a field matcher for each (recursively). 
   These matchers are used to make an object matcher.
 * For an array (or set or map, etc), it walks over the elements and creates a matcher for each (recursively). 
   These matchers are used to make an array (or set) matcher.
 * For a simple value, such as `true`, `undefined`, `null`, 1, etc it creates a `match.isEqual()` matcher.
 * For a `NaN`, `RegExp` or `Error`, it creates a specialised matcher.
 * For a function, it creates a `match.any()`
 * However, if `matchMaker` finds a mismatched matcher anywhere, it simply retains that.
 * It handles self-references within objects

For example:

```
     assertThat(actual).is({
          name: "hamcrest",
          address: {number: 3, street: match.string.startsWith("Oak St"), other: match.any()},
          counts: [1, 2]
         });
```

The argument to `is()` is mapped into a matcher corresponding roughly to:

```
     ObjectMatcher([
          FieldMatcher("name", match.isEqual("hamcrest")),
          FieldMatcher("address", ObjectMatcher([
              FieldMatcher("number", match.isEqual(3)), 
              FieldMatcher("street", match.string.startsWith("Oak St")),
              FieldMatcher("other", match.any())
         ]));
```

## Matchers

There are about 22 matchers. For a summary of available matchers, see `src/match.ts`.

Many of the built-in matchers, such as `match.string.startsWith()`,  simply use `PredicateMatcher`
 * See [Custom Matchers](./CustomMatchers.md) for how to build your own matchers with this.

Most of the complexity of `mismatched` is in aiming to provide high quality diffs when things don't quite match.

A matcher has multiple responsibilities:
   * Given an actual value, it tries to match that actual value against the expected value(s) it holds.
      * It returns the result of the match (the MatchResult), which either passed() or returns with a diff.
      * If it fails, it also adds a record of the failure to an array that accumulates in case validation is happening.
   * The matching can be very simple, such as with `match.any()`, `match.isEquals(`), `match.itIs()`
   * The matching can be complex, such as when matching arrays, sets and maps
     * When matching an array:
       * fast-diff is used to determine the best matching of elements
         * This in turn depends on `mismatched` for comparisons, where either two elements match completely or the key of an element matches.
         * This nested use of `mismatched` does not bind `match.bind()` uses
       * `mismatched` then carries out extra matching on elements that weren't matched initially, to provide useful diffs
       * The final step is to bind `match.bind()` uses
     * When matching a set or unordered array:
       * The matchers are ordered according to their `complexity`. This is a measure of how constrained a matcher is (a classic constraint satisfaction approach.
       * The matchers are then checked in order from most complex to least, to find the best match with an actual element.
       * Any unmatched actual elements and unmatched matchers are then combined where they partially match to give a reasonable diff result.
   * Calculating its complexity, for when it's used recursively within set matching
       
## `assertThat()`

This drives the assertions, and is responsible for displaying differences. It displays both:
 * the actual result, which is more useful when matching fails completely
 * the diff, which is most useful when matching is partial, so it's easy to quickly see what is not right.

The display of these is carried out by PrettyPrinter, which handles (augmented) object display, with useful layout 
(JSON is such a bad approach for this).
The aim of this is to make it easy to:
  * See the actual results
  * Copy and paste the actual result into the test when it proves to be what we should've expected

## Self References

Consider the following code that builds an odd but correct object:

```
    const a: any = [2]
    a[1] = a
    // [2, <a>}]
```

This is a very simple array, but where the second element of the array holds a reference to the array as a whole.

Such structures are tricky to deal with, and are not handled well by JSON.stringify() and the average matcher.

mismatched deals with such self-referenced values in two ways:
 * It can display them with PrettyPrinter
 * It can match them

Eg, consider:

```
    const a: any = [2]
    a[1] = a
    // [2, <a>}]
    const a2: any = [2]
    a2[1] = a2
    assertThat(a).is(a2)  // Succeeds
    assertThat(a).is([2]) // Fails
```

The first assertion succeeds because `a2` has the same values and equivalent self-references as `a`.
However, the second assertion fails as the actual value ([2]) has no self-reference.