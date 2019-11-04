# tsDiffMatcher

A Typescript-based matcher or assertion framework, inspired by Hamcrest (https://en.wikipedia.org/wiki/Hamcrest).

## Examples

Here's a few simple examples (all these examples are in the `examples` directory here:

```
describe("Object-matching Examples", () => {
    const actual = {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

    it('Full object match', () => {
        assertThat(actual)
            .is({name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}});
    });

    describe("Partial object match", () => {
        it('Do not care about one field', () => {
            assertThat(actual)
                .is({
                    name: "hamcrest",
                    address: {number: 3, street: "Oak St", other: match.any}
                });
        });

        it('Matching optionally on several fields', () => {
            assertThat(actual)
                .is({
                    name: match.anyOf(["hamcrest", "tsDiffMatcher"]),
                    address: {
                        number: match.greater(0),
                        street: "Oak St",
                        other: match.ofType.array
                    }
                });
        });
    });
});
```

We can see above that:
 - We can specify an object as the match, and a suitable matcher will be constructed automatically
 - We can use matchers at arbitrary points in the matching object (or array or at the top level)
   - Eg, because we don't care about some part of it (eg, a field which is randomly generated)
   - Eg, because we don't need to be too specific (some number, some array)
  
when matching fails, and the changes are minor, it provides feedback as a "diff tree". Eg:

![failed](MatchFail.png)

When the `address.number` was 3 but was expected to be 4.

## AssertThat

`assertThat()` can be followed by several calls. 

### `assertThat().is()`

The most commonly-used one is `is()`. For example:

```
    describe("is()", () => {
        it("Can take a literal value", () => {
            assertThat(44).is(44);
        });

        it("Can take a matcher value", () => {
            assertThat(44).is(match.lessEqual(45));
        });
    });
```

`is()` takes either a matcher or `any` JS value. 
If it's not a matcher, it creates an internal matcher based on that value (allowing for embedded matchers).

Here are the other short-hand flavours related to `is()`, along with their long-hand form, for example:

```
    describe("isNot() succeeds if the argument matcher/literal fails to match", () => {
        it("Can take a literal value", () => {
            assertThat(44).isNot(33);
            assertThat(44).is(match.not(33));
        });

        it("Can take a matcher value", () => {
            assertThat(44).isNot(match.greater(100));
            assertThat(44).is(match.not(match.greater(100)));
        });
    });

    it("isAnyOf() matches at least one of several possibilities", () => {
        assertThat(44).isAnyOf([33, match.greater(40)]);
        assertThat(44)
            .is(match.anyOf([33, match.greater(40)]));
    });

    it("isAllOf() matches on all matchers or literals", () => {
        assertThat(44).isAllOf([match.greater(40), match.less(50)]);
        assertThat(44)
            .is(match.allOf([match.greater(40), match.less(50)]));
    });
}
```

### `assertThat().throws()`

This checks that a suitable exception has been thrown, based on the provided lambda. For example:

```
       it("assertThat().throws()", () => {
            assertThat(() => {
                throw new Error("error");
            }).throws(match.instanceOf(Error));
```

The `throws()` take an arbitrary value or matcher.
The assertion fails if:

  - a function is not provided to `assertThat()`; or 
  - if no exception is thrown; or
  - the exception is thrown but the result doesn't match

### `assertThat().catches()`

This checks that a Promise result has been rejected. For example:

```
        it("assertThat().catches()", () => {
            const fn = () => Promise.reject(4);
            return assertThat(fn).catches(4);
        });
```

The `catches()` take an arbitrary value or matcher.
The assertion fails if:

  - a function is not provided to `assertThat()`; or
  - the function does not return a Promise; ot
  - if the Promise is not rejected; or
  - The Promise is rejected but the result doesn't match
  
If the Promise remains unresolved, the assertion hangs. 
The test framework will fail it after a delay as long as the `assertThat()` result is returned at the end of the test.

However, this can be inconvenient with a promise chain, given the nesting required. 
An alternative approach is shown in the following example:


```
        it("Alternative", () => {
            return Promise
                .reject(4)
                .then(
                    () => fail("Unexpected"),
                    e => assertThat(e).is(4));
        });
 ```

This used the "double-armed" `then()` so we can deal with both possible outcomes together. 
(It gets a little messy if you use a `then()` and `catch()` independently.)

## Matchers

There are many built-in matchers. See [Matchers](./MATCHERS.md)

## Writing Customer Matchers

Simple matchers can implicitly or explicitly use `match.predicate`. For examples:

```
    it("Provide an arrow. It is used for predicate matching", () => {
        assertThat(33).is(v => v >= 20 && v < 40);
    });

    it("Name the matcher so it can be used multiple times", () => {
        function fromUpTo(from: number, upto: number) {
            return v => v >= from && v < upto;
        }
        assertThat(33).is(fromUpTo(20, 40));
    });
 ```

Writing a matcher that composes over matchers can be more complex. 
For a very simple example of a matcher that does this, see `NotMatcher`.

For a more complex example, see `AllOfMatcher` and `AnyOfMatcher`.

In `AnyOfMatcher`, a notion of a `matchRate` is used to determine the best match, in case none matches exactly.
The `matchRate` is the ratio of the passed sub-matches over all sub-matches (0.0 to 1.0). So a complex matcher tracks:

  - the number of sub-matches involved in the match. 
    A sub-match happens, for example, when a field of an object or an element of an array is matched.
  - the number of those sub-matches that passed.

These counts are provided by all matchers. The `matchRate` will also be used when we add array diffing.

## Displaying the results of mismatches

We aim to provide a useful output when a match fails. 
The results are provided as a JS object, which shows what matched and what didn't in a diff tree.

(Some example would be good here...)

The results are displayed by a pretty printer, which does not display it in JSON format.
Instead, it is displayed as plain JS, so that it's easy to copy parts of it if a test is not right.

The display aims to layout the JS object/value to make it convenient to read.
It tries to strike a balance between all being on one line and being spread out over many lines.
See [PrettyPrinter](./src/prettyPrint/README.md)

## Things to do

  - wire in the string diffing
  - add array diffing
