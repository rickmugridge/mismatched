# `validateThat()` for validating data received.

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

`match.array.every()` is particularly useful here for validating all array elements (see [Array Matchers](./ArrayMatchers.md)).

## `validateThat()`

This uses the following call: `validateThat(actual).satisfies(matcher)`, where:

- `actual` is an arbitrary value to be validated
- `matcher` is a Javascript value or a `mismatched` matcher.

This returns a `ValidationResult`, which contains the errors as an `Array<string>`.

The `matcher` for validations will tend to use matchers that:
- distinguish between mandatory and optional fields. Eg, a field is a mandatory positive integer
- check the types of fields. Eg, a valid UTC Date string
- check the elements in an array
