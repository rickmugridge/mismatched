# mismatched

A Typescript-based assertion and matcher framework, inspired by Hamcrest (https://en.wikipedia.org/wiki/Hamcrest).

This can be used with:
   - for `mismatched` assertions with `assertThat()`
   - as matcher for arguments in mocked calls in `thespian`
   - for data validation with `validateThat()`

## Example Assertions

Here's a few simple examples of assertions (all these examples are in the `examples` directory here:

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
                    address: {number: 3, street: "Oak St", other: match.any()}
                });
        });

        it('Matching optionally on several fields', () => {
            assertThat(actual)
                .is({
                    name: match.anyOf(["hamcrest", "tsDiffMatcher"]),
                    address: {
                        number: match.greater(0),
                        street: "Oak St",
                        other: match.ofType.array()
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
  
when matching fails, and the changes are minor, it provides feedback as a [diff tree](DIFFTREE.md) 
(looks to be related to a Haskell tree-diff). Eg:

![failed](MatchFail.png)

When the `address.number` was 3 but was expected to be 4.

### AssertThat

The `mismatched` assertion mechanism is defined here: [assertThat()](./ASSERTTHAT.md).

### Matchers

There are many built-in matchers. See [Matchers](./MATCHERS.md). This includes a section on writing custom matchers.

### Displaying the results of mismatches

We aim to provide useful output when a match fails. 
[PrettyPrinter](PRETTYPRINTER.md) does this.

The results are provided as a JS object, which shows what matched and what didn't in a [diff tree](DIFFTREE.md).
It does not display it in JSON format.
Instead, it is displayed as plain JS, so that it's easy to copy parts of it if a test is not right.

It aims to lay out the JS object/value to make it convenient to read.
It tries to strike a balance between all being on one line and being spread out over many lines.
Either extreme can make it difficult to read.

It allows for custom renderers.

## Example Validations

Here's two simple examples of validations (see the micro tests for individual matchers for other examples):

```
    describe("validateThat():", () => {
        const expected = {f: match.ofType.number(), g: match.ofType.boolean()};

        it("succeeds", () => {
            const validationResult = validateThat({f: 2, g: true}).satisfies(expected);
            assertThat(validationResult.passed()).is(true);
        });

        it("fails", () => {
            const validationResult = validateThat({f: "2", g: 3}).satisfies(expected);
            assertThat(validationResult.passed()).is(false);
            assertThat(validationResult.errors).is([
                `{"actual.f": "2", expected: "ofType.number"}`,
                `{"actual.g": 3, expected: "ofType.boolean"}`
            ]);
        });
    });
```

This makes use of the same matchers as above: [Matchers](./MATCHERS.md).

### validateThat

The `mismatched` validation mechanism is `validateThat()`. 

It uses the following call: `validateThat(actual).satisfied(matcher)`, where:

 - `actual` is an arbitrary value to be validated
 - `matcher` is a Javascript value or a `mismatched` matcher.
 
 This returns a `ValidationResult`, which contains the errors as an `Array<string>`.
 
The `matcher` for validations will tend to use matchers that:
  - distinguish between mandatory and optional fields. Eg, a field is a mandatory positive integer
  - check the types of fields. Eg, a valid UTC Date string
  - check the elements in an array

## Things to do

  - wire in the string diffing
  - add array diffing
  - Allow for matching an expected object (in `is()`)) that includes self-references (ie, cycles).
  - Document MappedMatcher
