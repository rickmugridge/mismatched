import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("match.optionalNull() property tests:", () => {
    it('always matches a value or undefined or null', () => {
        fc.assert(
            fc.property(anyJavascriptValue(), value => {
                    assertThat(value).is(match.optionalNull(value))
                    assertThat(undefined).is(match.optionalNull(value))
                    assertThat(null).is(match.optionalNull(value))
                }
            ))
    })

    it('never matches the wrong value', () => {
        fc.assert(
            fc.property(anyJavascriptValue().filter(v => v !== undefined && v !== null), value => {
                    assertThat(value).isNot(match.optionalNull(Symbol()))
                }
            ))
    })
});