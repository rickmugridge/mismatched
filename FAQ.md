# FAQ

## How to match an object where some fields are unknown eg, randomly generated)

 * Use `match.any()` for those fields within the object (nested to any level). 
 * See [ReadMe](./README.md) for an example (near the top)
 * See [Matchers](./MATCHERS.md) for details

## How to handle matching when the same unknown value can appear at multiple points in matching, such as with ids

 * Create a `match.bind()` and use that in each of the places where you expect that (unknown) value to appear.
 * See [Matchers](./MATCHERS.md) for details

## How to match when the order of elements in an array may vary (eg, results from a query)

 * Use `match.aSet.match()` which compares the actual as a set against the expected set.
 * See [Matchers](./MATCHERS.md) for details

## A larger returned object contains a field that holds the JSON from some object.

I can't match it directly, because the id of that object was auto-generated.
So it's difficult to match it within the JSON string without a messy regExp, which is confusing.
What's a better way of doing that?

 * See [MappedMatcher](./MappedMatcher.md) for a general solution.
