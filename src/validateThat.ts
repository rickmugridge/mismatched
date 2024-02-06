import {ContextOfValidationError, DiffMatcher} from "./matcher/DiffMatcher";
import {matchMaker} from "./matchMaker/matchMaker";
import {ensureNotFunction} from "./assertThat";

export function validateThat<T>(actual: any) {
    return new Validator(actual)
}

class Validator<T> {
    constructor(private actual: any) {
    }

    satisfies(expected: DiffMatcher<T> | any): ValidationResult {
        ensureNotFunction(this.actual);
        const matcher = matchMaker(expected);
        const mismatched: string[] = [];
        matcher.mismatches(new ContextOfValidationError(), mismatched, this.actual);
        return new ValidationResult(mismatched)
    }

    is(expected: DiffMatcher<T> | any): ValidationResult {
        return this.satisfies(expected);
    }
}

export class ValidationResult {
    constructor(public errors: Array<string>) {
    }

    passed = () => this.errors.length === 0
}
