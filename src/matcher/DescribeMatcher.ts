import {DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "..";

export class DescribeMatcher<T> extends DiffMatcher<T> {
    private constructor(private description: (a: any) => any, private matcher: DiffMatcher<T>) {
        super();
    }

    static make<T>(description: (a: any) => any, matcher: DiffMatcher<T>|any): any {
        return new DescribeMatcher(description, matchMaker(matcher))
    }

    mismatches(context: string, mismatched: Array<Mismatched>, actual: T): MatchResult {
        const matchResult = this.matcher.mismatches(context, [], actual);
        if (matchResult.passed()) {
            return MatchResult.good(matchResult.compares);
        }
        const describe = this.description(actual);
        mismatched.push(describe);
        return MatchResult.wasExpected(actual, describe, matchResult.compares, matchResult.matches);
    }

    describe(): any {
        return "describe";
    }
}