import {DiffMatcher, ContextOfValidationError} from "./matcher/DiffMatcher";
import {matchMaker} from "./matchMaker/matchMaker";
import {Mismatched} from "./matcher/Mismatched";
import {ensureNoFunction} from "./assertThat";
import {PrettyPrinter} from "./prettyPrint/PrettyPrinter";
import {ofType} from "./ofType";

export function validateThat<T>(actual: any) {
    return new Validator(actual)
}

class Validator<T> {
    constructor(private actual: any) {
    }

    satisfies(expected: DiffMatcher<T> | any): ValidationResult {
        ensureNoFunction(this.actual);
        const matcher = matchMaker(expected);
        const mismatched: Array<Mismatched> = [];
        matcher.mismatches(new ContextOfValidationError(), mismatched, this.actual);
        return new ValidationResult(mismatched.map(m => (ofType.isString(m) ? m as string :
            PrettyPrinter.make(500, 5000).render(m))));
    }
}

export class ValidationResult {
    constructor(public errors: Array<string>) {
    }

    passed = () => this.errors.length === 0
}