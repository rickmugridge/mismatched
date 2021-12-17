# match.mapped()

This is handy when the actual result, or a part of it, is difficult to match directly.

For example, a larger, returned object contains a field that holds the JSON from some object.

But it can't be matched directly, because the id of that object was auto-generated.
So it's difficult to match it within the JSON string without a messy regExp, which is confusing.
What's a better way of doing that?

* Use `match.mapped()` as in the following example:
```  
        it("Handles a string mapped", () => {
            const actual = {
                detail: JSON.stringify({f: [0]})
            }
            assertThat(actual).is({detail: match.mapped(JSON.parse, {f: [0]},'json')})
        });
```
* The arguments of `match.mapped()` are as follows:
1. A function that maps the actual value to some other, more convenient form. In this case JSON.parse().
1. An object or a match matcher, which is used to match the result of the mapping function.
1. A description of the overall match, used when it fails.
