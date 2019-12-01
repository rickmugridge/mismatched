import {DiffMatcher} from "./DiffMatcher";
import {Mismatch} from "./Mismatch";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "./matchMaker";

export class DiffFieldMatcher<T> extends DiffMatcher<T> {
    private constructor(public fieldName: string, private expected: DiffMatcher<T>) {
        super();
    }

    mismatches(context: string, errors: Array<Mismatch>, actual: T): MatchResult {
        return this.expected.mismatches(context + "." + this.fieldName, errors, actual[this.fieldName]);
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

    static makeAll<T>(obj: object): Array<DiffFieldMatcher<T>> {
        return Object.keys(obj)
            .map(key => new DiffFieldMatcher(key, matchMaker(obj[key])));
    }
}
