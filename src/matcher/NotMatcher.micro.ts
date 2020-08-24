import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("NotMatcher()", () => {
    describe("assertThat():", () => {
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
            const mismatched: Array<Mismatched> = [];
            const matcher = match.not(2);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, 2);
            assertThat(mismatched).is([
                {actual: 2, expected: {not: 2}}
            ]);
        });
    });

    describe("validateThat():", () => {
        const expected = match.not(match.ofType.number());

        it("succeeds", () => {
            const validation = validateThat("3").satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: 3, expected: {not: "ofType.number"}}`
            ]);
        });
    });
});