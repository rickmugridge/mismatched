import {assertThat} from "../assertThat";
import {match} from "../match";
import {wasExpected} from "./Mismatched";

describe("SelectMatch", () => {
    describe("Simple selection", () => {
        const matcherWithError = match.selectMatch((actual: any) => {
            switch (actual.a) {
                case 1:
                    return {a: 1, b: 2}
                case 2:
                    return {a: 2, b: 3}
                default:
                    throw new Error("unknown choice")
            }
        })
        const matcherWithUndefined = match.selectMatch((actual: any) => undefined)

        it("works", () => {
            assertThat({a: 1, b: 2}).is(matcherWithError)
            assertThat({a: 2, b: 3}).is(matcherWithError)
            assertThat([{a: 1, b: 2}, {
                a: 2,
                b: 3
            }]).is([matcherWithError, matcherWithError])
        })

        it("fails correctly when the selected matcher fails", () => {
            assertThat({a: 2, b: 2}).failsWith(matcherWithError,
                {a: 2, b: wasExpected(2, 3)})
        })

        it("fails correctly when the selectMatch throws an Error", () => {
            assertThat({a: 3, b: 2}).failsWith(matcherWithError,
                wasExpected(
                    {actual: {a: 3, b: 2}, exception: "unknown choice"},
                    "selectMatch selector to return some value or matcher"))

        })

        it("fails correctly when the selectMatch returns undefined", () => {
            assertThat({a: 3, b: 2}).failsWith(matcherWithUndefined,
                wasExpected(
                    {a: 3, b: 2},
                    "selectMatch selector to return some value or matcher"))
        })
    })

    describe("subtype validation", () => {
        enum Discriminator {A, B, C}

        type A = { discriminator: Discriminator.A, a: number }
        type B = { discriminator: Discriminator.B, a: string }
        type C = { discriminator: Discriminator.C, a: boolean }
        type UnionType = A | B | C

        it("uses match.anyOf()", () => {
            const matcher = match.anyOf([
                {discriminator: Discriminator.A, a: match.ofType.number()},
                {discriminator: Discriminator.B, a: match.ofType.string()},
                {discriminator: Discriminator.C, a: match.ofType.boolean()},
            ])
            assertThat({discriminator: Discriminator.A, a: 1}).is(matcher)
            assertThat({discriminator: Discriminator.B, a: "1"}).is(matcher)
            assertThat({discriminator: Discriminator.C, a: true}).is(matcher)
        })

        it("uses match.selectMatch()", () => {
            const matcher = match.selectMatch((actual: UnionType): any => {
                switch (actual.discriminator) {
                    case Discriminator.A:
                        return {discriminator: Discriminator.A, a: match.ofType.number()}
                    case Discriminator.B:
                        return {discriminator: Discriminator.B, a: match.ofType.string()}
                    case Discriminator.C:
                        return {discriminator: Discriminator.C, a: match.ofType.boolean()}
                }
            })
            assertThat({discriminator: Discriminator.A, a: 1}).is(matcher)
            assertThat({discriminator: Discriminator.B, a: "1"}).is(matcher)
            assertThat({discriminator: Discriminator.C, a: true}).is(matcher)

            let actualArrayOfSubtype = [
                {discriminator: Discriminator.A, a: 1},
                {discriminator: Discriminator.B, a: "1"}
            ]
            assertThat(actualArrayOfSubtype).is([matcher, matcher])

            assertThat({discriminator: Discriminator.A, a: "1"}).isNot(matcher)
            assertThat({discriminator: Discriminator.A, a: true}).isNot(matcher)
            assertThat({discriminator: Discriminator.B, a: 1}).isNot(matcher)
        })

        it("An example where we can't use match.selectMatch() due to discriminator location", () => {
            enum Discriminator {A = "A", B = "B", C = "C"}

            type A = { a: number }
            type B = { a: string }
            type C = { a: boolean }
            type UnionType = A | B | C
            const matchHolds = match.anyOf([
                {discriminator: Discriminator.A, sub: {a: 1}, otherDetails: {}},
                {discriminator: Discriminator.B, sub: {a: "1"}, otherDetails: {}},
                {discriminator: Discriminator.C, sub: {a: true}, otherDetails: {}},
            ])

            let actual: any = {discriminator: Discriminator.A, sub: {a: 1}, otherDetails: {}}
            assertThat(actual).is(matchHolds)
        })
    })

    it("Can also help with matching the elements of an array", () => {

    })
})