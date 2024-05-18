import {match} from "../match";
import {internalAssertThat} from "../utility/internalAssertThat"
import {wasExpected} from "./Mismatched"

describe("OptionalRecursiveMatcher:", () => {
    it("Matches When missing", () => {
        internalAssertThat(undefined).is(match.optionalRecursive(() => 3))
    })

    it("Matches", () => {
        internalAssertThat(3).is(match.optionalRecursive(() => 3))
    })

    it("Mismatches", () => {
        internalAssertThat(4)
            .failsWith(match.optionalRecursive(() => 3))
            .wasExpected(4, 3, ["actual: 4, expected: 3"])
    })

    it("fails with wrong type", () => {
        const matcher = {f: match.optionalRecursive(() => match.ofType.number())}
        internalAssertThat({f: "wrong"})
            .failsWith(matcher)
            .wasDiff({f: wasExpected("wrong", "ofType.number")},
                [`actual.f: "wrong", expected: "ofType.number"`])
    })
})