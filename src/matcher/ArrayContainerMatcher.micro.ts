import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("array.contains:", () => {
    describe("assertThat():", () => {
        it('number', () => {
            const actual = [1, 2, 3];
            assertThat(actual).is(match.array.contains(2));
        });

        it('string', () => {
            const actual = ["a", "b"];
            assertThat(actual).is(match.array.contains("b"));
        });

        it('does not match', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(match.array.contains("c"),
                {[MatchResult.was]: ["a", "b"], [MatchResult.expected]: {"array.contains": "c"}});
        });

        it('does not match with empty array', () => {
            const actual = [];
            assertThat(actual).isNot(match.array.contains("c"));
        });

        it('does not match: errors', () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.array.contains("c");
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, ["a", "b"]);
            assertThat(mismatched).is([
                {actual: ["a", "b"], expected: {"array.contains": "c"}}
            ]);
        });
    });

    describe("validateThat():", () => {
        const expected = match.array.contains(match.ofType.number());

        it("succeeds", () => {
            const validation = validateThat([1, 2, 3]).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails in an element of the array", () => {
            const validation = validateThat(["1", "2", "3"]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: ["1", "2", "3"], expected: {"array.contains": "ofType.number"}}`
            ])
        });

        it("fails as not an array", () => {
            const validation = validateThat(4).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: 4, expected: "array expected"}`
            ])
        });
    });
});
