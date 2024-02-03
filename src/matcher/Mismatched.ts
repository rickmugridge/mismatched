import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {handleSymbol, MatchResult} from "../MatchResult";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"

export class Mismatched {
    static makeExpectedMessage(context: ContextOfValidationError, actual: any, expected: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual;
        (mismatch as any).expected = expected;
        return mismatch;
    }

    static wasExpected(context: ContextOfValidationError, actual: any, matcher: DiffMatcher<any>) {
        return `${context.outerContext()}, was: ${actual}, expected ${matcher.describe()}`
    }

    static makeMissing(context: ContextOfValidationError, actual: any, expected: any) {
        const mismatch = new Mismatched();
        (mismatch as any)[context.context] = actual;
        (mismatch as any).missing = expected;
        return mismatch;
    }

    static extraMatcher(context: ContextOfValidationError, matcher: DiffMatcher<any>) {
        return `${context.outerContext()}: expected: ${render(matcher.describe())}`
    }

    static extraActual(context: ContextOfValidationError, actual: any) {
        return `${context.outerContext()}: unexpected: ${render(actual)}`
    }

    static outOfOrder(context: ContextOfValidationError, actual: any) {
        return `${context.outerContext()}: out of order: ${render(actual)}`
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

const render = (actual:any) => PrettyPrinter.make().render(actual)
