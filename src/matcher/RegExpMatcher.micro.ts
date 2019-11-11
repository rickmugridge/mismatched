import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

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
});