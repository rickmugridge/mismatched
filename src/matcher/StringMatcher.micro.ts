import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("StringMatcher:", () => {
    it('string', () => {
        const actual = "a";
        assertThat(actual).is(match.string.match(actual));
        assertThat(actual).is(actual);
    });

    it('mismatches', () => {
        assertThat("a").failsWith("b",
            {[MatchResult.was]: "a", [MatchResult.expected]: "b"});
        assertThat("a").failsWith(null,
            {[MatchResult.was]: "a", [MatchResult.expected]: null});
    });

    it('mismatches: errors', () => {
        assertThat("a").failsWith("b",
            {[MatchResult.was]: "a", [MatchResult.expected]: "b"});

        const mismatched: Array<Mismatch> = [];
        const matcher = match.string.match("b");
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, "a");
        assertThat(mismatched).is([
            {actual: "a", expected: "b"}
        ]);
    });
});
