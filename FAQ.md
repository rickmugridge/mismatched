# FAQ

## How to match an object where some expected fields are unknown eg, randomly generated?

 * Use `match.any()` for those fields within the object (nested to any level). 
 * See [Matchers](./MATCHERS.md) for further details
 * Eg, in the following, we don't know the value of `other` ahead of time, or we don't care about that in the test:
```
     assertThat(actual).is({
          name: "hamcrest",
          address: {number: 3, street: "Oak St", other: match.any()}
         });
```

## When is it better to match against a whole object?

For example, compare the following three approaches:

 * (1) Mention all fields:

```
     assertThat(actual).is({
          id: match.any(),
          name: "hamcrest",
          address: {number: 3, street: "Oak St", other: match.any()}
         });
```
 * (2) Match a subset of fields 

```
     assertThat(actual).is(match.obj.has({
          name: "hamcrest",
          address: match.obj.has({number: 3, street: "Oak St"})
         }));
```
 * (3) Match the fields independently
```
     assertThat(actual.name).is("hamcrest");
     assertThat(actual.address.number).is(3);
     assertThat(actual.address.street).is("Oak St);
```

Here are the pros and cons of each:
 1. Shows clearly what we're expecting. 
    Means that we'll get a helpful compile-time error if we change the type of `actual`, 
    instead of finding the problem when we run the test.
    It's easy to copy the actual result that is shown if the test fails and we agree that's correct.
 2. Focusses more clearly on fields of interest. Doesn't help if the type of `actual` changes - we may miss adding fields to be expected.
 3. Is verbose, making it harder to read.

The approach I take is to use #1 normally, but #2 if I'm only interested in checking a small subset of the fields.
I only use approach #3 if I'm really only interested in one field of the whole object.

## How do I add my own matchers?

The simplest approach is to define your own matcher using `PredicateMatcher`.

* See [Custom Matchers](./CustomMatchers.md) for an example and further details.

## How to handle matching when the same unknown value can appear at multiple points in matching, such as with ids?

 * Create a `match.bind()` and use that in each of the places where you expect that (unknown) value to appear.
 * See [Binding Matcher](./BindingMatcher.md) for an example and further details.

## How to match when the order of elements in an array may vary (eg, results from a query)?

 * If the elements form a bag (ie, it has duplicated elements), use `match.array.unordered()`.
   See [Array Matchers](./ArrayMatchers.md) for further details.
 * If the elements form a set, use `match.aSet.match()` which compares the actual as a set against the expected set.
   See [Set Matchers](./SetMatchers.md) for further details.

## What if we're only interested in a subset of the elements in an array or set?

Use one of the following:
 * `match.array.contains()`
 * `match.array.unorderedContains()`
 * `match.aSet.subset()`

## How to check when a larger returned object contains a field that holds the JSON from some object?

It can't match the JSON directly, because the id of that object was auto-generated.
So it's difficult to match it within the JSON string without a messy regExp, which is confusing.
What's a better way of doing that?

 * See [MappedMatcher](./MappedMatcher.md) for a general solution.

## When larger arrays or sets of complex objects fail to match, it can be tricky working out what went wrong

Consider when the elements are complex in their own right. 
They have one or more fields that are effectively keys, making them unique.
You can then declare those keys to aid the matching/diff algorithms, as it will use those keys as a strong preference in matching.

 * Here's a simple example (which matches the elements correctly, with differences in the `b` values:

```
                const actual = new Set([{a: 1, b: 1}, {a: 2, b: 2}]);
                assertThat(actual).is(new Set([
                    {a: match.obj.key(1), b: 2},
                    {a: match.obj.key(2), b: 0}]));
```

This approach can also be used when matching arrays and unordered arrays.

## Can matchers be used with builders ([builder pattern](https://en.wikipedia.org/wiki/Builder_pattern)n)?

Yes, indeed. As matchers are of type `any`, they can be used where you like. For example:

```
       assertThat(result).is(new ColourBuilder().withRed(match.any()).to()
```

## When matching complex objects, it can be hard to work out where specific values come from. What can I do?

* See [DecompiledActual](./DecompiledActual.md) for a general solution.

## Can `mismatched` be used for validation?

Yes, see [ValidateThat](./ValidateThat.md)

## How well is `mismatched` tested?

There is a large, comprehensive set of tests. 
These use `mismatched` itself (with care!). Many verify that failing tests produce the correct diffs.
See `SetMatcher.micro.ts`, for example.

# How does `mismatched` work?

* See [MismatchedAtWork](./MismatchedAtWork.md) for some high level details.

# How can I partially match on the message of an Error? `assertThat().throws()` doesn't work.

The following doesn't work:

```
        it("Matches all", () => {
            assertThat(() => {
                throw new Error("error");
            }).throws(new Error(match.string.startsWith("e")));
        });

```

That's because an `Error` is not a proper JS object and so mismatched matchers cannot be used within it.

But this does:

```
        it("Matches all", () => {
            assertThat(() => {
                throw new Error("error");
            }).throwsError(match.string.startsWith("e"));
        });
```

# A field in a returned object contains JSON. 

I want to match part of the object with that JSON, but it's tricky with string matching. What can I do?

* See [MappedMatcher](./MappedMatcher.md) for a general solution.

# How can I match objects that contain self-references?

`mismatched` handles that automatically, both in matching and in displaying useful error messages when matching fails.

