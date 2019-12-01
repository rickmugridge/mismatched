import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {AllOfMatcher} from "./AllOfMatcher";

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

    it("Mismatches: errors", () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = AllOfMatcher.make([match.instanceOf(Date), 3]);
        matcher.mismatches("actual", mismatched, 4);
        assertThat(mismatched).is([
            {actual: 4, expected: {instanceOf: "Date"}},
            {actual: 4, expected: 3}
        ])
    });
});