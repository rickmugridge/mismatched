import {assertThat} from "../assertThat";
import {match} from "../match";
import {ContextOfValidationError} from "../matcher/DiffMatcher";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"
import * as diff from "fast-array-diff";
import {MatchResult} from "../MatchResult"
import {matchMaker} from "../matchMaker/matchMaker"
import {Mismatched} from "../matcher/Mismatched"
import {ArrayDiff} from "./arrayDiff"

const context = new ContextOfValidationError("test")
const compare = (v1: number, v2: number): boolean => v1 === v2
const check = (actuals: any[], matchers: any[]): [MatchResult, Mismatched[]] => {
    const mismatched: Mismatched[] = []
    const result = ArrayDiff.matchResulting(context,
        actuals, matchers.map(matchMaker), mismatched)
    return [result, mismatched]
}
const mapMatchResultToMatchRate = (expectedRate: number) =>
    match.mapped((mr: MatchResult) => mr.matchRate,
        expectedRate, `MatchResult with a matchRate of ${expectedRate}`)

describe("arrayDiff", () => {
    describe("same length", () => {
        it("[] matched by []", () => {
            const [result, mismatched] =
                check([], [])
            assertThat(result).is({
                diff: {},
                compares: 1, matches: 1, matchRate: 1.0, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([])
        })

        it("[1] matched by [1]", () => {
            const [result, mismatched] =
                check([1], [1])
            assertThat(result).is({
                diff: [1],
                compares: 2, matches: 2, matchRate: 1.0, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([])
        })

        it("[undefined] matched by [undefined]", () => {
            const [result, mismatched] =
                check([undefined], [undefined])
            assertThat(result).is({
                diff: [undefined],
                compares: 2, matches: 2, matchRate: 1.0, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([])
        })

        it("[null] matched by [null]", () => {
            const [result, mismatched] =
                check([null], [null])
            assertThat(result).is({
                diff: [null],
                compares: 2, matches: 2, matchRate: 1.0, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([])
        })

        it("[] matched by [133]", () => {
            const [result, mismatched] =
                check([], [133])

            assertThat(result).is({
                diff: [expected(133)],
                compares: 2, matches: 1, matchRate: 0.5, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([
                "test: expected: 133"
            ])
        })

        it("[1] matched by []", () => {
            const [result, mismatched] =
                check([1], [])
            assertThat(result).is({
                diff: [unexpected(1)],
                compares: 2, matches: 1, matchRate: 0.5, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([
                "test: unexpected: 1"
            ])
        })

    })

    describe("same length not matching", () => {
        it("[2] matched by [133]", () => {
            const [result, mismatched] =
                check([2], [133])
            assertThat(mismatched).is([
                "test: unexpected: 2",
                "test: expected: 133"
            ])
            assertThat(result).is({
                diff: [unexpected(2), expected(133)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
        })

        it("[undefined] matched by [1]", () => {
            const [result, mismatched] =
                check([undefined], [144])
            assertThat(result).is({
                diff: [unexpected(undefined), expected(144)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([
                "test: unexpected: undefined",
                "test: expected: 144"
            ])
        })

        it("[1] matched by [undefined]", () => {
            const [result, mismatched] =
                check([1], [undefined])
            assertThat(result).is({
                diff: [unexpected(1), expected(undefined)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([
                "test: unexpected: 1",
                "test: expected: undefined"
            ])
        })

        it("[1, 3, 4] matched by [1, 2, 4]", () => {
            const [result, mismatched] =
                check([1, 3, 4], [1, 2])
            assertThat(result).is({
                diff: [1, unexpected(3), unexpected(4), expected(2)],
                compares: 5, matches: 2, matchRate: 2 / 5, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([
                "test: unexpected: 3",
                "test: unexpected: 4",
                "test: expected: 2"
            ])
        })

        it("[1,undefined] matched by [1, 2]", () => {
            const [result, mismatched] =
                check([1, undefined], [1, 2])
            assertThat(result).is({
                diff: [1, unexpected(undefined), expected(2)],
                compares: 4, matches: 2, matchRate: 1 / 2, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([
                "test: unexpected: undefined",
                "test: expected: 2"
            ])
        })

        it("[1, undefined] matched by [2, undefined]", () => {
            const [result, mismatched] =
                check([1, undefined], [2, undefined])
            assertThat(result).is({
                diff: [unexpected(1), undefined, expected(2)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
            assertThat(mismatched).is([
                "test: unexpected: 1",
                "test: expected: 2"
            ])
        })

        it("[{f:2}] matched by [{f:1}]", () => {
            const [result, mismatched] =
                check([{f: 2}], [{f: 1}])
            assertThat(result).is({
                diff: [unexpected(1), expected(undefined)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
        });

        it("[2] matched by [0]", () => {
            const [result, mismatched] =
                check([2], [0])
            assertThat(result).is({
                diff: [unexpected(1), expected(undefined)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
        })

        it("[0, 2] matched by [0, 1]", () => {
            const [result, mismatched] =
                check([0, 2], [0, 1])
            assertThat(result).is({
                diff: [unexpected(1), expected(undefined)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
        })

        it("[{id: 1, f: 2}] matched by [{id: match.obj.key(1), f: 1}]", () => {
            const [result, mismatched] =
                check([{id: 1, f: 2}], [{id: match.obj.key(1), f: 1}])
            assertThat(result).is({
                diff: [unexpected(1), expected(undefined)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
        })
    })

    describe("More actuals", () => {
        it("[10, {id: 1, f: 2}, 20] matched by [{id: match.obj.key(1), f: 1}]", () => {
            const [result, mismatched] =
                check([10, {id: 1, f: 2}, 20], [{id: match.obj.key(1), f: 1}])
            assertThat(result).is({
                diff: [unexpected(1), expected(undefined)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
        })

    })

    describe("More matchers", () => {
        it("[1] matched by [1, 2]", () => {
            const [result, mismatched] =
                check([1], [1, 2])
            assertThat(mismatched).is([
                {["test: Missing"]: 2}
            ])
            assertThat(result).is({
                diff: [1, expected(2)],
                compares: 2, matches: 0, matchRate: 0.0, matchedObjectKey: false
            } as MatchResult)
        })

        it("[2] matched by [1, 2]", () => {
            PrettyPrinter.logToConsole({
                r: diff.getPatch([2], [1, 2], compare),
                at: "arrayDiff.test.ts:19"
            }) // todo RM Remove
            const [result, mismatched] =
                check([2], [1, 2])

            assertThat(mismatched).is([
                {["test: Missing"]: 1}
            ])
            assertThat(result).is({
                diff: [unexpected(1), expected(undefined)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
        })

        it("[{id: 1, f: 2}] matched by [30, {id: match.obj.key(1), f: 1}, 40]", () => {
            const [result, mismatched] =
                check([{id: 1, f: 2}], [30, {id: match.obj.key(1), f: 1}, 40])
            assertThat(result).is({
                diff: [unexpected(1), expected(undefined)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
        });

        it("[{id: 1, f: 2}] matched by [30, 'A', 30, {id: match.obj.key(1), f: 1}, 40]", () => {
            const [result, mismatched] =
                check([{id: 1, f: 2}], [30, 'A', 30, {id: match.obj.key(1), f: 1}, 40])
            assertThat(result).is({
                diff: [unexpected(1), expected(undefined)],
                compares: 3, matches: 1, matchRate: 1 / 3, matchedObjectKey: false
            } as MatchResult)
        })
    })

    describe("With any()", () => {
        it("add here", () => {
            assertThat(true).is(false)
        })
    })
})

const expected = (value: any): any => {
    return {[MatchResult.expected]: value}
}
const unexpected = (value: any): any => {
    return {[MatchResult.unexpected]: value}
}