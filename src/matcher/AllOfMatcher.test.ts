import {match} from "../match";
import {internalAssertThat} from "../utility/internalAssertThat"

describe("AllOfMatcher:", () => {
    it("Matches", () => {
        internalAssertThat({a: 2}).is(match.allOf([]))
        internalAssertThat({a: 2}).is(match.allOf([match.instanceOf(Object)]))
        internalAssertThat(new Date()).is(match.allOf([match.instanceOf(Object), match.instanceOf(Date)]))
    })

    it("Mismatches with first one wrong", () => {
        internalAssertThat(3)
            .failsWith(match.allOf([match.instanceOf(Date), 3]))
            .wasExpected(3, {instanceOf: "Date"},
                ['actual: 3, expected: {instanceOf: "Date"}'])
    })

    it("Mismatches with second one wrong", () => {
        internalAssertThat(3)
            .failsWith(match.allOf([3, match.instanceOf(Date)]))
            .wasExpected(3, {instanceOf: "Date"},
                ['actual: 3, expected: {instanceOf: "Date"}'])
    })

    it("Mismatches with both wrong, so just shows the first wrong one", () => {
        internalAssertThat(3)
            .failsWith(match.allOf([match.instanceOf(Date), 4]))
            .wasExpected(3, {instanceOf: "Date"},
                ['actual: 3, expected: {instanceOf: "Date"}'])
    })
})
