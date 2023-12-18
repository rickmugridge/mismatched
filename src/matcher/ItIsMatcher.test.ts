import {match} from "../match";
import {assertThat} from "../assertThat";
import {Mismatched} from "./Mismatched";
import {DiffMatcher, ContextOfValidationError} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("match.itIs():", () => {
    describe("assertThat():", () => {
        it('object itself', () => {
            const actual = {a: "b"};
            assertThat(actual).is(match.itIs(actual));
            assertThat(actual).isNot(match.itIs({a: "b"}));
        });

        it('array itself', () => {
            const actual = [1, 2, 3];
            assertThat(actual).is(match.itIs(actual));
            assertThat(actual).isNot(match.itIs([1, 2, 3]));
        });

        it('array itself mismatches: errors', () => {
            const mismatched: Array<Mismatched> = [];
            const matcher = match.itIs([1, 2, 3]);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, [1, 2, 3]);
            assertThat(mismatched).is([
                {actual: [1, 2, 3], expected: {itIsTheSameObjectAs: [1, 2, 3]}}
            ]);
        });
    });

    describe("validateThat():", () => {
        const expectedValue = {a: 3};
        const expected = match.itIs(expectedValue);

        it("succeeds", () => {
            const validation = validateThat(expectedValue).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const validation = validateThat(false).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: false, expected: {itIsTheSameObjectAs: {a: 3}}}`
            ]);
        });
    });
});
