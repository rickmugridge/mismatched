import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("RegExpMatcher:", () => {
    it("Matches", () => {
        assertThat("ab").is(match.regEx.match(/a./));
        assertThat("ab").is(match.regEx.match(/ab/));
        assertThat(/[ap]\.?m?\.?/i).is(/[ap]\.?m?\.?/i);
    });

    it("Mismatches", () => {
        assertThat("ab").failsWith(match.regEx.match(/c/),
            {[MatchResult.was]: "ab", [MatchResult.expected]: "/c/"});
    });

    it("Mismatches: errors", () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.regEx.match(/c/);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, "ab");
        assertThat(mismatched).is([
            {actual: "ab", expected: "/c/"}
        ]);
    });
});