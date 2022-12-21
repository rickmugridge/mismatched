import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("array.matcher property tests:", () => {
    it('always matches with the same array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value => {
                    const set = new Set(value)
                    assertThat(set).is(set)
                }
            ))
    })

    it('never matches with a different array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value => {
                    const set1 = new Set(value)
                    const set2 = new Set([...value, Symbol()])
                    assertThat(set1).isNot(set2)
                    assertThat(set2).isNot(set1)
                }
            ))
    })
});