# Number Matchers

Various matchers on numbers.

For examples:

```
describe("NumberMatcher:", () => {
    it("less", () => {
        assertThat(2).is(match.number.less(3));
        assertThat(4).is(match.not(match.number.less(3)));
    });

    it("lessEqual", () => {
        assertThat(2).is(match.number.lessEqual(3));
        assertThat(3).is(match.number.lessEqual(3));
        assertThat(4).is(match.not(match.number.lessEqual(3)));
    });

    it("greater", () => {
        assertThat(2).is(match.number.greater(1));
        assertThat(4).is(match.not(match.number.greater(5)));
    });

    it("greaterEqual", () => {
        assertThat(4).is(match.number.greaterEqual(3));
        assertThat(3).is(match.number.greaterEqual(3));
        assertThat(2).is(match.not(match.number.greaterEqual(3)));
    });
        
    it("withinDelta", () => {
        assertThat(4.1).is(match.number.withinDelta(4, 0.1));
        assertThat(3.15).is(match.number.withinDelta(3, 0.2));
        assertThat(2.85).is(match.number.withinDelta(3, 0.2));
        assertThat(2).is(match.number.withinDelta(3, 1.0));
    });

    it("Matches", () => {
         assertThat(NaN).is(match.number.nan());
         assertThat(NaN).is(NaN);
         assertThat(NaN).isNot(1);
    });
});

```
