import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("match.allOf property tests:", () => {
    it('match.allOf() always matches if each of the matchers match', () => {
        fc.assert(
            fc.property(fc.array(fc.constant(match.any())), anyJavascriptValue(),
                (matchers, value) => assertThat(value).is(match.allOf(matchers))
            ))
    })

    it('match.allOf() never matches with a non-element, a Symbol', () => {
        fc.assert(
            fc.property(fc.array(fc.constant(match.any())),
                (matchers) => assertThat(1).isNot(match.allOf([...matchers, Symbol()]))
            ))
    })
});