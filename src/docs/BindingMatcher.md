# Binding Matcher

Sometimes a generated value, such as an ID, may occur at multiple points in a nested object or between objects.

In matching, we want to ensure that those values are all the same, but we don't know ahead of time what the value will be.

So we can use a binding matcher.
Eg, in the following, the top-level ID "'3d109f..." also appears in each of the relationships:
```
        it("Multiple values bound together", () => {
            const value = {
                id: '3d109f84-cbb3-4512-b26b-ace282d16183',
                relationships: [
                    {
                        id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                        parentPartyId: '3d109f84-cbb3-4512-b26b-ace282d16183',
                        childPartyId: 'd65650a0-4445-4aa9-80d9-1f1aa11ff1c6',
                        type: "Red"
                    },
                    {
                        id: "78e95615-0e08-4449-aad5-3644b37e36e1",
                        parentPartyId: '3d109f84-cbb3-4512-b26b-ace282d16183',
                        childPartyId: 'b7acb8a7-b077-4a89-abc9-7f263856726b',
                        type: "Red"
                    }
                ]
            };
            const bindRootId = match.bind()
            assertThat(value).is({
                id: bindRootId,
                relationships: [
                    {
                        id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                        parentPartyId: bindRootId,
                        childPartyId: match.any(),
                        type: "Red"
                    },
                    {
                        id: "78e95615-0e08-4449-aad5-3644b37e36e1",
                        parentPartyId: bindRootId,
                        childPartyId: match.any(),
                        type: "Red"
                    }
                ]
            })
        });
```

## Advanced Binding

In general:
* match.bind() can take a value or matcher as an argument, which constrains what it can subsequently bind to
* Once it binds, it can match anything of the same "shape" (structural equality)

Eg:
``` 
               const value = {
                    colours: [
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: "Red"
                        },
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: "Red"
                        },
                    ]
                };
               const bindColour = match.bind(match.ofType.object())
                assertThat(value).is({
                    colours: [
                        bindColour,
                        bindColour
                    ]
                })
```

