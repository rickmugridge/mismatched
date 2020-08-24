import {ContextOfValidationError} from "./DiffMatcher";

export class Mismatched {
    static make(context: ContextOfValidationError, actual: any, expected: any, unexpected?: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual;
        if (unexpected) {
            (mismatch as any).unexpected = unexpected;
        } else {
            (mismatch as any).expected = expected;
        }
        return mismatch;
    }
}