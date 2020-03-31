import {DiffMatcher} from "./matcher/DiffMatcher";
import {matchMaker} from "./matchMaker/matchMaker";
import {Mismatched} from "./matcher/Mismatched";
import {ensureNoFunction} from "./assertThat";

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
        matcher.mismatches("actual", mismatched, this.actual);
        return new ValidationResult(mismatched);
    }
}

export class ValidationResult {
    constructor(public mismatched: Array<Mismatched>) {
    }

    passed = () => this.mismatched.length === 0
}