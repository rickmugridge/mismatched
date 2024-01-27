import {assertThat} from "../assertThat"
import {DeltaMapping, mapDeltas} from "./mapDeltas"
import * as diff from "fast-array-diff"
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"

const compare = (v1: number, v2: number): boolean => v1 === v2

const run = (actualElements: number[], matchers: number[], stringExpected: string[]) => {
    const deltas = diff.getPatch(actualElements, matchers, compare)
    let results: DeltaMapping[] = mapDeltas(deltas, actualElements.length)
    PrettyPrinter.logToConsole({deltas, results, at: "mapDeltas.test.ts:9"}) // todo RM Remove
    const expected = stringExpected.map(s =>
        s.startsWith("+") ? {plus: Number.parseInt(s.substring(1))} : {minus: Number.parseInt(s.substring(1))}
    )
    assertThat(results).is(expected)
}

describe("mapDeltas", () => {
    it("[] and []", () => {
        run([], [], [])
    })

    it("[0] and []", () => {
        run([0], [], ["-0"])
    })

    it("[] and [1]", () => {
        run([], [1], [])
    })

    it("[0] and [1]", () => {
        run([0], [1], ["-0"])
    })

    it("[0] and [0, 1]", () => {
        run([0], [0, 1], ["+0"])
    })

    it("[0, 1] and [0]", () => {
        run([0, 1], [0], ["+0", "-1"])
    })

    it("Lots of differences #1", () => {
        run([0, 1, 2, 4], [0, 3, 5], ["+0", "-1", "-2", "-3"])
    })

    it("Lots of differences #2", () => {
        run([0, 1, 2, 4], [0, 3, 4], ["+0", "-1", "-2", "+3"])
    })

    it("Lots of differences #3", () => {
        run([0, 1, 2, 4], [0, 1, 3, 4, 5], ["+0", "+1", "-2", "+3"])
    })

    it("Lots of differences #4", () => {
        run([0, 1, 2, 4], [1, 3, 5], ["-0", "+1", "-2", "-3"])
    })

    it("Lots of differences #5", () => {
        run([0, 1, 2], [3, 4, 5], ["-0", "-1", "-2"])
    })

    it("Lots of differences #5", () => {
        run([0, 2, 4], [0, 1, 2, 3, 4, 5], ["+0", "+1", "+2"])
    })

    it("Lots of differences #5", () => {
        run([0, 2, 4], [-1, 0, 1, 2, 3, 4, 5], ["+0", "+1", "+2"])
    })
})