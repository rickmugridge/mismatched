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

### `assertThat().throwsError()`

This checks that an exception with the right `message` has been thrown, based on the provided lambda. For example:

```
        assertThat(() => {
            throw new Error("error");
        }).throwsError("error");
        assertThat(() => {
            throw new Error("error");
        }).throwsError(match.string.startsWith("err"));
```

The second assertion above shows the use of `mismatched` matching on some part of the message string.

Unfortunately, we need this to do matching on the `Error() message`. 
An `Error` is a strange object that doesn't follow the usual conventions. 
So we can't pass values other than strings, such as matchers, to the `Error` constructor. 
Such values are not then available.

### `assertThat().throws()`

This checks more generally that a suitable exception has been thrown, based on the provided lambda. For example:

```
       it("assertThat().throws()", () => {
            assertThat(() => {
                throw new Error("error");
            }).throws(match.instanceOf(MySpecialisedError));
```

The `throws()` optionally take an arbitrary value or matcher; a `match.any()` is used by default.
The assertion fails if:

  - a function is not provided to `assertThat()`; or 
  - if no exception is thrown; or
  - the exception is thrown but the result doesn't match

### `assertThat().catches()`

This checks that a Promise result has been rejected. For example:

```
        it("assertThat().catches()", () => {
            return assertThat(Promise.reject(4)).catches(4);
        });
```

The `catches()` optionally take an arbitrary value or matcher; a `match.any()` is used by default.
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