import {PredicateMatcher} from "./PredicateMatcher";
import {ofType} from "../ofType";

export const instanceOfMatcher = {
    instanceOf: (expected: Function) =>
        PredicateMatcher.make(actual => ofType.isObject(actual) && (actual instanceof expected),
            {"instanceOf": expected.name})
};