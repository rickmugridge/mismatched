export class Mismatch {
    static make(context: string, actual: any, expected: any, unexpected?: any) {
        const mismatch = new Mismatch();
        (mismatch as any)[context] = actual;
        if (unexpected) {
            (mismatch as any).unexpected = unexpected;
        } else {
            (mismatch as any).expected = expected;
        }
        return mismatch;
    }
}