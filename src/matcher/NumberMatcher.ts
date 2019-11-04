import {PredicateMatcher} from "./PredicateMatcher";
import {ofType} from "../ofType";

export const numberMatcher = {
    nan: () => PredicateMatcher.make(ofType.isNaN, "NaN"),
    less: (expected: number) => PredicateMatcher.make(value => value < expected,
        {"number.less": expected}),
    lessEqual: (expected: number) => PredicateMatcher.make(value => value <= expected,
        {"number.lessEqual": expected}),
    greater: (expected: number) => PredicateMatcher.make(value => value > expected,
        {"number.greater": expected}),
    greaterEqual: (expected: number) => PredicateMatcher.make(value => value >= expected,
        {"number.greaterEqual": expected})
};