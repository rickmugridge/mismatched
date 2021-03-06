import {ofType} from "./ofType";
import {PrettyPrinter} from "./prettyPrint/PrettyPrinter";
import {Colour} from "./Colour";

export class MatchResult {
    static was = Colour.bg_cyan("     was");
    static expected = Colour.bg_cyan("expected");
    static missing = Colour.bg_cyan("missing");
    static unexpected = Colour.bg_cyan("unexpected");
    static differ = Colour.bg_cyan("  differ");
    public matchRate: number;

    constructor(public diff: any, public compares: number, public matches: number, public matchedObjectKey = false) {
        this.matchRate = compares === 0 ? 1.0 : matches / compares;
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
        throw new Error(message + ":\n" + diff);
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
                this.diff[MatchResult.unexpected] = items;
            }
        }
        return this
    }

    missing(items: any): this {
        if (items.length > 0) {
            if (items.length === 1) {
                this.diff[MatchResult.missing] = items[0]
            } else {
                this.diff[MatchResult.missing] = items;
            }
        }
        return this
    }
}

export function handleSymbol(v: any): any {
    if (ofType.isSymbol(v)) {
        return v.toString();
    }
    return v;
}