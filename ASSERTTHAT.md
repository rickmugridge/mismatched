# AssertThat()

The `mismatched` assertion mechanism is provided with `assertThat()`.

This allows for
  - `is()` checks an actual value against an expected value or matcher. 
  - `isNot()` checks an actual value does not match an expected value or matcher.
  - `throwsError()` checks that the call throws an exception that has a suitable string message.
  - `throws()` checks that the call throws an exception that ise matched against.
  - `catches()` checks that the call returns a rejected Promise that is matched against.

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

`is()` takes either a `mismatched` matcher or `any` JS value. 
If it's not a matcher, it creates an internal matcher based on that value (allowing for embedded matchers).

### `assertThat().isNot()`, `assertThat().isAnyOf()`, `assertThat().isAllOf()`

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

This checks more generally that a suitable exception has been thrown, based on the provided lambda. For example:

```
        it("Matches", () => {
            assertThat(() => {
                throw new Error("error");
            }).throws(new Error("error"));
        });
```

The `throws()` optionally take an arbitrary value or matcher; a `match.any()` is used by default.
The assertion fails if:

  - a function is not provided to `assertThat()`; or 
  - if no exception is thrown; or
  - the exception is thrown but the result doesn't match

(Note that an `Error` is a strange object that doesn't follow the usual conventions.
It is not a proper Object, even though it looks like it. Sometimes, the following is more convenient to use.)

### `assertThat().throwsError()`

This checks more generally that a suitable exception has been thrown, based on the provided lambda. For example:

```
        it("Matches all", () => {
            assertThat(() => {
                throw new Error("error");
            }).throwsError(match.string.startsWith("e"));
        });
```

This only work if an Error is thrown. 
Given we're just matching on the message, we can use various matchers with it, as shown in the example above.

The `throwsError()` takes a string or a matcher; a `match.any()` is used by default.
The assertion fails if:

  - a function is not provided to `assertThat()`; or 
  - if no exception is thrown; or
  - the exception is thrown but the result is not an Error or if the message doesn't match

(Note that an `Error` is a strange object that doesn't follow the usual conventions.
It is not a proper Object, even though it looks like it.)

### `assertThat().catches()`

This checks that a Promise result has been rejected. For example:

```
        it("assertThat().catches()", () => {
            return assertThat(Promise.reject(4)).catches(4);
        });
```

In `async` land, when checking for errors from an async function, place the `await` at the start. Eg:

```
        it("Matches Error in an async function with await", async () => {
            return await assertThat(Promise.reject(new Error('err'))).catches(new Error('err'));
        });
```

(Putting the `await` further within the statement will not work due to the way that `async` handle rejects/exceptions.)

The `catches()` optionally take an arbitrary value or matcher; a `match.any()` is used by default.
The assertion fails if:

  - a Promise is not provided to assertThat(); or
  - the Promise is not rejected; or
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
(The logic gets a little tricky if you use a `then()` and `catch()` independently.)

### `assertThat().withMessage('failing message).is()`

Used to tailor the message provided on a failure.

The `withMessage()` method defines the failing message for an assertion.
It is after `assertThat()` and is before `is()`, `throwsError()`, etc.