import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

describe("OptionalMatcher:", () => {
    it("Matches", () => {
        assertThat(3).is(match.optional(3));
        assertThat(undefined).is(match.optional(3));
    });

    it("Mismatches", () => {
        assertThat(4).failsWith(match.optional(3),
            {[MatchResult.was]: 4, [MatchResult.expected]: {optional: 3}});
    });
});