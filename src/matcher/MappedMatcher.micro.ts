import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("MappedMatcher()", () => {

    describe("assertThat():", () => {
        const matcher = match.mapped(a => a.m, 2, {extract: "m"});
        it("matches", () => {
            assertThat({m: 2}).is(matcher);
        });

        it("mismatches", () => {
            assertThat(3).failsWith(matcher,
                {
                    [MatchResult.was]: 3,
                    [MatchResult.expected]: {mapped: {description: {extract: "m"}, matcher: 2}}
                });
        });

        it("mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            (matcher as DiffMatcher<any>).mismatches("actual", mismatched, 3);
            assertThat(mismatched).is([
                {actual: undefined, expected: 2}
            ]);
        });
    });

    describe("validateThat():", () => {
        const matcher = match.mapped(a => a.m, match.ofType.number(), {extract: "m"});
        it("succeeds", () => {
            const validation = validateThat({m: 2}).satisfies(matcher);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat({m: false}).satisfies(matcher);
            assertThat(validation.passed()).is(false);
            assertThat(validation.mismatched).is([
                {actual: false, expected: "ofType.number"}
            ]);
        });
    });
});