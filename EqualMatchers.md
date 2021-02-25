# Equal Matchers

Two types of equality matching of objects/arrays are provided:
 1. Identity-based equality, where we want to match the specific object/array (ie, by reference).
See `match.itIs()` below.
 1. Structural-based equality, where we want to match the structure of an object/array.

Either one matches a primitive value if it has the same value, although string and NaN are handled specifically.

## match.itIs(): Same object/array

Passes if the **very** same object or value is provided (ie, tested by `===`).

For examples:

```
    it('object itself', () => {
        const actual = {a: "b"};
        assertThat(actual).is(match.itIs(actual));
        assertThat(actual).isNot(match.itIs({a: "b"}));
    });

    it('array itself', () => {
        const actual = [1, 2, 3];
        assertThat(actual).is(match.itIs(actual));
        assertThat(actual).isNot(match.itIs([1, 2, 3]));
    });
```
## Structural Matching: match.isEquals() and implied

We can explicitly use `match.isEquals()` but it is usually not necessary. 
We can simply provide any Javascript value to be matched against, 
as the second `assertThat()` in the first example below shows. 

```
        describe('matches exact same value:', () => {
            it('number', () => {
                const actual = 3.4;
                assertThat(actual).is(match.isEquals(actual));
                assertThat(actual).is(actual);
            });

            it('boolean', () => {
                const actual = false;
                assertThat(actual).is(actual);
                assertThat(true).is(true);
            });

            it('Symbol', () => {
                const actual = Symbol('test');
                assertThat(actual).is(actual);
            });

            it('undefined', () => {
                const actual = undefined;
                assertThat(actual).is(actual);
            });

            it('null', () => {
                const actual = null;
                assertThat(actual).is(actual);
            });

            it('object', () => {
                const actual = {a: "b"};
                assertThat(actual).isNot({a: "b"});
            });

            it('object itself', () => {
                const actual = {a: "b"};
                assertThat(actual).isNot(match.isEquals({a: "b"}));
            });

            it('array itself', () => {
                const actual = [1, 2, 3];
                assertThat(actual).isNot(match.isEquals([1, 2, 3]));
            });

            it('NaN is odd, as it is not equal to itself', () => {
                const actual = NaN;
                assertThat(actual).isNot(match.isEquals(actual));
            });
        });
```
