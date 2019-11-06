import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

describe("StringMatcher:", () => {
    it('string', () => {
        const actual = "a";
        assertThat(actual).is(match.string.match(actual));
        assertThat(actual).is(actual);
    });

    it('string', () => {
        assertThat("a").failsWith("b",
            {[MatchResult.was]: "a", [MatchResult.expected]: "b"});
        assertThat("a").failsWith(null,
            {[MatchResult.was]: "a", [MatchResult.expected]: null});
    });
});
