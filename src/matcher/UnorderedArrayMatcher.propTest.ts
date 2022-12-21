import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("array.unordered property tests:", () => {
    it('always matches with the same array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value =>
                assertThat(value).is(match.array.unordered(value))
            ))
    })

    it('never matches with a different array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value => {
                    assertThat(value).isNot(match.array.unordered([...value, Symbol()]))
                }
            ))
    })
});