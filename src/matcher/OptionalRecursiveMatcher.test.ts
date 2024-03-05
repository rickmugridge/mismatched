import {match} from "../match";
import {testing} from "../testing"

describe("OptionalRecursiveMatcher:", () => {
    it("Matches When missing", () => {
        testing.pass(undefined, match.optionalRecursive(() => 3), 1)
    })

    it("Matches", () => {
        testing.pass(3, match.optionalRecursive(() => 3), 1)
    })

    it("Mismatches", () => {
        testing.fail(4, match.optionalRecursive(() => 3),
            ["test: 4, expected: 3"], 0, 1)
    })

    it("fails with wrong type", () => {
        const matcher = {f: match.optionalRecursive(() => match.ofType.number())}
        testing.fail({f: "wrong"}, matcher,
            [`test.f: "wrong", expected: "ofType.number"`],
            0.5, 1.5)
    })
})