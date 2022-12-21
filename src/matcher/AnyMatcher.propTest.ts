import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";

export const anyJavascriptValue = () => fc.oneof(fc.string(), fc.char(), fc.string().map(s => Symbol(s)), fc.integer(), fc.float(),
    fc.double(), fc.boolean(), fc.constant(undefined), fc.constant(null), fc.constant(NaN),
    fc.bigInt(), fc.date(), fc.object(), fc.array(fc.integer()), fc.tuple(fc.integer(), fc.string()))

describe("match.any() property tests:", () => {
    it('match.any() always matches', () => {
        fc.assert(
            fc.property(anyJavascriptValue(), value => assertThat(value).is(match.any())))
    })
});