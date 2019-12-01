import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatch} from "./Mismatch";
import {DiffMatcher} from "./DiffMatcher";

describe("NotMatcher()", () => {
    it("matches", () => {
        assertThat(2).is(match.not(4));
        assertThat(2).isNot(4);
        assertThat(true).is(match.not(false));
        assertThat({f: 2}).is(match.not("a"));
    });

    it("mismatches", () => {
        assertThat(2).failsWith(match.not(2),
            {[MatchResult.was]: 2, [MatchResult.expected]: {not: 2}});
        assertThat({f: 2}).failsWith(match.not({f: 2}),
            {[MatchResult.was]: {f: 2}, [MatchResult.expected]: {not: {f: 2}}});
    });

    it("mismatches: errors", () => {
        const mismatched: Array<Mismatch> = [];
        const matcher = match.not(2);
        (matcher as DiffMatcher<any>).mismatches("actual", mismatched, 2);
        assertThat(mismatched).is([
            {actual: 2, expected: {not: 2}}
        ]);
    });
});