# Set and UnorderedArray Matchers

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

## Improved matching error reporting when elements have unique values (keys) 

Consider when matching a set of objects and each object has key for uniqueness, from one or more fields.

Use `match.obj.key()` to specify those keys to narrow down the matching of elements :

            it('matches with a key', () => {
                const actual = new Set([{a: 1, b: 1}, {a: 2, b: 2}]);
                assertThat(actual).is(new Set([
                    {a: match.obj.key(1), b: 2},
                    {a: match.obj.key(2), b: 0}]));
            });
