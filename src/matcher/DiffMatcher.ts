import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";

export abstract class DiffMatcher<T> {
    matches(actual: T): MatchResult {
        return this.mismatches(new ContextOfValidationError(), [], actual);
    }

    abstract mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult;

    abstract describe(): any;
}

export class ContextOfValidationError {
    constructor(public context: string = "actual", public isUserDefined?: boolean) {
    }

    add(s: string): ContextOfValidationError {
        return this.isUserDefined ? this : new ContextOfValidationError(this.context + s)
    }

    outerContext() {
       return this.isUserDefined ? this.context : ''
    }

    describe(actual: any, contextDescription: (outerContext: string, actual: any) => string) {
        const outerContext = this.isUserDefined ? this.context : ''
        return new ContextOfValidationError(contextDescription(outerContext, actual), true)
    }
}