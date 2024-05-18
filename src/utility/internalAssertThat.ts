// This is intended for internal testing in mismatched, not for users of mismatched.
// Users of mismatched should use assertThat().

import {assertThat} from "../assertThat"
import {handleSymbol, MatchResult} from "../MatchResult"
import {matchMaker} from "../matchMaker/matchMaker"
import {ContextOfValidationError} from "../matcher/DiffMatcher"

export function internalAssertThat<T>(actual: T) {
    return new InternalAssertion<T>(actual);
}

class InternalAssertion<T> {
    constructor(private actual: any) {
    }

    is(matcher: T) {
        const mismatched: string[] = []
        const result = matchMaker(matcher).mismatches(new ContextOfValidationError(), mismatched, this.actual)
        assertThat(result.passed()).is(true)
        assertThat(mismatched).is([])
    }

    failsWith(matcher: T): InternalFailure<T> {
        return new InternalFailure<T>(this.actual, matchMaker(matcher))
    }
}

class InternalFailure<T> {
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