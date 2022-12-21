import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("match.anyOf property tests:", () => {
    it('match.anyOf() always matches if any of the matchers match', () => {
        fc.assert(
            fc.property(fc.array(fc.constant(2)),
                (matchers) => assertThat(1).is(match.anyOf([...matchers, 1]))
            ))
    })

    it('match.anyOf() never matches if none of the matchers match', () => {
        fc.assert(
            fc.property(fc.array(fc.constant(2)),
                (matchers) => assertThat(1).isNot(match.anyOf(matchers))
            ))
    })
});