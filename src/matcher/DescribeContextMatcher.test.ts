import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("DescribeContextMatcher()", () => {
    const expected = match.describeContext(() => "four",
        match.describe(4, (actual, context) => `4 of ${context}`));

    describe("assertThat():", () => {
        it("matches", () => {
            assertThat(4).is(expected);
        });

        it("mismatches", () => {
            assertThat(2).failsWith(expected,
                {[MatchResult.was]: 2, [MatchResult.expected]: 4});
        });

        it("mismatches without a nested match.describe(), with no influence", () => {
            const expected = match.describeContext(() => "four", 4);
            assertThat(2).failsWith(expected,
                {[MatchResult.was]: 2, [MatchResult.expected]: 4});
        });

        it("mismatches: errors", () => {
            const mismatched: Array<Mismatched> = [];
            (expected as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, 2);
            assertThat(mismatched).is(["4 of four"]);
        });
    });

    describe("validateThat():", () => {
        it("succeeds", () => {
            const validation = validateThat(4).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                "4 of four"
            ]);
        });
    });

    it("describe example", () => {
        const results = validateThat({f: "a"})
            .satisfies({
                f: match.describe(match.ofType.number(), actual => `four, not ${actual}`)
            })
        assertThat(results.errors).is(["four, not a"])
    });
});