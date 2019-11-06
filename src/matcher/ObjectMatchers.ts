import {DiffMatcher} from "./DiffMatcher";
import {ofType} from "../ofType";
import {isUndefined} from "util";
import {matchMaker} from "./matchMaker";
import {MatchResult} from "../MatchResult";

export class ObjectSomeMatcher<T> implements DiffMatcher<T> {
    constructor(private expected: Array<DiffFieldMatcher<T>>) {
    }

    matches(actual: T): MatchResult {
        if (!ofType.isObject(actual)) {
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        const results = {};
        let errors = 0;
        let compares = 0;
        let matches = 0;
        this.expected.forEach(e => {
            const result = e.matches(actual);
            if (result.passed()) {
                results[e.fieldName] = actual[e.fieldName];
            } else {
                results[e.fieldName] = result.diff;
                errors += 1;
            }
            compares += result.compares;
            matches += result.matches;
        });
        if (errors === 0) {
            return MatchResult.good(compares);
        }
        return new MatchResult(results, compares, matches);
    }

    describe(): any {
        return {"obj.some": concatObjects(this.expected.map(e => e.describe()))};
    }

    static make<T extends object>(expected: Array<DiffMatcher<T>> | object): any {
        return new ObjectSomeMatcher<T>(DiffFieldMatcher.makeAll<T>(expected));
    }
}

export class ObjectMatcher<T extends object> implements DiffMatcher<T> {
    constructor(private expected: Array<DiffFieldMatcher<T>>) {
    }

    matches(actual: T): MatchResult {
        if (!ofType.isObject(actual)) {
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        const results = {};
        let errors = 0;
        let compares = 0;
        let matches = 0;
        this.expected.forEach(e => {
            const result = e.matches(actual);
            if (result.passed()) {
                results[e.fieldName] = actual[e.fieldName];
            } else {
                results[e.fieldName] = result.diff;
                errors += 1;
            }
            compares += result.compares;
            matches += result.matches;
        });
        Object.keys(actual).forEach(key => {
            // Careful, as a field may have an explicit value of undefined:
            if (!isUndefined(actual[key]) && isUndefined(results[key])) {
                results[key] = {[MatchResult.unexpected]: actual[key]};
                errors += 1;
            }
        });
        if (errors === 0) {
            return MatchResult.good(compares);
        }
        return new MatchResult(results, compares, matches);
    }

    describe(): any {
        return concatObjects(this.expected.map(e => e.describe()));
    }

    static make<T extends object>(expected: Array<DiffMatcher<T>> | object): any {
        return new ObjectMatcher<T>(DiffFieldMatcher.makeAll<T>(expected));
    }
}

export class DiffFieldMatcher<T> implements DiffMatcher<T> {
    constructor(public fieldName: string, private expected: DiffMatcher<T>) {
    }

    matches(actual: T): MatchResult {
        return this.expected.matches(actual[this.fieldName]);
        // // If too many errors, report the expected and actual completely separated
        // const matchResult = this.expected.matches(actual[this.fieldName]);
        // let mostlymatches = true; // base this on the rating and counts of matches, etc in the matchResult when it fails
        // if (matchResult.passed()  || mostlymatches) {
        //     return matchResult;
        // }
        // return MatchResult.wasExpected(actual[this.fieldName],
        //     this.expected.describe(), matchResult.compares, matchResult.matches);
    }

    describe(): any {
        return {[this.fieldName]: this.expected.describe()};
    }

    static make<T>(fieldName: string, expected: DiffMatcher<T> | any): DiffFieldMatcher<T> {
        return new DiffFieldMatcher<T>(fieldName, matchMaker(expected));
    }

    static makeAll<T>(obj: DiffFieldMatcher<T> | object): Array<DiffFieldMatcher<T>> {
        if (ofType.isArray(obj)) {
            return obj as Array<DiffFieldMatcher<T>>;
        }
        return Object.keys(obj).map(key => DiffFieldMatcher.make(key, obj[key]))

    }
}

function concatObjects(objects: Array<object>): object {
    const result = {};
    objects.forEach(o => Object.keys(o).forEach(key => result[key] = o[key]));
    return result;
}