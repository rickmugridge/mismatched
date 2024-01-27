import {Mismatched} from "../matcher/Mismatched"
import {MatchResult} from "../MatchResult"
import {ContextOfValidationError} from "../matcher/DiffMatcher"
import {DiffFieldMatcher} from "../matcher/DiffFieldMatcher"

export const newArrayResultAccumulator = <T>(context: ContextOfValidationError,
                                             actual: T,
                                             mismatched: Mismatched[]) => {
    let diff: any = {}
    const unexpected: any = {}
    let compares = 1
    let matches = 1 // Count that we have 2 array as a match

    const wasExpected = (matchResult: MatchResult, field: DiffFieldMatcher<T>) => {
        compares += matchResult.compares
        matches += matchResult.matches
        if (matchResult.passed()) {
            diff[field.fieldName] = actual[field.fieldName]
        } else {
            diff[field.fieldName] = matchResult.diff
        }
    }

    const getDiff = () => diff
}