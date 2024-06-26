// This is intended for internal testing in mismatched, not for users of mismatched.
// Users of mismatched should use assertThat().

import {assertThat, ensureNotFunction} from "../assertThat"
import {handleSymbol, MatchResult} from "../MatchResult"
import {matchMaker} from "../matchMaker/matchMaker"
import {ContextOfValidationError} from "../matcher/DiffMatcher"
import {match} from "../match"
import {ofType} from "../ofType"

export function internalAssertThat<T>(actual: T, allowMatcherAsArgument = false) {
    if (!allowMatcherAsArgument && ofType.isMatcher(actual)) {
        throw new Error("Cannot apply assertThat() to a matcher as the actual value")
    }
    return new InternalAssertion(actual);
}

class InternalAssertion {
    constructor(private actual: any) {
    }

    is(matcher: any) {
        this.checkForFunction();
        const mismatched: string[] = []
        const result = matchMaker(matcher).mismatches(new ContextOfValidationError(), mismatched, this.actual)
        assertThat(result.passed()).is(true)
        assertThat(mismatched).is([])
    }

    isNot<T = any>(expected: T) {
        this.checkForFunction();
        return this.is(match.not(matchMaker(expected)));
    }

    failsWith(matcher: any): InternalFailure {
        return new InternalFailure(this.actual, matchMaker(matcher))
    }

    private checkForFunction() {
        ensureNotFunction(this.actual);
    }
}

class InternalFailure {
    constructor(private actual: any, private matcher: any) {
    }

    wasExpected(was: any, expected: any, expectedErrors: string[]) {
        this.wasDiff({
            [MatchResult.was]: handleSymbol(was),
            [MatchResult.expected]: handleSymbol(expected)
        }, expectedErrors)
    }

    unexpected(unexpected: any, expectedErrors: string[]) {
        this.wasDiff({[MatchResult.unexpected]: handleSymbol(unexpected)}, expectedErrors)
    }

    wasDiff(expectedDiff: any, expectedErrors: string[]) {
        const mismatched: string[] = []
        const result = this.matcher.mismatches(new ContextOfValidationError(), mismatched, this.actual)
        assertThat(result.passed()).is(false)
        assertThat(result.diff).is(expectedDiff)
        assertThat(mismatched).is(expectedErrors)
    }
}