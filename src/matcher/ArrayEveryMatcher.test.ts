import {assertThat} from "../assertThat";
import {match} from "../match";
import {validateThat} from "../validateThat";
import {wasExpected} from "./Mismatched"

describe("array.every:", () => {
    describe("assertThat():", () => {
        it('empty array succeeds', () => {
            const actual = []
            assertThat(actual).is(match.array.every(2))
        })

        it('number', () => {
            const actual = [2, 2, 2]
            assertThat(actual).is(match.array.every(2))
        })

        it('string', () => {
            const actual = ["b", "b"]
            assertThat(actual).is(match.array.every("b"))
        })

        it('does not match', () => {
            const actual = ["a", "b"]
            assertThat(actual).failsWith(match.array.every("b"),
                [wasExpected("a", "b"), "b"])
        })
    })

    describe("validateThat():", () => {
        const expected = match.array.every(match.ofType.number())

        it("succeeds", () => {
            const validation = validateThat([2, 2, 2]).satisfies(expected)
            assertThat(validation.passed()).is(true)
        });

        it("fails", () => {
            const validation = validateThat([2, 2, "3"]).satisfies(expected)
            assertThat(validation.passed()).is(false)
            assertThat(validation.errors).is([
                `{"actual[2]": "3", expected: "ofType.number"}`
            ])
        });

        it("fails as not an array", () => {
            const validation = validateThat(3).satisfies(expected)
            assertThat(validation.passed()).is(false)
            assertThat(validation.errors).is([
                `{actual: 3, expected: "array expected"}`
            ])
        })
    })
})
