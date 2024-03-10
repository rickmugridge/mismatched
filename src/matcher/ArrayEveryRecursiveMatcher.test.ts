import {match} from "../match";
import {testing} from "../testing"

describe("array.everyRecursive()", () => {
    describe("Non-recursive", () => {
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

        it('Not an array', () => {
            const expected = match.array.everyRecursive(() => match.ofType.number())
            testing.fail(3, expected,
                [`test: 3, expected: "array expected"`], 0,
                1, testing.wasExpected(3, "array.everyRecursive"))
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
            testing.pass(r, matcher(), 7)
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
            testing.pass(r, matcherR(), 7)
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
            testing.pass(rs, matcherRS(), 7)
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
            testing.pass(rs, matcherRS(), 13)
        })
    })
})
