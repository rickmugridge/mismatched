import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";

export abstract class DiffMatcher<T> {
    complexity: number = 1

    static andComplexity<T>(matchers: Array<DiffMatcher<T>>) {
        return matchers.reduceRight(
            (previous, current) => previous + current.complexity, 0)
    }

    static orComplexity<T>(matchers: Array<DiffMatcher<T>>) {
        return matchers.reduceRight(
            (previous, current) => Math.max(previous, current.complexity), 0)
    }

    matches(actual: T): MatchResult {
        return this.mismatches(new ContextOfValidationError(), [], actual);
    }

    trialMatches(actual: T): MatchResult {
        return this.mismatches(new ContextOfValidationError().inTrial(), [], actual);
    }

    abstract mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult;

    abstract describe(): any;
}

export class ContextOfValidationError {
    trialMatch = false

    constructor(public context: string = "actual", public isUserDefined?: boolean) {
    }

    add(s: string): ContextOfValidationError {
        return this.isUserDefined ? this : new ContextOfValidationError(this.context + s).inTrial(this.trialMatch)
    }

    outerContext() {
        return this.isUserDefined ? this.context : ''
    }

    inTrial(trialMatch: boolean = true): this {
        this.trialMatch = trialMatch
        return this
    }

    describe(actual: any, contextDescription: (outerContext: string, actual: any) => string) {
        const outerContext = this.isUserDefined ? this.context : ''
        return new ContextOfValidationError(contextDescription(outerContext, actual), true)
    }
}