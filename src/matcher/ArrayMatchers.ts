import {matchMaker} from "./matchMaker";
import {MatchResult} from "../MatchResult";
import {isArray} from "util";
import {DiffMatcher} from "./DiffMatcher";
import {IsEqualsMatcher} from "./IsEqualsMatcher";

export class ArrayContainsMatcher<T> extends DiffMatcher<Array<T>> {
    constructor(private expected: DiffMatcher<T>) {
        super();
    }

    matches(actual: Array<T>): MatchResult {
        if (isArray(actual)) {
            let compares = 0;
            let matches = 0;
            for (let a of actual) {
                const result = this.expected.matches(a);
                if (result.passed()) {
                    return MatchResult.good(result.compares);
                }
                compares += result.compares;
                matches += result.matches;
            }
            return MatchResult.wasExpected(actual, this.describe(), compares, matches);
        }
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return {"array.contains": this.expected.describe()};
    }

    static make<T>(expected: DiffMatcher<T> | any): any {
        return new ArrayContainsMatcher<T>(matchMaker(expected));
    }
}

export class ArrayEveryMatcher<T> implements DiffMatcher<Array<T>> {
    constructor(private expected: DiffMatcher<T>) {
    }

    matches(actual: Array<T>): MatchResult {
        if (isArray(actual)) {
            let corrects = 0;
            let compares = 0;
            let matches = 0;
            for (let a of actual) {
                const result = this.expected.matches(a);
                if (result.passed()) {
                    corrects += 1;
                }
                compares += result.compares;
                matches += result.matches;
            }
            if (corrects === actual.length) {
                return MatchResult.good(compares);
            }
            return MatchResult.wasExpected(actual, this.describe(), compares, matches);
        }
        return MatchResult.wasExpected(actual, this.describe(), 1, 0);
    }

    describe(): any {
        return {"array.every": this.expected.describe()};
    }

    static make<T>(expected: DiffMatcher<T> | any): any {
        return new ArrayEveryMatcher<T>(matchMaker(expected));
    }
}

export class ArrayMatcher<T> implements DiffMatcher<Array<T>> {
    constructor(private expected: Array<DiffMatcher<T>>) {
    }

    matches(actual: Array<T>): MatchResult {
        if (!isArray(actual) || actual.length !== this.expected.length) {
            return MatchResult.wasExpected(actual, this.describe(), 1, 0);
        }
        const results: Array<any> = [];
        let errors = 0;
        let compares = 0;
        let matches = 0;
        for (let i = 0; i < actual.length; i++) {
            const act = actual[i];
            const result = this.expected[i].matches(act);
            if (result.passed()) {
                results.push(act);
            } else {
                results.push(result.diff);
                errors += 1;
            }
            compares += result.compares;
            matches += result.matches;
        }
        if (errors === 0) {
            return MatchResult.good(compares);
        }
        return new MatchResult(results, compares, matches);
    }

    describe(): any {
        return this.expected.map(e => e.describe());
    }

    static make<T>(expected: Array<DiffMatcher<T> | any>): any {
        return new ArrayMatcher<T>(expected.map(e => matchMaker(e)));
    }
}

export class ArrayLengthMatcher<T> implements DiffMatcher<Array<T>> {
    constructor(private expected: number) {
    }

    matches(actual: Array<T>): MatchResult {
        if (actual.length === this.expected) {
            return MatchResult.good(1);
        }
        return MatchResult.wasExpected(actual.length, this.describe(), 1, 0);
    }

    describe(): any {
        return {"array.length": this.expected};
    }

    static make<T>(expected: number): any {
        return new ArrayLengthMatcher<T>(expected);
    }
}

export function arrayLiteralMatchers<T>(values: Array<T>): Array<DiffMatcher<T>> {
    return values.map(v => IsEqualsMatcher.make(v))
}