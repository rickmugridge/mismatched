import {PredicateMatcher} from "./PredicateMatcher";

export const instanceOfMatcher = {
    instanceOf: (expected: Function) =>
        PredicateMatcher.make(actual => (actual instanceof expected),
            {"instanceOf": expected.name})

};