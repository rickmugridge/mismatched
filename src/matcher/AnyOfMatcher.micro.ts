import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("AnyOfMatcher:", () => {
    it("Matches", () => {
        assertThat(new Date()).isAnyOf([match.isEquals(3), match.instanceOf(Date)]);
        assertThat({a: 2}).isAnyOf([match.instanceOf(Object)]);
    });

    it("Mismatches", () => {
        assertThat("ab")
            .failsWith(match.anyOf([match.instanceOf(Date)]),
                {[MatchResult.was]: "ab", [MatchResult.expected]: {anyOf: [{instanceOf: "Date"}]}});
    });

    it("Mismatches: errors", () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.anyOf([match.instanceOf(Date)]);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, "ab");
        assertThat(mismatched).is([
            {actual: "ab", expected: {anyOf: [{instanceOf: "Date"}]}}
        ]);
    });
});