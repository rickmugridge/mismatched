import {ofType} from "./ofType";
import {PrettyPrinter} from "./prettyPrint/PrettyPrinter";
import {Colour} from "./Colour";

export class MatchResult {
    public matchRate: number;

    constructor(public diff: object, public compares: number, public matches: number) {
        this.matchRate = compares === 0 ? 1.0 : matches / compares;
    }

    passed() {
        return this.matchRate >= 1.0;
    }

    bad(actual: any, message = "Mismatched") {
        const diff = PrettyPrinter.make().render({actual, diff: this.diff});
        throw new Error(message+":\n"+diff);
    }

    static wasExpected(was: any, expected: any, compares: any, matches: any) {
        return new MatchResult({
                [MatchResult.was]: handleSymbol(was),
                [MatchResult.expected]: handleSymbol(expected)
            },
            compares, matches);
    }

    static describe(description: any) {
        return handleSymbol(description);
    }

    static good(compares: number) {
        return new MatchResult({}, compares, compares);
    }

    static was = Colour.bg_cyan("was     ");
    static expected = Colour.bg_cyan("expected");
    static unexpected = Colour.bg_cyan("unexpected");
}

export function handleSymbol(v: any): any {
    if (ofType.isSymbol(v)) {
        return v.toString();
    }
    return v;
}