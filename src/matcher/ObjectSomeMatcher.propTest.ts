import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";

describe("object.has property tests:", () => {
    it('always matches same structure', () => {
        fc.assert(
            fc.property(fc.object(), value =>
                assertThat(value).is(match.obj.has(value))))
    })

    it('always matches a subset', () => {
        fc.assert(
            fc.property(fc.object(), value =>
                assertThat({
                        ...value,
                        [Symbol()]: anyJavascriptValue().filter(v => v !== undefined)
                    }
                ).is(match.obj.has(value))))
    })

    it('never matches a different structure', () => {
        fc.assert(
            fc.property(fc.object(), value => {
                    assertThat(value).isNot(match.obj.has({f: value}))
                }
            ))
    })
});