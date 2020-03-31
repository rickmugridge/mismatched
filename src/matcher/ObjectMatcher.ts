import {DiffMatcher} from "./DiffMatcher";
import {ofType} from "../ofType";
import {isUndefined} from "util";
import {MatchResult} from "../MatchResult";
import {Mismatched} from "./Mismatched";
import {DiffFieldMatcher} from "./DiffFieldMatcher";

export class ObjectMatcher<T extends object> extends DiffMatcher<T> {
    private constructor(private expectedObject: object, private expected: Array<DiffFieldMatcher<T>>) {
        super();
    }

    mismatches(context: string, mismatched: Array<Mismatched>, actual: T): MatchResult {
        if (!ofType.isObject(actual)) {
            mismatched.push(Mismatched.make(context, actual, "object expected"));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        if (this.expectedObject === actual) {
            return MatchResult.good(1);
        }
        const results = {};
        let errors = 0;
        let compares = 0;
        let matches = 0;
        this.expected.forEach(e => {
            const result = e.mismatches(context, mismatched, actual);
            if (result.passed()) {
                results[e.fieldName] = actual[e.fieldName];
            } else {
                results[e.fieldName] = result.diff;
                errors += 1;
            }
            compares += result.compares;
            matches += result.matches;
        });
        const unexpected: any = {};
        let wasUnexpected = false;
        Object.keys(actual).forEach(key => {
            // Careful, as a field may have an explicit value of undefined:
            if (!isUndefined(actual[key]) && isUndefined(results[key])) {
                unexpected[key] = actual[key];
                errors += 1;
                compares += 1;
                wasUnexpected = true;
            }
        });
        if (wasUnexpected) {
            mismatched.push(Mismatched.make(context, actual, "unexpected", unexpected));
            results[MatchResult.unexpected] = unexpected;
        }
        if (errors === 0) {
            return MatchResult.good(compares);
        }
        return new MatchResult(results, compares, matches);
    }

    describe(): any {
        return concatObjects(this.expected.map(e => e.describe()));
    }

    static make<T extends object>(obj: object): any {
        return new ObjectMatcher<T>(obj, DiffFieldMatcher.makeAll<T>(obj));
    }
}



export function concatObjects(objects: Array<object>): object {
    const result = {};
    objects.forEach(o => Object.keys(o).forEach(key => result[key] = o[key]));
    return result;
}