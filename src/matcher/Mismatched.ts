import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {handleSymbol, MatchResult} from "../MatchResult";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"

export module Mismatched {
    const pp = PrettyPrinter.make()

    export const makeExpectedMessage = (context: ContextOfValidationError, actual: any, expected: any): string =>
        `${context.outerContext()}: ${pp.render(actual)}, expected: ${pp.render(expected)}`

    export const wasExpected = (context: ContextOfValidationError, actual: any, matcher: DiffMatcher<any>) =>
        `${context.outerContext()}: ${pp.render(actual)}, expected: ${pp.render(matcher.describe())}`

    export const makeMissing = (context: ContextOfValidationError, actual: any, expected: any): string =>
        `${context.outerContext()}: ${pp.render(actual)}, missing: ${pp.render(expected)}`

    export const extraMatcher = (context: ContextOfValidationError, matcher: DiffMatcher<any>) =>
        `${context.outerContext()}: expected: ${pp.render(matcher.describe())}`

    export const extraActual = (context: ContextOfValidationError, actual: any) =>
        `${context.outerContext()}: unexpected: ${pp.render(actual)}`

    export const outOfOrder = (context: ContextOfValidationError, actual: any) =>
        `${context.outerContext()}: out of order: ${pp.render(actual)}`

    export const wasUnexpected = (context: ContextOfValidationError, actual: any, unexpected: any) =>
        `${context.outerContext()}: ${pp.render(actual)}, unexpected: ${pp.render(unexpected)}`
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
