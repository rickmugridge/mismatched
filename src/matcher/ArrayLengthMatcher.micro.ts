import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("array.length:", () => {
    it('matches', () => {
        const actual = ["b", "b"];
        assertThat(actual).is(match.array.length(2));
    });

    it('does not match', () => {
        const actual = ["a", "b"];
        assertThat(actual).failsWith(match.array.length(1),
            {[MatchResult.was]: 2, [MatchResult.expected]: {"array.length": 1}});
    });

    it('does not match: errors', () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.array.length(1);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, ["a", "b"]);
        assertThat(mismatched).is([
            {actual: ["a", "b"], expected: {"array.length": 1}}
        ]);
    });
});
