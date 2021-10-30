import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {ofType} from "../ofType";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffFieldMatcher} from "./DiffFieldMatcher";

export class ObjectMatcher<T extends object> extends DiffMatcher<T> {
    private constructor(private expectedObject: object, private matchers: Array<DiffFieldMatcher<T>>) {
        super();
        this.complexity = DiffMatcher.andComplexity(matchers)
    }

    static make<T extends object>(obj: object): any {
        return new ObjectMatcher<T>(obj, DiffFieldMatcher.makeAll<T>(obj));
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        if (!ofType.isObject(actual)) {
            mismatched.push(Mismatched.makeExpectedMessage(context, actual, "object expected"));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        if (this.expectedObject === actual) {
            return MatchResult.good(1, true);
        }
        const results = {};
        let errors = 0;
        let compares = 0;
        let matches = 0;
        let matchedObjectKey = false
        const keyMatchers = this.matchers.filter(m => m.isKey());
        if (keyMatchers.length > 0) {
            keyMatchers.forEach(e => {
                const result = e.mismatches(context, mismatched, actual);
                if (result.passed()) {
                    results[e.fieldName] = actual[e.fieldName];
                } else {
                    results[e.fieldName] = result.diff;
                    errors += 10;
                }
                compares += result.compares;
                matches += result.matchRate * result.compares;
            });
            if (errors === 0) {
                matchedObjectKey = true
            }
        }
        const nonKeyMatchers = this.matchers.filter(m => !m.isKey());
        nonKeyMatchers.forEach(e => {
            const result = e.mismatches(context, mismatched, actual);
            if (result.passed()) {
                results[e.fieldName] = actual[e.fieldName];
            } else {
                results[e.fieldName] = result.diff;
                errors += 1;
            }
            compares += result.compares;
            matches += result.matchRate * result.compares;
        });
        const unexpected: any = {};
        let wasUnexpected = false;
        Object.keys(actual).forEach(key => {
            // Careful, as a field may have an explicit value of undefined:
            if (actual[key] !== undefined && results[key] === undefined) {
                unexpected[key] = actual[key];
                errors += 1;
                compares += 1;
                wasUnexpected = true;
            }
        });
        if (wasUnexpected) {
            mismatched.push(Mismatched.makeUnexpectedMessage(context, actual, unexpected));
            results[MatchResult.unexpected] = unexpected;
        }
        if (errors === 0) {
            return MatchResult.good(compares, matchedObjectKey);
        }
        return new MatchResult(results, compares, matches, matchedObjectKey);
    }

    describe(): any {
        return concatObjects(this.matchers.map(e => e.describe()));
    }
}

export function concatObjects(objects: Array<object>): object {
    const result = {};
    objects.forEach(o => Object.keys(o).forEach(key => result[key] = o[key]));
    return result;
}
