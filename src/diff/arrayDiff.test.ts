import {assertThat} from "../assertThat";
import {match} from "../match";
import {ContextOfValidationError} from "../matcher/DiffMatcher";
import {MatchResult} from "../MatchResult"
import {matchMaker} from "../matchMaker/matchMaker"
import {ArrayDiff} from "./arrayDiff"

const context = new ContextOfValidationError("test")
const passes = (actuals: any[], matchers: any[], matches: number) => {
    const mismatched: string[] = []
    const result = ArrayDiff.matchResulting(context,
        actuals, matchers.map(matchMaker), mismatched)
    assertThat(result.matches).is(matches)
    assertThat(mismatched).is([])
}

const fails = (actualElements: any[], matchers: any[], diffExpected: any,
               matchesExpected: number, comparesExpected: number, mismatchedExpected: string[]) => {
    const mismatched: string[] = []
    const result = ArrayDiff.matchResulting(context, actualElements,
        matchers.map(matchMaker), mismatched)
    assertThat({
        mismatched,
        diff: result.diff,
        matches: result.matches,
        compares: result.compares
    })
        .is({
            mismatched: mismatchedExpected,
            diff: diffExpected,
            matches: matchesExpected,
            compares: comparesExpected
        })
}

describe("arrayDiff", () => {
    describe("same length", () => {
        it("[] matched by []", () => {
            passes([], [], 1)
        })

        it("[1] matched by [1]", () => {
            passes([1], [1], 2)
        })

        it("[undefined] matched by [undefined]", () => {
            passes([undefined], [undefined], 2)
        })

        it("[null] matched by [null]", () => {
            passes([null], [null], 2)
        })

        it("[2, 2] matched by [2, 2]", () => {
            passes([2, 2], [2, 2], 3)
        })

        it("[] matched by [133]", () => {
            fails([], [133],
                [expected(133)],
                1, 2, ["test[]: expected: 133"])
        })

        it("[1] matched by []", () => {
            fails([1], [],
                [unexpected(1)],
                1, 2, ["test[0]: unexpected: 1"])
        })
    })

    describe("same length not matching", () => {
        it("[2] matched by [133]", () => {
            fails([2], [133],
                [unexpected(2), expected(133)],
                1, 3, [
                    "test[0]: unexpected: 2",
                    "test[]: expected: 133"
                ])
        })

        it("[undefined] matched by [1]", () => {
            fails([undefined], [144],
                [unexpected(undefined), expected(144)],
                1, 3, [
                    "test[0]: unexpected: undefined",
                    "test[]: expected: 144"
                ])
        })

        it("[1] matched by [undefined]", () => {
            fails([1], [undefined],
                [unexpected(1), expected(undefined)],
                1, 3, [
                    "test[0]: unexpected: 1",
                    "test[]: expected: undefined"
                ])
        })

        it("[1, 3, 4] matched by [1, 2]", () => {
            fails([1, 3, 4], [1, 2],
                [1, unexpected(3), unexpected(4), expected(2)],
                2, 5, [
                    "test[1]: unexpected: 3",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2"
                ])
        })

        it("[1,undefined] matched by [1, 2]", () => {
            fails([1, undefined], [1, 2],
                [1, unexpected(undefined), expected(2)],
                2, 4, [
                    "test[1]: unexpected: undefined",
                    "test[]: expected: 2"
                ])
        })

        it("[1, 0] matched by [2, 0]", () => {
            fails([1, 0], [2, 0],
                [unexpected(1), 0, expected(2)],
                2, 4, [
                    "test[0]: unexpected: 1",
                    "test[]: expected: 2"
                ])
        })

        it("[1, undefined] matched by [2, undefined]", () => {
            fails([1, undefined], [2, undefined],
                [unexpected(1), undefined, expected(2)],
                2, 4, [
                    "test[0]: unexpected: 1",
                    "test[]: expected: 2"
                ])
        })

        it("[0, 2] matched by [0, 1]", () => {
            fails([0, 2], [0, 1],
                [0, unexpected(2), expected(1)],
                2, 4, [
                    "test[1]: unexpected: 2",
                    "test[]: expected: 1"])
        })

        it("[{f:2}] matched by [{f:1}]", () => {
            fails([{f: 2}], [{f: 1}], [{
                f: {
                    [MatchResult.was]: 2,
                    [MatchResult.expected]: 1
                }
            }], 1.5, 2.5, [
                'test[0].f: 2, expected: 1'])
        })

        it("[{id: 1, f: 2}] matched by [{id: match.obj.key(1), f: 1}]", () => {
            fails([{id: 1, f: 2}], [{id: match.obj.key(1), f: 1}], [{
                id: 1,
                f: {[MatchResult.was]: 2, [MatchResult.expected]: 1}
            }], 2.5, 3.5, [
                'test[0].f: 2, expected: 1'])
        })
    })

    describe("More actual elements", () => {
        it("[10, {id: 1, f: 2}, 20] matched by [{id: match.obj.key(1), f: 1}]", () => {
            fails([10, {id: 1, f: 2}, 20], [{id: match.obj.key(1), f: 1}], [unexpected(10),
                {id: 1, f: {[MatchResult.was]: 2, [MatchResult.expected]: 1}},
                unexpected(20)], 2.5, 5.5, [
                "test[0]: unexpected: 10",
                "test[1].f: 2, expected: 1",
                "test[2]: unexpected: 20"])
        })

    })

    describe("More matchers", () => {
        it("[1] matched by [1, 2]", () => {
            fails([1], [1, 2],
                [1, expected(2)], 2, 3,
                ["test[]: expected: 2"])
        })

        it("[2] matched by [1, 2]", () => {
            fails([2], [1, 2],
                [2, expected(1)], 2, 3,
                ["test[]: expected: 1"])
        })

        it("[{id: 1, f: 2}] matched by [30, {id: match.obj.key(1), f: 1}, 40]", () => {
            fails([{id: 1, f: 2}], [30, {id: match.obj.key(1), f: 1}, 40], [
                {id: 1, f: {[MatchResult.was]: 2, [MatchResult.expected]: 1}},
                expected(30),
                expected(40)], 2.5, 5.5, [
                "test[0].f: 2, expected: 1",
                "test[]: expected: 30",
                "test[]: expected: 40"])
        })
    })

    describe("With any()", () => {
        it("[1, 3, 4] matched by [1, 2, *]", () => {
            fails([1, 3, 4], [1, 2, match.any()],
                [1, 3, unexpected(4), expected(2)],
                3, 5, [
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2"
                ])
        })

        it("[1, 3, 4] matched by [*, 1, 2]", () => {
            fails([1, 3, 4], [match.any(), 1, 2],
                [1, wrongOrder(3), unexpected(4), expected(2)],
                2, 5, [
                    "test[]: out of order: 3",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2"
                ])
        })
    })

    describe("With undefined", () => {
        it("[1, 3, 4] matched by [1, 2, undefined]", () => {
            fails([1, 3, 4], [1, 2, undefined],
                [1,
                    unexpected(3),
                    unexpected(4),
                    expected(2),
                    expected(undefined),
                ],
                2, 6, [
                    "test[1]: unexpected: 3",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2",
                    "test[]: expected: undefined"
                ])
        })

        it("[1, 3, 4] matched by [1, undefined, 2]", () => {
            fails([1, 3, 4], [1, undefined, 2],
                [1,
                    unexpected(3),
                    unexpected(4),
                    expected(undefined),
                    expected(2),
                ],
                2, 6, [
                    "test[1]: unexpected: 3",
                    "test[2]: unexpected: 4",
                    "test[]: expected: undefined",
                    "test[]: expected: 2",
                ])
        })

        it("[1, undefined, 4] matched by [1, 2]", () => {
            fails([1, undefined, 4], [1, 2],
                [
                    1,
                    unexpected(undefined),
                    unexpected(4),
                    expected(2),
                ],
                2, 5, [
                    "test[1]: unexpected: undefined",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2",
                ])
        })

        it("[1, undefined, 4] matched by [undefined, 2]", () => {
            fails([1, undefined, 4], [undefined, 2],
                [
                    unexpected(1),
                    undefined,
                    unexpected(4),
                    expected(2),
                ],
                2, 5, [
                    "test[0]: unexpected: 1",
                    "test[2]: unexpected: 4",
                    "test[]: expected: 2",
                ])
        })
    })
})

const expected = (value: any): any => {
    return {[MatchResult.expected]: value}
}
const unexpected = (value: any): any => {
    return {[MatchResult.unexpected]: value}

}

const wrongOrder = (value: any): any => {
    return {[MatchResult.wrongOrder]: value}
}