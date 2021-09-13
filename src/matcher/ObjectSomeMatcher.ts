import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {ofType} from "../ofType";
import {concatObjects} from "./ObjectMatcher";
import {DiffFieldMatcher} from "./DiffFieldMatcher";

export class ObjectSomeMatcher<T> extends DiffMatcher<T> {
    private constructor(private expected: Array<DiffFieldMatcher<T>>) {
        super();
    }

    static make<T extends object>(expected: object): any {
        return new ObjectSomeMatcher<T>(DiffFieldMatcher.makeAll<T>(expected));
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: T): MatchResult {
        if (!ofType.isObject(actual)) {
            mismatched.push(Mismatched.make(context, actual, "object expected"));
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        const results = {};
        let errors = 0;
        let compares = 0;
        let matches = 0;
        let matchedObjectKey = false
        const keyMatchers = this.expected.filter(m => m.isKey());
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
        const nonKeyMatchers = this.expected.filter(m => !m.isKey());
        nonKeyMatchers.forEach(e => {
            const result = e.mismatches(context, mismatched, actual);
            if (result.passed()) {
                results[e.fieldName] = actual[e.fieldName];
            } else {
                results[e.fieldName] = result.diff;
            }
            compares += result.compares;
            matches += result.matchRate * result.compares;
        });
        return new MatchResult(results, compares, matches, matchedObjectKey);
    }

    describe(): any {
        return {"obj.has": concatObjects(this.expected.map(e => e.describe()))};
    }
}
