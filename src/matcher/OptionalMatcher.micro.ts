import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("OptionalMatcher:", () => {
    it("Matches", () => {
        assertThat(3).is(match.optional(3));
        assertThat(undefined).is(match.optional(3));
    });

    it("Mismatches", () => {
        assertThat(4).failsWith(match.optional(3),
            {[MatchResult.was]: 4, [MatchResult.expected]: {optional: 3}});
    });

    it("Mismatches: errors", () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.optional(3);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, 4);
        assertThat(mismatched).is([
            {actual: 4, expected: {optional: 3}}
        ]);
    });
});