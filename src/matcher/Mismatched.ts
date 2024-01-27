import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {handleSymbol, MatchResult} from "../MatchResult";

export class Mismatched {
    static makeExpectedMessage(context: ContextOfValidationError, actual: any, expected: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual;
        (mismatch as any).expected = expected;
        return mismatch;
    }

    static wasExpected(context: ContextOfValidationError, actual: any, matcher: DiffMatcher<any>) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual
        (mismatch as any).wasExpected = matcher.describe()
        return mismatch
    }

    static makeMissing(context: ContextOfValidationError, actual: any, expected: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual;
        (mismatch as any).missing = expected;
        return mismatch;
    }

    static extraMatcher(context: ContextOfValidationError, matcher: DiffMatcher<any>) {
        const mismatch = new Mismatched();
        (mismatch as any)[`${context.context}: Missing`] = matcher.describe()
        return mismatch
    }

    static extraActual(context: ContextOfValidationError, actual: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[`${context.context}: Extra`] = actual
        return mismatch
    }

    static outOfOrder(context: ContextOfValidationError, actual: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[`${context.context}: Out of order`] = actual
        return mismatch
    }

    static makeUnexpectedMessage(context: ContextOfValidationError, actual: any, unexpected: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual;
        (mismatch as any).unexpected = unexpected;
        return mismatch;
    }
}

// Used for testing the result when matching fails
export const wasExpected = (was: any, expected: any) =>
    ({
        [MatchResult.was]: handleSymbol(was),
        [MatchResult.expected]: handleSymbol(expected)
    })

export const unexpected = (expected: any) =>
    ({
        [MatchResult.unexpected]: handleSymbol(expected)
    })

