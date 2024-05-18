import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker";

export class MappedMatcher<T, U> extends DiffMatcher<T> {
    private constructor(private map: (t: T) => U,
                        private matcher: DiffMatcher<U> | any,
                        private description: any) {
        super();
    }

    static make<T, U>(map: (t: T) => U, matcher: DiffMatcher<U> | any, description: any): any {
        return new MappedMatcher(map, matchMaker(matcher), description);
    }

    mismatches(context: ContextOfValidationError, mismatched: string[], actual: T): MatchResult {
        const newContext = context.mapped()
        try {
            const mappedActual = this.map(actual);
            return this.matcher.mismatches(newContext, mismatched, mappedActual)
        } catch (e) {
            mismatched.push(`${newContext.outerContext()}: mapping failed: "${e.message}"`)
            return MatchResult.wasExpected(`mapping failed: "${e.message}"`, this.describe(), 1, 0);
        }
    }

    describe(): any {
        return {mapped: {description: this.description, matcher: this.matcher.describe()}};
    }
}