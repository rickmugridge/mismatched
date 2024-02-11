### OfType Matcher

Checks that the value is one of the "primitive" types, etc:
 * `ofType.array()`
 * `ofType.function()`
 * `ofType.string()`
 * `ofType.number()`
 * `ofType.boolean()`
 * `ofType.regExp()`
 * `ofType.symbol()`
 * `ofType.enum(enum)`

Examples:

```
describe("OfTypeMatcher:", () => {
    describe("assertThat():", () => {
        it("ofType.array()", () => {
            assertThat([]).is(match.ofType.array());
            assertThat([1, 3]).is(match.ofType.array());
            assertThat(2).is(match.not(match.ofType.array()));
        });

        it("ofType.function()", () => {
            assertThat(() => 1).is(match.ofType.function());
            assertThat((a, b) => a + b).is(match.ofType.function());
            assertThat(2).is(match.not(match.ofType.function()));
        });

        it("ofType.string()", () => {
            assertThat("").is(match.ofType.string());
            assertThat("aa").is(match.ofType.string());
            assertThat(2).is(match.not(match.ofType.string()));
        });

        it("ofType.number()", () => {
            assertThat(1).is(match.ofType.number());
            assertThat(2.3).is(match.ofType.number());
            assertThat(true).is(match.not(match.ofType.number()));
        });

        it("ofType.boolean()", () => {
            assertThat(true).is(match.ofType.boolean());
            assertThat(false).is(match.ofType.boolean());
            assertThat(1).is(match.not(match.ofType.boolean()));
        });

        it("ofType.regExp()", () => {
            assertThat(/a/).is(match.ofType.regExp());
            assertThat(/a.*/).is(match.ofType.regExp());
            assertThat(1).is(match.not(match.ofType.regExp()));
        });

        it("ofType.symbol()", () => {
            assertThat(Symbol("")).is(match.ofType.symbol());
            assertThat(Symbol()).is(match.ofType.symbol());
            assertThat(1).is(match.not(match.ofType.symbol()));
        });

        it('ofType.enum()', () => {
            enum E {
                First='First',
                Second='Second'
            }
            assertThat(E.First).is(match.ofType.enum(E));
        });
    });
```
