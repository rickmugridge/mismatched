import {match} from "../match";
import {internalAssertThat} from "../utility/internalAssertThat"
import {wasExpected} from "./Mismatched"

describe("array.everyRecursive()", () => {
    describe("Non-recursive", () => {
        it('empty array succeeds', () => {
            internalAssertThat([]).is(match.array.everyRecursive(() => 2))
        })

        it('number', () => {
            internalAssertThat([2, 2, 2]).is(match.array.everyRecursive(() => 2))
        })

        it('string', () => {
            internalAssertThat(["b", "b"]).is(match.array.everyRecursive(() => "b"))
        })

        it('one element does not match string', () => {
            internalAssertThat(["a", "b"])
                .failsWith(match.array.everyRecursive(() => "b"))
                .wasDiff([wasExpected("a", "b"), "b"], [`actual[0]: "a", expected: "b"`])
        })

        it('Not an array', () => {
            internalAssertThat(3)
                .failsWith(match.array.everyRecursive(() => match.ofType.number()))
                .wasDiff(wasExpected(3, "array.everyRecursive"), [`actual: 3, expected: "array expected"`])
        })
    })

    describe("recursive", () => {
        it("directly recursive", () => {
            type R = {
                item: number
                elements: R[]
            }
            const r: R = {
                item: 1,
                elements: [{item: 2, elements: [{item: 3, elements: []}]}]
            }
            const matcher = match.delay((): R => ({
                item: match.ofType.number(),
                elements: match.array.everyRecursive(() => matcher())
            }))
            internalAssertThat(r).is(matcher())
        })

        it("indirectly recursive", () => {
            type R = {
                item: number
                elements: S[]
            }
            type S = {
                item: number
                elements: R[]
            }
            const r: R = {
                item: 1,
                elements: [{item: 2, elements: [{item: 3, elements: []}]}]
            }
            const matcherR = match.delay((): R => ({
                item: match.ofType.number(),
                elements: match.array.everyRecursive(() => matcherS())
            }))
            const matcherS = (): S => ({
                item: match.ofType.number(),
                elements: match.array.everyRecursive(() => matcherR())
            })
            internalAssertThat(r).is(matcherR())
        })

        it("recursive subtypes", () => {
            type R = {
                item: number
                elements: RS[]
            }
            type S = {
                flag: boolean
                elements: RS[]
            }
            type RS = R | S

            const rs: RS = {
                item: 1,
                elements: [{flag: true, elements: [{item: 3, elements: []}]}]
            }
            const matcherRS = match.delay((): RS => match.anyOf([
                {
                    item: match.ofType.number(),
                    elements: match.array.everyRecursive(() => matcherRS())
                },
                {
                    flag: match.ofType.boolean(),
                    elements: match.array.everyRecursive(() => matcherRS())
                }
            ]))
            internalAssertThat(rs).is(matcherRS())
        })

        it("recursive subtypes based on fields", () => {
            type R = {
                r: {
                    item: number
                    extra: number
                    elements: RS[]
                }
            }
            type S = {
                s: {
                    flag: boolean
                    extra: number
                    elements: RS[]
                }
            }
            type RS = R | S

            const rs: RS = {
                r: {
                    item: 1, extra: 1, elements: [
                        {
                            s: {
                                flag: true, extra: 1, elements: [
                                    {
                                        r: {
                                            item: 3, extra: 1, elements: []
                                        }
                                    }]
                            }
                        }]
                }
            }
            const matcherRS = match.delay((): RS => match.anyOf([
                {
                    r: {
                        item: match.ofType.number(),
                        extra: 1,
                        elements: match.array.everyRecursive(() => matcherRS())
                    }
                },
                {
                    s: {
                        flag: match.ofType.boolean(),
                        extra: 1,
                        elements: match.array.everyRecursive(() => matcherRS())
                    }
                }
            ]))
            internalAssertThat(rs).is(matcherRS())
        })
    })
})
