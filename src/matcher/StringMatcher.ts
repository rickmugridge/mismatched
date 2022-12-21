import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {ofType} from "../ofType";
import {PredicateMatcher} from "./PredicateMatcher";
import {Mismatched} from "./Mismatched";
import {RegExpMatcher} from "./RegExpMatcher";
import {stringDiff} from "../diff/StringDiff";
import {PatchItem} from "fast-array-diff/dist/diff/patch";

const minimum = 5

export class StringMatcher extends DiffMatcher<string> {
    private constructor(private expected: string) {
        super();
    }

    static make(expected: string): any {
        return new StringMatcher(expected);
    }

    mismatches(context: ContextOfValidationError, mismatched: Array<Mismatched>, actual: any): MatchResult {
        if (ofType.isString(actual)) {
            if (actual == this.expected) {
                return MatchResult.good(1);
            }
        } else {
            mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.expected));
            return MatchResult.wasExpected(actual, this.expected, 1, 0);
        }
        mismatched.push(Mismatched.makeExpectedMessage(context, actual, this.describe()));
        const deltas: PatchItem<string>[] = stringDiff.getPatch(this.expected, actual);
        const {totalAddLength, totalRemoveLength} = stringDiff.lengths(deltas);
        const rating =
            matchRating(actual.length, totalRemoveLength) +
            matchRating(this.expected.length, totalAddLength)
        const matchResult = MatchResult.wasExpected(actual, this.describe(), 1, rating);
        if (ofType.isString(actual)) {
            if (actual.length > 0 && this.expected.length > 0 &&
                (actual.length > minimum || this.expected.length > minimum) &&
                (totalRemoveLength < actual.length || totalAddLength < this.expected.length)) {
                matchResult.differ(stringDiff.differ(deltas, Array.from(actual)))
            }
        }
        return matchResult;
    }

    describe(): any {
        return this.expected;
    }
}

const uuidRegExp = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/

export const stringMatcher = {
    match: (expected: string | RegExp) =>
        ofType.isString(expected) ? StringMatcher.make(expected as string) : RegExpMatcher.make(expected as RegExp),
    startsWith: (expected: string) => PredicateMatcher.make(value =>
        ofType.isString(value) && value.startsWith(expected),
        {"string.startsWith": expected}),
    endsWith: (expected: string) => PredicateMatcher.make(value =>
        ofType.isString(value) && value.endsWith(expected),
        {"string.endsWith": expected}),
    includes: (expected: string) => PredicateMatcher.make(value =>
        ofType.isString(value) && value.includes(expected),
        {"string.includes": expected}),
    uuid: () => PredicateMatcher.make(value =>
        ofType.isString(value) && value.match(uuidRegExp) !== null,
        "uuid"),
};

const matchRating = (length: number, totalLength: number) =>
    length > 0 ? (length - totalLength) / (length * 2) : 0