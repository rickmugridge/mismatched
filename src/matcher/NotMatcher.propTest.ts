import * as fc from 'fast-check'
import {assertThat} from "../assertThat";
import {ofType} from "../ofType";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("match.not() property tests:", () => {
    it("always matches when the argument matcher fails to match", () => {
        fc.assert(
            fc.property(anyJavascriptValue(), (value) => {
                assertThat(value).is(match.not(Symbol()))
            })
        );
    })

    it("never matches when the argument matcher matches", () => {
        fc.assert(
            fc.property(anyJavascriptValue(), (value) => {
                assertThat(value).isNot(match.not(match.any()))
            })
        );
    });
})