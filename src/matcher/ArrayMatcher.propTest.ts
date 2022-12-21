import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("array.matcher property tests:", () => {
    it('always matches with the same array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value =>
                assertThat(value).is(value)))
    })

    it('never matches with a different array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value =>
                assertThat([...value, Symbol()]).isNot(value)))
    })
});