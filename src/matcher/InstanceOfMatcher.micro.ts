import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

describe("InstanceOfMatcher:", () => {
    it("Matches", () => {
        assertThat(new Date()).is(match.instanceOf(Date));
        assertThat({a: 2}).is(match.instanceOf(Object));
    });

    it("Mismatches", () => {
        assertThat("ab")
            .failsWith(match.instanceOf(Date),
                {[MatchResult.was]: "ab", [MatchResult.expected]: {instanceOf: "Date"}});
        assertThat(null)
            .failsWith(match.instanceOf(Date),
                {[MatchResult.was]: null, [MatchResult.expected]: {instanceOf: "Date"}});
        assertThat(undefined)
            .failsWith(match.instanceOf(Date),
                {[MatchResult.expected]: {instanceOf: "Date"}});
    });
});