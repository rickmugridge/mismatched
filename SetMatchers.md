# Set Matchers

These match whole Sets and subsets.

For example:

```
    it('matches', () => {
        const actual = new Set([1, 2, 3]);
        assertThat(actual).is(new Set([1, 2, 3]));
        assertThat([3, 1, 2]).is(new Set([1, 2, 3]));
    });

    it('subset', () => {
        const actual = new Set([1, 2, 3]);
        assertThat(actual).is(match.aSet.subset(new Set([1, 2, 3])));
        assertThat(actual).is(match.aSet.subset([1, 2]));
    });
```

## `match.aSet.match()` matches the whole set

This is used automatically if a Set is provided as the matcher.

## `match.aSet.subset()` matches a subset

Checks for a subset of the actual Set.

The argument to `match.aSet.subset()` can be a Set, Array or Map.

## Care with general matchers

Care is needed when using general matchers, however.
The following fails because the `match.any()` matches whatever it finds first:

```
   it('matches wrong', () => {
        const actual = new Set([1, 2, 3]);
        assertThat(actual).is(match.aSet.match(new Set([match.any(), 1, 2])));
    });
```

So put the most general matcher last:
```
    it('matches right', () => {
        const actual = new Set([1, 2, 3]);
        assertThat(actual).is(match.set.match(new Set([1, 2, match.any()])));
    });
```
