import {DeltaMapping} from "./mapDeltas"
import {ArrayDiff} from "./arrayDiff"
import {ContextOfValidationError} from "../matcher/DiffMatcher"
import {matchMaker} from "../matchMaker/matchMaker"
import {assertThat} from "../assertThat"
import {match} from "../match"

const check = (actualElements: any[], matchers: any[], expected: DeltaMapping[]) => {
    const result = ArrayDiff.determineMatchResultOrDeltaMappings(
        new ContextOfValidationError("test"), actualElements, matchers.map(matchMaker))
    assertThat(result[0]).is(expected)
}

describe("mapDeltas", () => {
    it("[] and []", () => {
        check([], [], [])
    })

    it("[0] and []", () => {
        check([0], [], [{actualRemoved: 0}])
    })

    it("[] and [1]", () => {
        check([], [1], [])
    })

    it("[0] and [1]", () => {
        check([0], [1], [{actualRemoved: 0}])
    })

    it("[1] and [1]", () => {
        check([1], [1], [{matched: 0}])
    })

    it("[0] and [0, 1]", () => {
        check([0], [0, 1], [{matched: 0}])
    })

    it("[0, 1] and [0]", () => {
        check([0, 1], [0],
            [{matched: 0}, {actualRemoved: 1}])
    })

    it("[0, 1] and [*]", () => {
        check([0, 1], [match.any()],
            [{matched: 0}, {actualRemoved: 1}])
    })

    it("[0, 1] and [0, *]", () => {
        check([0, 1], [0, match.any()],
            [{matched: 0}, {matched: 1}])
    })

    it("[0] and [0, *]", () => {
        check([0], [0, match.any()],
            [{matched: 0}])
    })

    it("[0, 1, 2] and [0, 4, 1]", () => {
        check([0, 1, 2], [0, 4, 1],
            [{matched: 0}, {matched: 1}, {actualRemoved: 2}])
    })

    it("[0, 3, 4] and [*, 0, 2]", () => {
        check([0, 3, 4], [match.any(), 0, 2],
            [{matched: 0}, {actualRemoved: 1}, {actualRemoved: 2}])
    })

    it("[0, 1, 2] and [0, 4, *]", () => {
        check([0, 1, 2], [0, 4, match.any()],
            [{matched: 0}, {actualRemoved: 1}, {matched: 2}])
    })

    it("[0, 1] and [3, *]", () => {
        check([0, 1], [3, match.any()],
            [{actualRemoved: 0}, {matched: 1}])
    })

    it("[1, undefined] and [2, undefined]", () => {
        check([1, undefined], [2, undefined], [{actualRemoved: 0}, {matched: 1}])
    })

    it("Lots of differences #1", () => {
        check([0, 1, 2, 4], [0, 3, 5],
            [{matched: 0}, {actualRemoved: 1}, {actualRemoved: 2}, {actualRemoved: 3}])
    })

    it("Lots of differences #2", () => {
        check([0, 1, 2, 4], [0, 3, 4],
            [{matched: 0}, {actualRemoved: 1}, {actualRemoved: 2}, {matched: 3}])
    })

    it("Lots of differences #3", () => {
        check([0, 1, 2, 4], [0, 1, 3, 4, 5],
            [{matched: 0}, {matched: 1}, {actualRemoved: 2}, {matched: 3}])
    })

    it("Lots of differences #4", () => {
        check([0, 1, 2, 4], [1, 3, 5],
            [{actualRemoved: 0}, {matched: 1}, {actualRemoved: 2}, {actualRemoved: 3}])
    })

    it("Lots of differences #5", () => {
        check([0, 1, 2], [3, 4, 5],
            [{actualRemoved: 0}, {actualRemoved: 1}, {actualRemoved: 2}])
    })

    it("Lots of differences #6", () => {
        check([0, 2, 4], [0, 1, 2, 3, 4, 5],
            [{matched: 0}, {matched: 1}, {matched: 2}])
    })

    it("Lots of differences #7", () => {
        check([0, 2, 4], [-1, 0, 1, 2, 3, 4, 5],
            [{matched: 0}, {matched: 1}, {matched: 2}])
    })
})