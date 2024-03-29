import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("MappedMatcher()", () => {
    describe("assertThat():", () => {
        const matcher = match.mapped((a: { m: number }) => a.m, 2, {extract: "m"});

        it("matches", () => {
            assertThat({m: 2}).is(matcher);
        });

        it("mismatches", () => {
            assertThat({m: 3}).failsWith(matcher,
                {
                    [MatchResult.was]: 3,
                    [MatchResult.expected]: {mapped: {description: {extract: "m"}, matcher: 2}}
                });
        });

        it("mismatches due to thrown exception in map()", () => {
            const matcher = match.mapped(() => {
                throw new Error('err')
            }, 2, {extract: "m"});
            assertThat({m: 3}).failsWith(matcher,
                {
                    [MatchResult.was]: "mapping failed: err",
                    [MatchResult.expected]: {mapped: {description: {extract: "m"}, matcher: 2}}
                });
        });

        it("mismatches: errors", () => {
            const mismatched: string[] = [];
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, 3);
            assertThat(mismatched).is([
                'actual: undefined, expected: 2'
            ]);
        });

        it("Handles a string mapped", () => {
            const actual = {
                detail: JSON.stringify({f: [0]})
            }
            assertThat(actual).is({detail: match.mapped(JSON.parse, {f: [0]}, 'json')})
        });
    });

    describe("validateThat():", () => {
        const matcher = match.mapped((a: {
            m: number
        }) => a.m, match.ofType.number(), {extract: "m"});
        it("succeeds", () => {
            const validation = validateThat({m: 2}).satisfies(matcher);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat({m: false}).satisfies(matcher);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `actual: false, expected: "ofType.number"`
            ]);
        });
    });
});