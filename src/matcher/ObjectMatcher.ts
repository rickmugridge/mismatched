import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {ofType} from "../ofType";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffFieldMatcher} from "./DiffFieldMatcher";
import {allKeys} from "../allKeys";

export class ObjectMatcher<T extends object> extends DiffMatcher<T> {
    private constructor(private expectedObject: object, private fieldMatchers: Array<DiffFieldMatcher<T>>) {
        super();
        this.specificity = DiffMatcher.andSpecificity(fieldMatchers)
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
        const diff = {};
        let errors = 0;
        let compares = 0;
        let matches = 0;
        let matchedObjectKey = false
        const keyMatchers = this.fieldMatchers.filter(m => m.isKey());
        if (keyMatchers.length > 0) {
            keyMatchers.forEach(e => {
                const result = e.mismatches(context, mismatched, actual);
                if (result.passed()) {
                    diff[e.fieldName] = actual[e.fieldName];
                } else {
                    diff[e.fieldName] = result.diff;
                    errors += 10;
                }
                compares += result.compares;
                matches += result.matchRate * result.compares;
            });
            if (errors === 0) {
                matchedObjectKey = true
            }
        }
        const nonKeyMatchers = this.fieldMatchers.filter(m => !m.isKey());
        nonKeyMatchers.forEach(e => {
            const result = e.mismatches(context, mismatched, actual);
            if (result.passed()) {
                diff[e.fieldName] = actual[e.fieldName];
            } else {
                diff[e.fieldName] = result.diff;
                errors += 1;
            }
            compares += result.compares;
            matches += result.matchRate * result.compares;
        });
        const unexpected: any = {};
        let wasUnexpected = false;
        allKeys(actual).forEach(key => {
            // Careful, as an actual field may have an explicit value of undefined:
            if (actual[key] !== undefined && !diff.hasOwnProperty(key)) {
                unexpected[key] = actual[key];
                errors += 1;
                compares += 1;
                wasUnexpected = true;
            }
        });
        compares = compares === 0 ? 1 : compares
        if (wasUnexpected) {
            mismatched.push(Mismatched.makeUnexpectedMessage(context, actual, unexpected));
            diff[MatchResult.unexpected] = unexpected;
        }
        if (errors === 0) {
            return MatchResult.good(compares, matchedObjectKey);
        }
        return new MatchResult(diff, compares, matches, matchedObjectKey);
    }

    describe(): any {
        return concatObjects(this.fieldMatchers.map(e => e.describe()));
    }

    static allKeys(actual: object): (string | symbol)[] {
        return (Object.keys(actual) as (string | symbol)[])
            .concat(Object.getOwnPropertySymbols(actual))
    }
}

export function concatObjects(objects: Array<object>): object {
    const result = {};
    objects.forEach(o => allKeys(o).forEach(key => result[key] = o[key]));
    return result;
}
