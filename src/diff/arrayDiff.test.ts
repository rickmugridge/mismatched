import {match} from "../match";
import {testing} from "../testing"

const t = testing
describe("arrayDiff", () => {
    describe("same length", () => {
        it("[] matched by []", () => {
            t.passes([], [], 1)
        })

        it("[1] matched by [1]", () => {
            t.passes([1], [1], 2)
        })

        it("[undefined] matched by [undefined]", () => {
            t.passes([undefined], [undefined], 2)
        })

        it("[null] matched by [null]", () => {
            t.passes([null], [null], 2)
        })

        it("[2, 2] matched by [2, 2]", () => {
            testing.passes([2, 2], [2, 2], 3)
        })

        it("[] matched by [133]", () => {
            t.fails([], [133],
                [t.expected(133)],
                1, 2, ["test[]: expected: 133"])
        })

        it("[1] matched by []", () => {
            t.fails([1], [],
                [t.unexpected(1)],
                1, 2, ["test[0]: unexpected: 1"])
        })
    })

    describe("same length not matching", () => {
        it("[2] matched by [133]", () => {
            t.fails([2], [133],
                [t.unexpected(2), t.expected(133)],
                1, 3, [
                    "test[0]: unexpected: 2",
                    "test[]: expected: 133"
                ])
        })

        it("[undefined] matched by [1]", () => {
            t.fails([undefined], [144],
                [t.unexpected(undefined), t.expected(144)],
                1, 3, [
                    "test[0]: unexpected: undefined",
                    "test[]: expected: 144"
                ])
        })

        it("[1] matched by [undefined]", () => {
            t.fails([1], [undefined],
                [t.unexpected(1), t.expected(undefined)],
                1, 3, [
                    "test[0]: unexpected: 1",
                    "test[]: expected: undefined"
                ])
        })

        it("[1, 3, 4] matched by [1, 2]", () => {
            t.fails([1, 3, 4], [1, 2],
                [1, t.unexpected(3), t.unexpected(4), t.expected(2)],
                2, 5, [
                    "test[1]: unexpected: 3",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2"
                ])
        })

        it("[1,undefined] matched by [1, 2]", () => {
            t.fails([1, undefined], [1, 2],
                [1, t.unexpected(undefined), t.expected(2)],
                2, 4, [
                    "test[1]: unexpected: undefined",
                    "test[]: expected: 2"
                ])
        })

        it("[1, 0] matched by [2, 0]", () => {
            t.fails([1, 0], [2, 0],
                [t.unexpected(1), 0, t.expected(2)],
                2, 4, [
                    "test[0]: unexpected: 1",
                    "test[]: expected: 2"
                ])
        })

        it("[1, undefined] matched by [2, undefined]", () => {
            t.fails([1, undefined], [2, undefined],
                [t.unexpected(1), undefined, t.expected(2)],
                2, 4, [
                    "test[0]: unexpected: 1",
                    "test[]: expected: 2"
                ])
        })

        it("[0, 2] matched by [0, 1]", () => {
            t.fails([0, 2], [0, 1],
                [0, t.unexpected(2), t.expected(1)],
                2, 4, [
                    "test[1]: unexpected: 2",
                    "test[]: expected: 1"])
        })

        it("[{f:2}] matched by [{f:1}]", () => {
            t.fails([{f: 2}], [{f: 1}],
                [{f: t.wasExpected(2, 1)}],
                1.5, 2.5, [
                    'test[0].f: 2, expected: 1'])
        })

        it("[{id: 1, f: 2}] matched by [{id: match.obj.key(1), f: 1}]", () => {
            t.fails([{id: 1, f: 2}], [{id: match.obj.key(1), f: 1}], [{
                id: 1,
                f: t.wasExpected(2, 1)
            }], 2.5, 3.5, [
                'test[0].f: 2, expected: 1'])
        })
    })

    describe("More actual elements", () => {
        it("[10, {id: 1, f: 2}, 20] matched by [{id: match.obj.key(1), f: 1}]", () => {
            t.fails([10, {id: 1, f: 2}, 20], [{id: match.obj.key(1), f: 1}],
                [t.unexpected(10), {id: 1, f: t.wasExpected(2, 1)},
                    t.unexpected(20)], 2.5, 5.5, [
                    "test[0]: unexpected: 10",
                    "test[1].f: 2, expected: 1",
                    "test[2]: unexpected: 20"])
        })

    })

    describe("More matchers", () => {
        it("[1] matched by [1, 2]", () => {
            t.fails([1], [1, 2],
                [1, t.expected(2)], 2, 3,
                ["test[]: expected: 2"])
        })

        it("[2] matched by [1, 2]", () => {
            t.fails([2], [1, 2],
                [2, t.expected(1)], 2, 3,
                ["test[]: expected: 1"])
        })

        it("[{id: 1, f: 2}] matched by [30, {id: match.obj.key(1), f: 1}, 40]", () => {
            t.fails([{id: 1, f: 2}], [30, {id: match.obj.key(1), f: 1}, 40], [
                {id: 1, f: t.wasExpected(2, 1)},
                t.expected(30),
                t.expected(40)], 2.5, 5.5, [
                "test[0].f: 2, expected: 1",
                "test[]: expected: 30",
                "test[]: expected: 40"])
        })
    })

    describe("With any()", () => {
        it("[1, 3, 4] matched by [1, 2, *]", () => {
            t.fails([1, 3, 4], [1, 2, match.any()],
                [1,  t.unexpected(3),4, t.expected(2)],
                3, 5, [
                    "test[1]: unexpected: 3",
                    "test[]: expected: 2"
                ])
        })

        it("[1, 3, 4] matched by [*, 1, 2]", () => {
            t.fails([1, 3, 4], [match.any(), 1, 2],
                [1, t.wrongOrder(3), t.unexpected(4), t.expected(2)],
                2, 5, [
                    "test[]: out of order: 3",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2"
                ])
        })
    })

    describe("With undefined", () => {
        it("[1, 3, 4] matched by [1, 2, undefined]", () => {
            t.fails([1, 3, 4], [1, 2, undefined],
                [1,
                    t.unexpected(3),
                    t.unexpected(4),
                    t.expected(2),
                    t.expected(undefined),
                ],
                2, 6, [
                    "test[1]: unexpected: 3",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2",
                    "test[]: expected: undefined"
                ])
        })

        it("[1, 3, 4] matched by [1, undefined, 2]", () => {
            t.fails([1, 3, 4], [1, undefined, 2],
                [1,
                    t.unexpected(3),
                    t.unexpected(4),
                    t.expected(undefined),
                    t.expected(2),
                ],
                2, 6, [
                    "test[1]: unexpected: 3",
                    "test[2]: unexpected: 4",
                    "test[]: expected: undefined",
                    "test[]: expected: 2",
                ])
        })

        it("[1, undefined, 4] matched by [1, 2]", () => {
            t.fails([1, undefined, 4], [1, 2],
                [
                    1,
                    t.unexpected(undefined),
                    t.unexpected(4),
                    t.expected(2),
                ],
                2, 5, [
                    "test[1]: unexpected: undefined",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2",
                ])
        })

        it("[1, undefined, 4] matched by [undefined, 2]", () => {
            t.fails([1, undefined, 4], [undefined, 2],
                [
                    t.unexpected(1),
                    undefined,
                    t.unexpected(4),
                    t.expected(2),
                ],
                2, 5, [
                    "test[0]: unexpected: 1",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2",
                ])
        })
    })
})

