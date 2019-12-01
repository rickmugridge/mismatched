import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("PredicateMatcher:", () => {
    it("Matches", () => {
        assertThat(5).is(match.predicate(v => v > 0));
        assertThat({a: 2}).is(v => v.a === 2);
    });

    it("Mismatches", () => {
        assertThat("ab")
            .failsWith(match.predicate(pred),
                {[MatchResult.was]: "ab", [MatchResult.expected]: {function: "pred()"}});
        assertThat("ab")
            .failsWith(match.predicate(v => v > 0),
                {[MatchResult.was]: "ab", [MatchResult.expected]: {arrow: "v => v > 0"}});
    });

    it("Mismatches: errors", () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.predicate(pred);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, "ab");
        assertThat(mismatched).is([
            {actual: "ab", expected: {"function": "pred()"}}
        ]);
    });
});

function pred() {
    return false;
}