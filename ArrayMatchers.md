# Array Matchers

The `array` matchers allow for "exact" and partial matching on an array.
Embedded matchers may used within the array elements.

## `match.array.match()`

This used by default whenever we try to match a literal array, as shown in the examples below.
This matcher expects that each of the elements of the actual array can be matched by a corresponding matcher/literal.

For example:

```
    describe("array.match", () => {
        it("literal", () => {
            assertThat([1, 2]).is([1, 2]);
            assertThat([1, 2]).is(match.array.match([1, 2])); // long-hand
        });

        it("Embedded matcher", () => {
            assertThat([1, 2]).is([1, match.number.greater(0)]);
            assertThat([1, 2]).is(match.array.match([1, match.number.greater(0)]));
        });
    });
```

## `match.array.contains()`

This matcher expects that the actual array contains the expected element. It may contain other elements.

For example:

```
    it("array.contains", () => {
        assertThat([-1, 2]).is(match.array.contains(match.number.greater(0)));
    });
```

## `match.array.every()`

This matcher expects that all elements of the actual array matches against the matcher.

For example:

```
    describe("array.every", () => {
        it("literal", () => {
            assertThat([1, 1]).is(match.array.every(1));
        });
        it("matcher", () => {
            assertThat([-1, 2]).is(match.array.every(match.number.greater(-5)));
        });
    });
```

## `match.array.length()`

This matcher expects that the length of the actual array to be the expected value.

For example:

```
     it("array.length", () => {
         assertThat([-1, 2]).is(match.array.length(2));
     });
```

## `match.array.unordered()`

This matcher expects that each of the elements of the actual array can be matched by a corresponding 
matcher/literal, regardless of order. There may be duplicate elements.

For example:

```
     it("match.array.unordered()", () => {
         assertThat([1, 1, 1, 2]).is(match.array.unordered([2, 1, 1, 1]));
     });
```

Unordered arrays are matched with the same algorithm as for sets, except that it allows for duplicate entries.
See the tips under set matchers to get more useful results when things don't match correctly.

## `match.array.unorderedContains()`

This matcher expects that a subset of the elements of the actual array can be matched by a corresponding 
matcher/literal, regardless of order. There may be duplicate elements.

For example:

```
     it("match.array.unorderedContains()", () => {
         assertThat([1, 1, 1, 2]).is(match.array.unorderedContains([2, 1]));
     });
```

