// import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
// import {MatchResult} from "../MatchResult";
// import {PrettyPrinter} from "../prettyPrint/PrettyPrinter"
// import {matchMaker} from "../matchMaker/matchMaker"
//
// export class SelectivelyAssertMatcher<T> extends DiffMatcher<T> {
//     reported = false
//     private constructor(private matcher: DiffMatcher<T>) {
//         super()
//         this.specificity = matcher.specificity
//     }
//
//     static make<T>(matcher: T): any {
//         return new SelectivelyAssertMatcher(matchMaker(matcher));
//     }
//
//     mismatches(context: ContextOfValidationError, mismatched: Array<string>, actual: T): MatchResult {
//         const matchResult = this.matcher.mismatches(context, mismatched, actual);
//         if (!this.reported && !matchResult.passed()) {
//             PrettyPrinter.make().logToConsole(
//                 {
//                     "Selective assertion ": context.context,
//                     actual,
//                     diff: matchResult.diff
//                 })
//             console.log('---------\n')
//             this.reported = true
//         }
//         return matchResult
//     }
//
//     describe(): any {
//         return this.matcher.describe()
//     }
// }

// The problem with this approach is that the matcher may be called an indeterminate number of times
// when diff-ing over arrays and sets. So there is no way of knowing which match is the "right" one.
// It can be made worse by diffing over nested arrays, adding extra visits.