import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("array.every:", () => {
    describe("assertThat():", () => {
        it('empty array suceeds', () => {
            const actual = [];
            assertThat(actual).is(match.array.every(2));
        });

        it('number', () => {
            const actual = [2, 2, 2];
            assertThat(actual).is(match.array.every(2));
        });

        it('string', () => {
            const actual = ["b", "b"];
            assertThat(actual).is(match.array.every("b"));
        });

        it('does not match', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(match.array.every("b"),
                {[MatchResult.was]: ["a", "b"], [MatchResult.expected]: {"array.every": "b"}});
        });

        it('does not match: errors', () => {
            const actual = ["a", "b"];
            assertThat(actual).failsWith(match.array.every("b"),
                {[MatchResult.was]: ["a", "b"], [MatchResult.expected]: {"array.every": "b"}});

            const mismatched: Array<Mismatched> = [];
            const matcher = match.array.every("b");
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, ["a", "b"]);
            assertThat(mismatched).is([
                {"actual[0]": "a", expected: "b"}
            ]);
        });
    });

    describe("validateThat():", () => {
        const expected = match.array.every(match.ofType.number());

        it("succeeds", () => {
            const validation = validateThat([2, 2, 2]).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat([2, 2, "3"]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{"actual[2]": "3", expected: "ofType.number"}`
            ])
        });

        it("fails as not an array", () => {
            const validation = validateThat(3).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: 3, expected: "array expected"}`
            ])
        });
    });
});
