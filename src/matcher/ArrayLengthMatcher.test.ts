import {assertThat} from "../assertThat";
import {match} from "../match";
import {wasExpected} from "./Mismatched";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher"
import {validateThat} from "../validateThat"

describe("array.length:", () => {
    describe("assertThat():", () => {
        it('matches', () => {
            const actual = ["b", "b"]
            assertThat(actual).is(match.array.length(2))
        });

        it('does not match', () => {
            const actual = ["a", "b"]
            assertThat(actual).failsWith(match.array.length(1),
                wasExpected(2, {"array.length": 1}))
        })

        it('does not match: errors', () => {
            const mismatched: string[] = [];
            const matcher = match.array.length(1);
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, ["a", "b"])
            assertThat(mismatched).is([
                'actual: ["a", "b"], expected: {"array.length": 1}'
            ])
        })
    })

    describe("validateThat():", () => {
        const expected = match.array.length(2)

        it("succeeds", () => {
            const validation = validateThat(["b", "b"]).satisfies(expected)
            assertThat(validation.passed()).is(true);
        })

        it("fails", () => {
            const validation = validateThat(["b", "b", "b"]).satisfies(expected)
            assertThat(validation.passed()).is(false)
            assertThat(validation.errors).is([
                `actual: ["b", "b", "b"], expected: {"array.length": 2}`
            ])
        })
    })
})
