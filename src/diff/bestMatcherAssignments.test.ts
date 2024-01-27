import {assertThat} from "../assertThat"
import {Assignations, bestMatcherAssignments} from "./bestMatcherAssignments"
import {ContextOfValidationError} from "../matcher/DiffMatcher"
import {match} from "../match"
import {matchMaker} from "../matchMaker/matchMaker"
import {MatchResult} from "../MatchResult"

describe("bestMatcherAssignments", () => {
    const context = new ContextOfValidationError("test")
    const mapMatchResultToMatchRate = (expectedRate: number) =>
        match.mapped((mr: MatchResult) => mr.matchRate,
            expectedRate, `MatchResult with a matchRate of ${expectedRate}`)

    it("Has none of each", () => {
        assertThat(bestMatcherAssignments.determine(context, [], []))
            .is({
                assignments: [],
                unassignedActualElements: [],
                unassignedMatchers: []
            })
    })

    it("2 matchers but no actual elements", () => {
        const matcher1 = match.ofType.string()
        const matcher2 = match.any()
        let unorderedMatchers = [matcher1, matcher2]
        assertThat(bestMatcherAssignments.determine(context, unorderedMatchers, []))
            .is({
                assignments: [],
                unassignedActualElements: [],
                unassignedMatchers: [0, 1]
            })
    })

    it("2 matchers and 2 actual elements, but none matching", () => {
        const matcher1 = match.ofType.string()
        const matcher2 = match.ofType.date()
        let unorderedMatchers = [matcher1, matcher2]
        let actualElements: any[] = [1, 2]
        assertThat(bestMatcherAssignments.determine(context, unorderedMatchers, actualElements))
            .is({
                assignments: [],
                unassignedActualElements: [0, 1],
                unassignedMatchers: [0, 1]
            })
    })

    it("2 matchers and 2 actual elements, one matching", () => {
        const matcher0 = match.ofType.string()
        const matcher1 = matchMaker(2)
        let unorderedMatchers = [matcher0, matcher1]
        let actualElements: any[] = [1, 2]
        let result: Assignations<any> = bestMatcherAssignments.determine(
            context, unorderedMatchers, actualElements)

        assertThat(result)
            .is({
                assignments: [{
                    actualElementIndex: 1, matcherIndex: 1,
                    matchResult: mapMatchResultToMatchRate(1.0),
                    mismatches: []
                }],
                unassignedActualElements: [0],
                unassignedMatchers: [0]
            })
    })

    it("2 matchers and 2 actual elements, and both matching", () => {
        const matcher1 = matchMaker(2)
        const matcher2 = matchMaker(1)
        let unorderedMatchers = [matcher1, matcher2]
        let actualElements: any[] = [1, 2]
        let result: Assignations<any> = bestMatcherAssignments.determine(
            context, unorderedMatchers, actualElements)

        assertThat(result)
            .is({
                assignments: [
                    {
                        actualElementIndex: 1, matcherIndex: 0,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    },
                    {
                        actualElementIndex: 0, matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: []
            })
    })

    it("1 matchers and 1 actual elements, which partially match", () => {
        const matcher1 = matchMaker({a: 1, b: 3})
        let unorderedMatchers = [matcher1]
        let actualElements: any[] = [{a: 1, b: 2}]
        let result: Assignations<any> = bestMatcherAssignments.determine(
            context, unorderedMatchers, actualElements)

        assertThat(result)
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 0,
                        matchResult: mapMatchResultToMatchRate(0.6666666666666666),
                        mismatches: [{"test.b": 2, expected: 3}]
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: []
            })
    })

    it("All assigned, fully matching, matchers in specificity order", () => {
        let actual0 = {a: 1, b: 2} // should match with matcher1
        let actual1 = {a: 2, b: 3}
        const matcher0 = matchMaker(actual0)
        const matcher1 = match.any()
        let result: Assignations<any> = bestMatcherAssignments.determine(
            context, [matcher0, matcher1], [actual0, actual1])

        assertThat(result)
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 0,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    },
                    {
                        actualElementIndex: 1, matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: []
            })
    })

    it("All assigned, fully matching, matchers out of specificity order", () => {
        let actual0 = {a: 1, b: 2} // should match with matcher1
        let actual1 = {a: 2, b: 3}
        const matcher0 = match.any()
        const matcher1 = matchMaker(actual0)
        let result: Assignations<any> = bestMatcherAssignments.determine(
            context, [matcher0, matcher1], [actual0, actual1])

        assertThat(result)
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(1.0), mismatches: []
                    },
                    {
                        actualElementIndex: 1, matcherIndex: 0,
                        matchResult: mapMatchResultToMatchRate(1.0), mismatches: []
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: []
            })
    })

    it("One assigned, partially matching", () => {
        let actual0 = {a: 1, b: 2}
        let actual1 = {a: 2, b: 3}
        const matcher0 = matchMaker({a: 1, b: 22})
        const matcher1 = matchMaker({...actual1, c: 4, d: 5})
        let result: Assignations<any> = bestMatcherAssignments.determine(
            context, [matcher0, matcher1], [actual0, actual1])
        assertThat(result)
            .is({
                assignments: [
                    {
                        actualElementIndex: 1,
                        matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(4 / 6),
                        mismatches: [
                            {"test.c": undefined, expected: 4},
                            {"test.d": undefined, expected: 5}]
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: [0]
            })
    })

    it("Low specificity matcher is matched first if it's the only complete match", () => {
        let actual0 = {a: 1, b: 2}
        let actual1 = {a: 222, b: 3}
        let actual2 = {a: 3, b: 2}
        let actual3 = "s"
        const matcher0 = matchMaker({a: 1, b: 2}) // Full match, so matches [0]
        const matcher1 = matchMaker({...actual1, c: 4, d: 5}) // Most specific, so assigned first to [1]
        const matcher2 = matchMaker({...actual0, c: 3}) // Next specific, so assigned to [2]
        const matcher3 = matchMaker("t") // Doesn't match at all
        let result: Assignations<any> = bestMatcherAssignments.determine(
            context, [matcher0, matcher1, matcher2, matcher3], [actual0, actual1, actual2, actual3])

        assertThat(result)
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 0,
                        matchResult: mapMatchResultToMatchRate(1.0), mismatches: []
                    },
                    {
                        actualElementIndex: 1,
                        matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(4 / 6),
                        mismatches: [
                            {"test.c": undefined, expected: 4},
                            {"test.d": undefined, expected: 5}]
                    },
                    {
                        actualElementIndex: 2,
                        matcherIndex: 2,
                        matchResult: mapMatchResultToMatchRate(2.5 / 4.5),
                        mismatches: [
                            {"test.a": 3, expected: 1},
                            {"test.c": undefined, expected: 3}
                        ]
                    },
                ],
                unassignedActualElements: [3],
                unassignedMatchers: [3]
            })
    })

})