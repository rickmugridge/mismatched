import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {validateThat} from "../validateThat";

describe("NumberMatcher:", () => {
    describe("assertThat():", () => {
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

        describe("NaN:", () => {
            it("Matches", () => {
                assertThat(NaN).is(match.number.nan());
                assertThat(NaN).is(NaN);
            });

            it("Mismatches", () => {
                assertThat("ab")
                    .failsWith(match.number.nan(), {[MatchResult.was]: "ab", [MatchResult.expected]: "NaN"});
                assertThat(null)
                    .failsWith(match.number.nan(), {[MatchResult.was]: null, [MatchResult.expected]: 'NaN'});
            });
        });
    });

    describe("validateThat():", () => {
        const expected = match.number.greater(0);

        it("succeeds", () => {
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(-4).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: -4, expected: {"number.greater": 0}}`
            ]);
        });
    });
});
