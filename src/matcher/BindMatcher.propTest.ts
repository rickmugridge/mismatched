import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("array.matcher property tests:", () => {
    it('always matches with the same bound value', () => {
        fc.assert(
            fc.property(anyJavascriptValue(), value => {
                    const bind = match.bind()
                    assertThat(value).is(bind)
                    assertThat(value).is(bind)
                }
            ))
    })

    it('never matches with a different value', () => {
        fc.assert(
            fc.property(anyJavascriptValue(), value => {
                    const bind = match.bind()
                    assertThat(value).is(bind)
                    assertThat([value]).isNot(bind)
                }
            ))
    })
});