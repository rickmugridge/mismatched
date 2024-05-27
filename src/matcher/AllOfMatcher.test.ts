import {match} from "../match";
import {internalAssertThat} from "../utility/internalAssertThat"

describe("AllOfMatcher:", () => {
    it("Matches", () => {
        internalAssertThat({a: 2}).is(match.allOf([]))
        internalAssertThat({a: 2}).is(match.allOf([match.instanceOf(Object)]))
        internalAssertThat(new Date()).is(match.allOf([match.instanceOf(Object), match.instanceOf(Date)]))
    })

    it("Mismatches", () => {
        internalAssertThat(3)
            .failsWith(match.allOf([match.instanceOf(Date), 3]))
            .wasExpected(3, {instanceOf: "Date"},
                ['actual: 3, expected: {instanceOf: "Date"}'])
    })

    it("Optimise with 1", () => {
        internalAssertThat(34).is(match.allOf([34]))

        const whatever = match.ofType.array()
        internalAssertThat(match.allOf([whatever]), true).is(match.itIs(whatever))
    })

    it("Optimise with 1 left after removing match.any()s", () => {
        const whatever = match.ofType.array()
        internalAssertThat(match.allOf([match.any(), whatever, match.any()]), true).is(match.itIs(whatever))
    })
})
