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

Notice how the errors indicate where any mismatch occurs within the `actual` value. 
Eg, "actual.f" refers to the `f` field of the supplied object.

`match.array.every()` is particularly useful here for validating all array elements (see [Array Matchers](./ArrayMatchers.md)).

## `validateThat()`

This uses one of the following calls: 
- `validateThat(actual).satisfies(matcher)` or
- `validateThat(actual).is(matcher)`

where:
- `actual` is an arbitrary value to be validated
- `matcher` is a Javascript value or a `mismatched` matcher.

This returns a `ValidationResult`, which contains the errors as an `Array<string>`.

The `matcher` for validations will tend to use matchers that:
- distinguish between mandatory and optional fields. Eg, a field is a mandatory positive integer
- check the types of fields. Eg, a valid UTC Date string
- check the elements in an array

## describeContext and describe

These can be used together to tailor validation error messages.
For example, we want to validate an array of three persons, tailoring the error messages :

```
        it("Provides tailored validation error messages with array", () => {
            const nameDescription = (actual, context) => `The name of person #${context} should be a string`;
            const ageDescription = (actual, context) => `The current age of person #${context} should be a positive number`;
            const expected = match.array.every(
                match.describeContext((_,person) => person.personId || 'unknown',
                    {
                        personId: match.any(),
                        name: match.describe(match.ofType.string(), nameDescription),
                        age: match.describe(match.number.greaterEqual(0), ageDescription)
                    })
            );
            const actual = [
                {personId: 11, name: 3, age: 5},
                {personId: 12, name: 'orange', age: -1},
                {personId: undefined, name: 'pear', age: -1}
            ];
            const validation = validateThat(actual).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                "The name of person #11 should be a string",
                "The current age of person #12 should be a positive number",
                "The current age of person #unknown should be a positive number"
            ]);
        });
 ```

Note that:
* We use `match.array.every()` to apply the same matcher to each element of the actual array.
* For each element, we use `match.describeContext()` to create a suitable context for errors,
  based on the `personId`. The first argument to the function is any specialised outer context.
* In the individual fields of the Person object, we use `match.describe()` to define both the matcher
  and the error message that results if the matcher fails. For example, the name field needs to be a string:
    * `name: match.describe(match.ofType.string(), nameDescription),`

