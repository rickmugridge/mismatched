# Match Subtypes during Validation (and other types of general matching)

We consider two different approaches to matching subtypes during validation (or other types of matching).
The second approach requires more effort but can give a better result when validation fails.

Consider the following very simple example of 3 subtypes of `unionType`.

```
       enum Discriminator {A, B, C}

        type A = { discriminator: Discriminator.A, a: number }
        type B = { discriminator: Discriminator.B, a: string }
        type C = { discriminator: Discriminator.C, a: boolean }
        type unionType = A | B | C
```

All subtypes differ in the type of the `a` field.
We want to validate data of the type `unionType`.

## Matching using match.anyOf()

A straightforward approach is to use `match.anyOf()`.

```
        it("uses match.anyOf()", () => {
            const matcher = match.anyOf([
                {discriminator: Discriminator.A, a: match.ofType.number()},
                {discriminator: Discriminator.B, a: match.ofType.string()},
                {discriminator: Discriminator.C, a: match.ofType.boolean()},
            ])
            assertThat({discriminator: Discriminator.A, a: 1}).is(matcher)
            assertThat({discriminator: Discriminator.B, a: "1"}).is(matcher)
            assertThat({discriminator: Discriminator.C, a: true}).is(matcher)
        })
```

`match.anyOf()` tries each of the possibilities in turn until it finds a complete match.

If it doesn't find a complete match, it rates how well each one did (using various heuristics).
If there's a clear winner between them, then the message from mismatched is based on that best match.

That approach is more than sufficient when:

* Each of the alternatives is small (ie not large and.or deeply nested); or
* The test/validation always passes.

When the alternatives are not small, and fail, the diff messages can be tricky to interpret.
This is especially so when the diff shown is for the wrong subtype (when that was the best match).
Which leads to the second approach.

## `match.selectMatch()`

In the call to `match.selectMatch()`, we're explicit about identifying the subtype of the `unionType`.

```
        it("uses match.selectMatch()", () => {
            const matcher = match.selectMatch((actual: unionType): any => {
                switch (actual.discriminator) {
                    case Discriminator.A:
                        return {discriminator: Discriminator.A, a: match.ofType.number()}
                    case Discriminator.B:
                        return {discriminator: Discriminator.B, a: match.ofType.string()}
                    case Discriminator.C:
                        return {discriminator: Discriminator.C, a: match.ofType.boolean()}
                }
            })
            assertThat({discriminator: Discriminator.A, a: 1}).is(matcher)
            assertThat({discriminator: Discriminator.B, a: "1"}).is(matcher)
            assertThat({discriminator: Discriminator.C, a: true}).is(matcher)

            assertThat({discriminator: Discriminator.A, a: "1"}).isNot(matcher)
            assertThat({discriminator: Discriminator.A, a: true}).isNot(matcher)
            assertThat({discriminator: Discriminator.B, a: 1}).isNot(matcher)
        })

```

So now any validation errors will be within the context of the specific subtype of the object.

What happens when the function supplied does the following:

* Returns `undefined`. The matcher fails with a suitable error message.
* Throws an `Error`. The matcher fails with a suitable error message.

The function supplied to `match.selectMatch()` can depend on more complex checks of the
actual `object` supplied to determine its subtype.

## Minor Limitation of `match.selectMatch()`

* It's not sufficient when the (subtype) selection depends on data not held by the `actual` object.
  Eg, maybe it's determined by data in an owning object within a large nested structure.
