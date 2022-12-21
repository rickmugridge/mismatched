import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";

describe("object.match property tests:", () => {
    it('always matches same structure', () => {
        fc.assert(
            fc.property(fc.object(), value =>
                assertThat(value).is(value)))
    })

    it('always matches same deeply-nested structure', () => {
        let obj =
            fc.record({
                f: fc.record({
                    g: fc.object(),
                    h: anyJavascriptValue()
                }),
                i: anyJavascriptValue()
            });
        fc.assert(
            fc.property(obj, value =>
                assertThat(value).is(value)))
    })

    it('never matches a different structure', () => {
        fc.assert(
            fc.property(fc.object(), value => {
                let expected = {[Symbol()]: Symbol()};
                assertThat(value).isNot(expected)
                assertThat(value).isNot({...value, [Symbol()]: Symbol()})
                }
            ))
    })
});