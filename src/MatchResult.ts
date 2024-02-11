import {ofType} from "./ofType";
import {PrettyPrinter} from "./prettyPrint/PrettyPrinter";
import {Colour} from "./utility/Colour";
import {DiffMatcher} from "./matcher/DiffMatcher"
import {assertThat} from "./assertThat"
import {validateThat} from "./validateThat"
import {matchMaker} from "./matchMaker/matchMaker"


export class MatchResult {
    static consoleLogging = false
    static was = Colour.bg_cyan("     was");
    static expected = Colour.bg_cyan("expected");
    static unexpected = Colour.bg_cyan("unexpected");
    static wrongOrder = Colour.bg_cyan("out of order");
    static differ = Colour.bg_cyan("  differ");
    public matchRate: number;

    constructor(public diff: any, public compares: number, public matches: number, public matchedObjectKey = false) {
        this.matchRate = compares === 0 ? 0.0 : matches / compares;
    }

    static useConsoleLogging() {
        MatchResult.consoleLogging = true
    }

    static extraMatcher(matcher: DiffMatcher<any>): any {
        return {[MatchResult.expected]: matcher.describe()}
    }

    static extraActual(actual: any): any {
        return {[MatchResult.unexpected]: actual}
    }

   static outOfOrder(actual: any): any {
        return {[MatchResult.wrongOrder]: actual}
    }

   static outOfOrderWithPartialMatch(matchResult: MatchResult): any {
        return {[MatchResult.wrongOrder]: matchResult}
    }

    static wasExpected(was: any, expected: any, compares: any, matches: any): MatchResult {
        return new MatchResult({
                [MatchResult.was]: handleSymbol(was),
                [MatchResult.expected]: handleSymbol(expected)
            },
            compares, matches);
    }

    static describe(description: any) {
        return handleSymbol(description);
    }

    static good(compares: number, matchedObjectKey = false) {
        return new MatchResult({}, compares, compares, matchedObjectKey);
    }

    passed() {
        return this.matchRate >= 1.0;
    }

    bad(actual: any, message = "Mismatched") {
        const diff = PrettyPrinter.make().render({actual, diff: this.diff});
        if (MatchResult.consoleLogging) {
            console.log(diff)
            throw new Error(message)
        } else {
            throw new Error(message + ":\n" + diff);
        }
    }

    differ(items: any): this {
        if (items.length > 0) {
            if (items.length === 1) {
                this.diff[MatchResult.differ] = items[0]
            } else {
                this.diff[MatchResult.differ] = items;
            }
        }
        return this
    }

    unexpected(items: any[]): this {
        if (items.length > 0) {
            if (items.length === 1) {
                this.diff[MatchResult.unexpected] = items[0]
            } else {
                this.diff[MatchResult.unexpected] = items
            }
        }
        return this
    }
}

export function handleSymbol(v: any): any {
    if (ofType.isSymbol(v)) {
        return v.toString()
    }
    return v
}

// Has to be at least one element in MatchResult[]
export const bestMatchResultIndex = (results: MatchResult[]): number => {
    if (results.length === 0) {
        throw new Error("Cannot get bestMatchResult() from empty array")
    }
    let best: MatchResult = results[0]
    let bestIndex = 0
    results.forEach((result, index) => {
        if (result.matchRate > best.matchRate) {
            best = result
            bestIndex = index
        }
    })
    return bestIndex
}

export const failsWith = (actual: any, expected: any, failsWith: any, errors: string[]) => {
    assertThat(actual).failsWith(expected, failsWith)
    assertThat(validateThat(actual).is(expected).errors).is(errors)
}

export const matchingSame = (actual: any) => {
    assertThat(actual).is(matchMaker(actual))
    assertThat(validateThat(actual).is(matchMaker(actual)).errors).is([])
}

export const passesCompletely =  (actual: any, expected: any) => {
    assertThat(actual).is(expected)
    assertThat(validateThat(actual).is(expected).errors).is([])
}
