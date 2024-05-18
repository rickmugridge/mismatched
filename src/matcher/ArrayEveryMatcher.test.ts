import {match} from "../match";
import {internalAssertThat} from "../utility/internalAssertThat"
import {testing} from "../testing"
import wasExpected = testing.wasExpected

describe("array.every:", () => {
    describe("matches:", () => {
        it('empty array succeeds', () => {
            internalAssertThat([]).is(match.array.every(2))
        })

        it('number', () => {
            internalAssertThat([2, 2, 2]).is(match.array.every(2))
        })

        it('string', () => {
            internalAssertThat(["b", "b"]).is(match.array.every("b"))
        })
    })

    describe("mismatches:", () => {
        const expected = match.array.every(match.ofType.number())

        it('does not match', () => {
            internalAssertThat(["a", "b"])
                .failsWith(match.array.every("b"))
                .wasDiff([wasExpected("a", "b"), "b"],
                    ['actual[0]: "a", expected: "b"'])

            it("fails", () => {
                internalAssertThat([2, 2, "3"])
                    .failsWith(expected)
                    .wasDiff([2, 2, wasExpected("3", "ofType.number")],
                        ['actual[2]: "3", expected: "ofType.number"'])
            });

            it("fails as not an array", () => {
                internalAssertThat(3)
                    .failsWith(expected)
                    .wasExpected(3, {"array.every": "ofType.number"},
                        ['actual: 3, expected: "array expected"'])
            })
        })
    })
})
