import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker";
import {Mismatched} from "./Mismatched";

export class MappedMatcher<T, U> extends DiffMatcher<T> {
    private constructor(private map: (t: T) => U,
                        private matcher: DiffMatcher<U> | any,
                        private description: any) {
        super();
    }

    static make<T, U>(map: (t: T) => U, matcher: DiffMatcher<U> | any, description: any): any {
        return new MappedMatcher(map, matchMaker(matcher), description);
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        try {
            const mappedActual = this.map(actual);
            const matchResult = this.matcher.mismatches(context, mismatched, mappedActual);
            if (matchResult.passed()) {
                return MatchResult.good(1);
            }
            return MatchResult.wasExpected(mappedActual, this.describe(), 1, 0);
        } catch (e) {
            return MatchResult.wasExpected(`mapping failed: ${e.message}`, this.describe(), 1, 0);
        }
    }

    describe(): any {
        return {mapped: {description: this.description, matcher: this.matcher.describe()}};
    }
}