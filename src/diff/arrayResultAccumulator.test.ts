import {ArrayResultAccumulator, newArrayResultAccumulator} from "./arrayResultAccumulator"
import {ContextOfValidationError} from "../matcher/DiffMatcher"
import {Mismatched} from "../matcher/Mismatched"
import {ArrayDiff} from "./arrayDiff"
import {assertThat} from "../assertThat"
import {Assignations} from "./BestMatcherAssignments"
import {matchMaker} from "../matchMaker/matchMaker"
import {match} from "../match"
import {MatchResult} from "../MatchResult"

const context = new ContextOfValidationError("test")
const check = (actual: any, matcher: any): [ArrayResultAccumulator, Assignations<any>, string[]] => {
    const [deltaMappings, assignations, assignedActualElements] =
        ArrayDiff.determineMatchResultOrDeltaMappings(
            context, [actual], [matchMaker(matcher)])
    const finalMismatched: string[] = []
    const resultAccumulator = newArrayResultAccumulator(
        context, [actual], [matchMaker(matcher)], finalMismatched)
    return [resultAccumulator, assignations, finalMismatched]
}
const mapMatchResultToMatchRate = (expectedRate: number) =>
    match.mapped((mr: MatchResult) => mr.matchRate,
        expectedRate, `MatchResult with a matchRate of ${expectedRate}`)

describe("arrayResultAccumulator", () => {
    it("wasExpected", () => {
        const [accumulator, assignations, finalMismatched] =
            check({a: 1}, {a: 2})
        accumulator.wasExpected(assignations.assignments[0], 0)
        const result = accumulator.getMatchResult()

        assertThat(finalMismatched).is([
            'test.a: 1, expected: 2'])
        assertThat(result.diff).is(
            [{a: {[MatchResult.was]: 1, [MatchResult.expected]: 2}}])
        assertThat(result.matchRate).is(0.6)
    })

    it("extraActual", () => {
        const [accumulator, assignations, finalMismatched] =
            check({a: 1}, {a: 2}) // Details of match are irrelevant below
        accumulator.extraActual(0)
        const result = accumulator.getMatchResult()

        assertThat(result.diff).is(
            [{[MatchResult.unexpected]: {a: 1}}])
        assertThat(result.matchRate).is(0.5)
        assertThat(finalMismatched).is([
            "test: unexpected: {a: 1}"])
    })

    it("outOfOrder", () => {
        const [accumulator, assignations, finalMismatched] =
            check({a: 1}, {a: 2}) // Details of match are irrelevant below
        accumulator.outOfOrder(0)
        const result = accumulator.getMatchResult()

        assertThat(result.diff).is(
            [{[MatchResult.wrongOrder]: {a: 1}}])
        assertThat(result.matchRate).is(0.5)
        assertThat(finalMismatched).is([
            "test: out of order: {a: 1}"])
    })

    it("extraMatcher", () => {
        const [accumulator, assignations, finalMismatched] =
            check({a: 1}, {a: 2}) // Details of match are irrelevant below
        accumulator.extraMatcher(0)
        const result = accumulator.getMatchResult()

        assertThat(result.diff).is(
            [{[MatchResult.expected]: {a: 2}}])
        assertThat(result.matchRate).is(0.5)
        assertThat(finalMismatched).is([
            "test: expected: {a: 2}"])
    })
})