import {ContextOfValidationError} from "./DiffMatcher";
import {handleSymbol, MatchResult} from "../MatchResult";

export class Mismatched {
    static makeExpectedMessage(context: ContextOfValidationError, actual: any, expected: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual;
        (mismatch as any).expected = expected;
        return mismatch;
    }

    static makeMissing(context: ContextOfValidationError, actual: any, expected: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual;
        (mismatch as any).missing = expected;
        return mismatch;
    }

    static makeUnexpectedMessage(context: ContextOfValidationError, actual: any, unexpected: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual;
        (mismatch as any).unexpected = unexpected;
        return mismatch;
    }

    // Used for testing the result when matching fails
    static failingWasExpected(was: any, expected: any) {
        return {
            [MatchResult.was]: handleSymbol(was),
            [MatchResult.expected]: handleSymbol(expected)
        }
    }
}
