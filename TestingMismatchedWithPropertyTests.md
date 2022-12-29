# Testing Mismatched With Property Tests

Property tests are an elegant way to perform tests that verify general properties of some data or code.
We use property test framework `fast-check` here.

For property tests, we define how examples of a given type are to be randomly generated, and then use those examples to verify certain properties of the type.
For example, we can use property tests to verify that:
  * A sorted array is the same length as the original
  * A sorted arrays has the exact same elements as the original, rearranged
  * A string created by concatenating strings A and B will have A at the start, B at the end, and A/B within it
  * Encoding a value, such as to JSON, and then decoding it will give the same result (with restrictions on the JS values - eg, symbols and functions are not allowed)
  * The result of an efficient algorithm is the same as the result of a equivalent simple but slow algorithm
  * A validately-generated value of some type satisfies the validation code for that type, whereas an invalid value will not

When a property test fails, the framework tries to simplify the example to make it easier to see what went wrong.

We include a few examples here. See the source files `*.propTest.ts` for all property tests for `mismatched`.
These can all be run in the command line with:

```
   npm run propTest
```

## `ArrayMatcher`

```typescript
describe("array.matcher property tests:", () => {
    it('always matches with the same array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value =>
                assertThat(value).is(value)))
    })

    it('never matches with a different array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value => {
                    assertThat([...value, Symbol()]).isNot(value)
                    assertThat(value).isNot([...value, Symbol()])
                }
            ))
    })
});
```

where:
```typescript
export const anyJavascriptValue = () => fc.oneof(fc.string(), fc.char(), fc.string().map(s => Symbol(s)), fc.integer(), fc.float(),
    fc.double(), fc.boolean(), fc.constant(undefined), fc.constant(null), fc.constant(NaN),
    fc.bigInt(), fc.date(), fc.object(), fc.array(fc.integer()), fc.tuple(fc.integer(), fc.string()))
```

The first test says that if we create any array of a JS value, we can match it against itself.
See [How Mismatch Works](./HowItWorks.md) for details of how the matchMaker turns a value into a corresponding Matcher.
By default, this test will run with 200 distinct examples.

The second test says that if we create any array of a JS value, we can't match it against the same array with an extra (unique) value in it.

`fast-check` obligingly generates all sorts of edge cases for us, including [] and deeply-nested arrays.

## `AnyMatcher`

```typescript
describe("match.any() property tests:", () => {
    it('match.any() always matches', () => {
        fc.assert(
            fc.property(anyJavascriptValue(), value => assertThat(value).is(match.any())))
    })
});
```

This says that an JS value will be matched by `match.any()`.

## match.array.contains

```typescript
describe("match.array.contains property tests:", () => {
    it('match.array.contains() always matches with any element of the array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()).filter(a => a.length > 0), value => {
                const index = randomInt(0, value.length - 1)
                assertThat(value).is(match.array.contains(value[index]))
            }))
    })

    it('match.array.contains() never matches with a non-element', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value =>
                assertThat(value).isNot(match.array.contains(Symbol()))))
    })
});

const randomInt = (min: number, max: number) => // min and max inclusive
    Math.floor(Math.random() * (max - min + 1) + min)
```