import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("array.contains:", () => {
    it('number', () => {
        const actual = [1, 2, 3];
        assertThat(actual).is(match.array.contains(2));
    });

    it('string', () => {
        const actual = ["a", "b"];
        assertThat(actual).is(match.array.contains("b"));
    });

    it('does not match', () => {
        const actual = ["a", "b"];
        assertThat(actual).failsWith(match.array.contains("c"),
            {[MatchResult.was]: ["a", "b"], [MatchResult.expected]: {"array.contains": "c"}});
    });

    it('does not match: errors', () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.array.contains("c");
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, ["a", "b"]);
        assertThat(mismatched).is([
            {actual: ["a", "b"], expected: {"array.contains": "c"}}
        ]);
    });
});
