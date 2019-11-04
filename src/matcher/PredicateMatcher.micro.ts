import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

describe("PredicateMatcher:", () => {
    it("Matches", () => {
        assertThat(5).is(match.predicate(v => v > 0, "positive"));
        assertThat({a: 2}).is(v => v.a === 2);
    });

    it("Mismatches", () => {
        assertThat("ab")
            .failsWith(pred, {[MatchResult.was]: "ab", [MatchResult.expected]: "pred()"});
        assertThat("ab")
            .failsWith(v => v > 0, {[MatchResult.was]: "ab", [MatchResult.expected]: "a Function"});
        assertThat("ab")
            .failsWith(match.predicate(v => v > 0, {positive: ""}),
                {[MatchResult.was]: "ab", [MatchResult.expected]: {positive: ""}});
    });
});

function pred() {
    return false;
}