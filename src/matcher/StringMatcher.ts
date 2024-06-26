import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {MatchResult} from "../MatchResult";
import {ofType} from "../ofType";
import {PredicateMatcher} from "./PredicateMatcher";
import {Mismatched} from "./Mismatched";
import {RegExpMatcher} from "./RegExpMatcher";
import {stringDiff} from "../diff/StringDiff";
import {PatchItem} from "fast-array-diff/dist/diff/patch";
import {MappedMatcher} from "./MappedMatcher";
import {matchMaker} from "../matchMaker/matchMaker";
import {AnyMatcher} from "./AnyMatcher";

const minimum = 5

export class StringMatcher extends DiffMatcher<string> {
    private constructor(private expected: string) {
        super();
    }

    static make(expected: string): any {
        return new StringMatcher(expected);
    }

    mismatches(context: ContextOfValidationError, mismatched: string[], actual: any): MatchResult {
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
        ofType.isString(value) && value.startsWith(expected), {"match.string.startsWith": expected}),
    endsWith: (expected: string) => PredicateMatcher.make(value =>
        ofType.isString(value) && value.endsWith(expected), {"match.string.endsWith": expected}),
    includes: (expected: string) => PredicateMatcher.make(value =>
        ofType.isString(value) && value.includes(expected), {"match.string.includes": expected}),
    uuid: () => PredicateMatcher.make(value =>
        ofType.isString(value) && value.match(uuidRegExp) !== null, "match.uuid"),
    nonEmpty: () => PredicateMatcher.make(value =>
        ofType.isString(value) && value.length > 0, "match.string.nonEmpty"),
    asDate: (expected: Date | any) => {
        const matcher = matchMaker(expected)
        return MappedMatcher.make<string, Date>(
            (actual: string): Date => {
                if (!ofType.isString(actual)) {
                    throw new Error("match.string.asDate() can only take a string as argument")
                }
                return new Date(actual)
            }, matcher,
            "match.string.asDate")
    },
    asSplit: (separator: string, expected: string[] | any) => {
        const matcher = matchMaker(expected)
        return MappedMatcher.make<string, string[]>(
            (actual: string): string[] => {
                if (!ofType.isString(actual)) {
                    throw new Error("match.string.asSplit() can only take a string as argument")
                }
                return actual.split(separator)
            }, matcher,
            `match.split('${separator}')`)
    },
    asNumber: (expected: number = new AnyMatcher() as any) => {
        const matcher = matchMaker(expected)
        return MappedMatcher.make<string, number>(
            (actual: string): number => {
                if (!ofType.isString(actual)) {
                    throw new Error("match.string.asNumber() can only take a string as argument")
                }
                return Number(actual)
            },
            matcher, "match.string.asNumber")
    },
    asDecimal: (places: number, expected: number = new AnyMatcher() as any) => {
        const matcher = matchMaker(expected)
        return MappedMatcher.make<string, number>(
            (actual: string): number => {
                if (!ofType.isString(actual)) {
                    throw new Error("match.string.asDecimal() can only take a string as argument")
                }
                return actual.split(".").length == places ? Number(actual) : NaN
            },
            matcher, `match.string.asDecimal(${places})`)
    },
    fromJson: (expected: any = new AnyMatcher()) => {
        const matcher = matchMaker(expected)
        return MappedMatcher.make<string, any>(
            (actual: string): any => {
                if (!ofType.isString(actual)) {
                    throw new Error("match.string.fromJson() can only take a string as argument")
                }
                return JSON.parse(actual)
            }, matcher, "fromJson")
    },
}

const matchRating = (length: number, totalLength: number) =>
    length > 0 ? (length - totalLength) / (length * 2) : 0