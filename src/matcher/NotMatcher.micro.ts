import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

describe("NotMatcher()", () => {
    it("matches", () => {
        assertThat(2).is(match.not(4));
        assertThat(2).isNot(4);
        assertThat(true).is(match.not(false));
        assertThat({f: 2}).is(match.not("a"));
    });

    it("mismatches", () => {
        assertThat(2).failsWith(match.not(2),
            {[MatchResult.was]: 2, [MatchResult.expected]: {not: 2}});
        assertThat({f: 2}).failsWith(match.not({f: 2}),
            {[MatchResult.was]: {f: 2}, [MatchResult.expected]: {not: {f: 2}}});
    });
});