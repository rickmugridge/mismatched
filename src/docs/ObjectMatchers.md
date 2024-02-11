# Object Matchers

The `obj` matchers allow for "exact" and partial matching on an object.
Embedded matchers may used within the fields of the object.

#### `match.obj.match()` matches the whole object

This used by default whenever we try to match a literal object, as shown in the first example below.
This matcher expects that each of the fields of the actual object can be matched by a corresponding matcher/literal.

For example:

```
    describe("obj.match", () => {
        const actual = {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

        it('Explicit', () => {
            assertThat(actual)
                .is({name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}});
        });

        it('Embedded', () => {
            assertThat(actual)
                .is({
                    name: "hamcrest",
                    address: {
                        number: match.number.lessEqual(3),
                        street: "Oak St", 
                        other: match.ofType.array
                    }
                });
        });
    });
```

#### `match.obj.has()` matches some fields of the object

This matcher expects that some of the elements of the actual array can be matched by a corresponding matcher/literal.

For example:

```
    describe("obj.has", () => {
        const actual = {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

        it('Explicit', () => {
            assertThat(actual)
                .is(match.obj.has({name: "hamcrest"}));
        });

        it('Embedded', () => {
            assertThat(actual)
                .is(match.obj.has({
                    address: {
                        number: 3,
                        street: "Oak St", 
                        other: match.ofType.array
                    }
                }));
        });
    });
```

