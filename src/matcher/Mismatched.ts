import {ContextOfValidationError} from "./DiffMatcher";

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
}
