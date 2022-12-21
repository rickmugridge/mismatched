import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("array.length property tests:", () => {
    it('match.every() always matches which each element is matched', () => {
        fc.assert(
            fc.property(fc.array(fc.integer()), value =>
                assertThat(value).is(match.array.length(value.length))))
    })

    it('match.every() never matches when any element fails to match', () => {
        fc.assert(
            fc.property(fc.array(fc.integer()), value =>
                assertThat(value).isNot(match.array.length(value.length + 1))))
    })
});