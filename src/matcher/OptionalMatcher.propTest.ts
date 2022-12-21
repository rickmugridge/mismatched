import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("match.optional() property tests:", () => {
    it('always matches a value or undefined', () => {
        fc.assert(
            fc.property(anyJavascriptValue(), value => {
                    assertThat(value).is(match.optional(value))
                    assertThat(undefined).is(match.optional(value))
                }
            ))
    })

    it('never matches the wrong value', () => {
        fc.assert(
            fc.property(anyJavascriptValue().filter(v => v !== undefined), value => {
                    assertThat(value).isNot(match.optional(Symbol()))
                }
            ))
    })
});