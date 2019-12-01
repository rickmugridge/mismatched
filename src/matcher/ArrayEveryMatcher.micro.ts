import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("array.every:", () => {
    it('number', () => {
        const actual = [2, 2, 2];
        assertThat(actual).is(match.array.every(2));
    });

    it('string', () => {
        const actual = ["b", "b"];
        assertThat(actual).is(match.array.every("b"));
    });

    it('does not match', () => {
        const actual = ["a", "b"];
        assertThat(actual).failsWith(match.array.every("b"),
            {[MatchResult.was]: ["a", "b"], [MatchResult.expected]: {"array.every": "b"}});
    });

    it('does not match: errors', () => {
        const actual = ["a", "b"];
        assertThat(actual).failsWith(match.array.every("b"),
            {[MatchResult.was]: ["a", "b"], [MatchResult.expected]: {"array.every": "b"}});

        const mismatched: Array<Mismatch> = [];
        const matcher = match.array.every("b");
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, ["a", "b"]);
        assertThat(mismatched).is([
            {"actual[0]": "a", expected: "b"}
        ]);
    });
});
