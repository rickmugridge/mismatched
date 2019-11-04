import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

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
