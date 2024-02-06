import {assertThat} from "../assertThat"
import {BestMatcherAssignments} from "./BestMatcherAssignments"
import {ContextOfValidationError} from "../matcher/DiffMatcher"
import {match} from "../match"
import {matchMaker} from "../matchMaker/matchMaker"
import {MatchResult} from "../MatchResult"

describe("bestMatcherAssignments", () => {
    const context = new ContextOfValidationError("test")
    const determine = (actuals: any[], matchers: any[]) =>
        BestMatcherAssignments.determine(context, actuals, matchers.map(matchMaker))
    const mapMatchResultToMatchRate = (expectedRate: number) =>
        match.mapped((mr: MatchResult) => mr.matchRate,
            expectedRate, `MatchResult with a matchRate of ${expectedRate}`)

    it("[] matched by []", () => {
        assertThat(determine([], []))
            .is({
                assignments: [],
                unassignedActualElements: [],
                unassignedMatchers: []
            })
    })

    it("[1] matched by [1]", () => {
        assertThat(determine([1], [1]))
            .is({
                assignments: [{
                    actualElementIndex: 0, matcherIndex: 0,
                    matchResult: mapMatchResultToMatchRate(1),
                    mismatches: []
                }],
                unassignedActualElements: [],
                unassignedMatchers: []
            })
    })

    it("[] matched by [1, 2]", () => {
        assertThat(determine([], [1, 2]))
            .is({
                assignments: [],
                unassignedActualElements: [],
                unassignedMatchers: [0, 1]
            })
    })

    it("[1, 2] matched by []", () => {
        assertThat(determine([1, 2], []))
            .is({
                assignments: [],
                unassignedActualElements: [0, 1],
                unassignedMatchers: []
            })
    })

    it("[2] matched by [1]", () => {
        assertThat(determine([2], [1]))
            .is({
                assignments: [],
                unassignedActualElements: [0],
                unassignedMatchers: [0]
            })
    })

    it("[1, 2] matched by [3, 4]", () => {
        assertThat(determine([1, 2], [3, 4]))
            .is({
                assignments: [],
                unassignedActualElements: [0, 1],
                unassignedMatchers: [0, 1]
            })
    })

    it("[1, 2] matched by [0, 2]", () => {
        assertThat(determine([1, 2], [0, 2]))
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

    it("[1, 2] matched by [2, 1]", () => {
        assertThat(determine([1, 2], [2, 1]))
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

    it("[0, 1] matched by [0, *]", () => {
        assertThat(determine([0, 1], [0, match.any()]))
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

    it("[0, 1, 2] matched by [0, 4, *]", () => {
        assertThat(determine([0, 1, 2], [0, 4, match.any()]))
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 0,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    },
                    {
                        actualElementIndex: 1, matcherIndex: 2,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    }
                ],
                unassignedActualElements: [2],
                unassignedMatchers: [1]
            })
    })

    it("[0, 3, 4] matched by [*, 0, 2]", () => {
        assertThat(determine([0, 3, 4], [match.any(), 0, 2]))
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    },
                    {
                        actualElementIndex: 1, matcherIndex: 0,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    }
                ],
                unassignedActualElements: [2],
                unassignedMatchers: [2]
            })
    })

    it("[0, 1] matched by [3, *]", () => {
        assertThat(determine([0, 1], [3, match.any()]))
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    }
                ],
                unassignedActualElements: [1],
                unassignedMatchers: [0]
            })
    })

    it("[1] matched by [*, 1]", () => {
        const matcher = match.any()
        assertThat(determine([1], [matcher, 1]))
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: [matcher]
            })
    })

    it("[1] matched by [*, 1, *]", () => {
        const matcher = match.any()
        const matcher2 = match.any()
        assertThat(determine([1], [matcher, 1, matcher2]))
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(1.0),
                        mismatches: []
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: [matcher, matcher2]
            })
    })

    it("[{a: 1, b: 2}] matched by [{a: 1, b: 3}]", () => {
        assertThat(determine(
            [{a: 1, b: 2}], [{a: 1, b: 3}]))
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 0,
                        matchResult: mapMatchResultToMatchRate(4 / 6),
                        mismatches: ['test.b: 2, expected: 3']
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: []
            })
    })

    it("[{a: 1, b: 2}, {a: 2, b: 3}] matched by [{a: 1, b: 2}, *]", () => {
        assertThat(determine(
            [{a: 1, b: 2}, {a: 2, b: 3}],
            [{a: 1, b: 2}, match.any()]))
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

    it("[{a: 1, b: 2}, {a: 2, b: 3}] matched by [*, {a: 1, b: 2}]", () => {
        assertThat(determine(
            [{a: 1, b: 2}, {a: 2, b: 3}],
            [match.any(), {a: 1, b: 2}]))
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

    it("[{a: 1, b: 2}, {a: 2, b: 3}, 't'] matched by [*, *, {a: 1, b: 2}]", () => {
        assertThat(determine(
            [{a: 1, b: 2}, {a: 2, b: 3}, "t"],
            [match.any(), match.any(), {a: 1, b: 2}]))
            .is({
                assignments: [
                    {
                        actualElementIndex: 0, matcherIndex: 2,
                        matchResult: mapMatchResultToMatchRate(1.0), mismatches: []
                    },
                    {
                        actualElementIndex: 1, matcherIndex: 0,
                        matchResult: mapMatchResultToMatchRate(1.0), mismatches: []
                    },
                    {
                        actualElementIndex: 2, matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(1.0), mismatches: []
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: []
            })
    })

    it("[{a: 1, b: 2}, {a: 2, b: 3}] matched by [{a: 1, b: 22}, {a: 2, b: 3, c: 4, d: 5}]", () => {
        assertThat(determine(
            [{a: 1, b: 2}, {a: 2, b: 3}],
            [{a: 1, b: 22}, {a: 2, b: 3, c: 4, d: 5}]))
            .is({
                assignments: [
                    {
                        actualElementIndex: 1,
                        matcherIndex: 1,
                        matchResult: mapMatchResultToMatchRate(4 / 6),
                        mismatches: [
                            'test.c: undefined, expected: 4',
                            'test.d: undefined, expected: 5']
                    }
                ],
                unassignedActualElements: [],
                unassignedMatchers: [0]
            })
    })

    it("Low specificity matcher is matched first if it's the only complete match", () => {
        const result = determine(
            [{a: 1, b: 2}, {a: 222, b: 3}, {a: 3, b: 2}, "s"],
            [{a: 1, b: 2}, {a: 222, b: 3, c: 4, d: 5}, {a: 1, b: 2, c: 3}, "t"])
        assertThat(result).is({
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
                        'test.c: undefined, expected: 4',
                        'test.d: undefined, expected: 5']
                },
                {
                    actualElementIndex: 2,
                    matcherIndex: 2,
                    matchResult: mapMatchResultToMatchRate(2.5 / 4.5),
                    mismatches: [
                        'test.a: 3, expected: 1',
                        'test.c: undefined, expected: 3'
                    ]
                },
            ],
            unassignedActualElements: [3],
            unassignedMatchers: [3]
        })
    })

})