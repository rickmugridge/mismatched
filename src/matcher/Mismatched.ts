import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {handleSymbol, MatchResult} from "../MatchResult";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"

export module Mismatched {
    export const makeExpectedMessage = (context: ContextOfValidationError, actual: any, expected: any): string =>
        `${context.outerContext()}: ${PrettyPrinter.make().render(actual)}, expected: ${PrettyPrinter.make().render(expected)}`

    export const wasExpected = (context: ContextOfValidationError, actual: any, matcher: DiffMatcher<any>) =>
        `${context.outerContext()}: ${PrettyPrinter.make().render(actual)}, expected: ${PrettyPrinter.make().render(matcher.describe())}`

    export const wasWrong = (context: ContextOfValidationError, actual: any) =>
        `${context.outerContext()}: ${PrettyPrinter.make().render(actual)}`

    export const makeMissing = (context: ContextOfValidationError, actual: any, expected: any): string =>
        `${context.outerContext()}: ${PrettyPrinter.make().render(actual)}, missing: ${PrettyPrinter.make().render(expected)}`

    export const extraMatcher = (context: ContextOfValidationError, matcher: DiffMatcher<any>) =>
        `${context.outerContext()}: expected: ${PrettyPrinter.make().render(matcher.describe())}`

    export const extraActual = (context: ContextOfValidationError, actual: any) =>
        `${context.outerContext()}: unexpected: ${PrettyPrinter.make().render(actual)}`

    export const outOfOrder = (context: ContextOfValidationError, actual: any) =>
        `${context.outerContext()}: out of order: ${PrettyPrinter.make().render(actual)}`

    export const wasUnexpected = (context: ContextOfValidationError, actual: any, unexpected: any) =>
        `${context.outerContext()}: ${PrettyPrinter.make().render(actual)}, unexpected: ${PrettyPrinter.make().render(unexpected)}`
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
