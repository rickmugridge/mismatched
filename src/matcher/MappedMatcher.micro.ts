import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

describe("MappedMatcher()", () => {
    it("matches", () => {
        assertThat({m: 2}).is(match.mapped(a => a.m, 2, {extract: "m"}));
    });

    it("mismatches", () => {
        assertThat(3).failsWith(match.mapped(a => a.m, 2, {extract: "m"}),
            {
                [MatchResult.was]: 3,
                [MatchResult.expected]: {mapped: {description: {extract: "m"}, matcher: 2}}});
    });
});