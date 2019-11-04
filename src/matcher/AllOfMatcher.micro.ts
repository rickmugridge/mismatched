import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

describe("AllOfMatcher:", () => {
    it("Matches", () => {
        assertThat({a: 2}).isAllOf([match.instanceOf(Object)]);
        assertThat(new Date()).isAllOf([match.instanceOf(Object), match.instanceOf(Date)]);
    });

    it("Mismatches", () => {
        assertThat(3)
            .failsWith(match.allOf([match.instanceOf(Date), 3]),
                {[MatchResult.was]: 3, [MatchResult.expected]: {allOf: [{instanceOf: "Date"}, 3]}});
    });
});