import {match} from "../match";
import {testing} from "../testing"

describe("array.everyRecursive:", () => {
    describe("assertThat():", () => {
        it('empty array succeeds', () => {
            testing.pass([], match.array.everyRecursive(() => 2), 1)
        })

        it('number', () => {
            testing.pass([2, 2, 2], match.array.everyRecursive(() => 2), 3)
        })

        it('string', () => {
            testing.pass(["b", "b"], match.array.everyRecursive(() => "b"), 2)
        })

        it('one element does not match string', () => {
            testing.fail(["a", "b"], match.array.everyRecursive(() => "b"),
                ['test[0]: "a", expected: "b"'], 1,
                2, [testing.wasExpected("a", "b"), "b"])
        })

        it('one element does not match matcher', () => {
            const expected = match.array.everyRecursive(() => match.ofType.number())
            testing.fail([2, 2, "3"], expected,
                [`test[2]: "3", expected: "ofType.number"`], 2,
                3, [2, 2, testing.wasExpected("3", "ofType.number")])
        })

        it('Not an array', () => {
            const expected = match.array.everyRecursive(() => match.ofType.number())
            testing.fail(3, expected,
                [`test: 3, expected: "array expected"`], 0,
                1, testing.wasExpected(3, {"array.everyRecursive": "ofType.number"}))
        })
    })
})
