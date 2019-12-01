import {DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "./matchMaker";
import {Mismatch} from "./Mismatch";

export class MappedMatcher<T> extends DiffMatcher<T> {
    private constructor(private map: (t: any) => T,
                private matcher: DiffMatcher<T> | any,
                private description: any) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatch>, actual: T): MatchResult {
        const matchResult = this.matcher.mismatches(context, mismatched, this.map(actual));
        if (matchResult.passed()) {
            return MatchResult.good(1);
        }
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return {mapped: {description: this.description, matcher: this.matcher.describe()}};
    }

    static make<T>(map: (t: any) => T, matcher: DiffMatcher<T> | any, description: any): any {
        return new MappedMatcher(map, matchMaker(matcher), description);
    }
}