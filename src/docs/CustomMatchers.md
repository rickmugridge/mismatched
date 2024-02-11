## Writing Custom Matchers

Simple matchers can implicitly or explicitly use `match.predicate`. For examples:

```
    it("Provide an arrow. It is used for predicate matching", () => {
        assertThat(33).is(match.predicate(v => v >= 20 && v < 40);
    });

    it("Name the matcher so it can be used multiple times", () => {
        function fromUpTo(from: number, upto: number) {
            return match.predicate(v => v >= from && v < upto);
        }
        assertThat(33).is(fromUpTo(20, 40));
    });
 ```

Writing a matcher that composes over matchers can be more complex, as it requires understanding 
much more of the architecture.
For a very simple example of a matcher that does this, see `NotMatcher`.
All Matcher classes extend `DiffMatcher<T>`.

For a more complex example, see `AllOfMatcher` and `AnyOfMatcher`.

For example, in `AnyOfMatcher`, a notion of a `matchRate` is used to determine the best match, 
in case none matches exactly.
The `matchRate` is the ratio of the passed sub-matches over all sub-matches (0.0 to 1.0). So a complex matcher tracks:

- the number of sub-matches involved in the match.
  A sub-match happens, for example, when a field of an object or an element of an array is matched.
- the number of those sub-matches that passed.

These counts are provided by all matchers. The `matchRate` will also be used when we add array diffing.
