import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("match.string property tests:", () => {
    it('always matches with the same string', () => {
        fc.assert(
            fc.property(fc.string(), value =>
                assertThat(value).is(value)
            ))
    })

    it('never matches with a different string', () => {
        fc.assert(
            fc.property(fc.string(), value => {
                    assertThat(value).isNot(value + '1')
                    assertThat(value + '1').isNot(value)
                }
            ))
    })
});

describe("match.startsWith/endsWith/includes property tests:", () => {
    it('always matches with the same string', () => {
        fc.assert(
            fc.property(fc.string(), value => {
                    assertThat(value).is(match.string.startsWith(value))
                    assertThat(value).is(match.string.endsWith(value))
                    assertThat(value).is(match.string.includes(value))
                }
            ))
    })

    it('always matches with suitable string', () => {
        fc.assert(
            fc.property(fc.string(), value => {
                    assertThat(value + '1').is(match.string.startsWith(value))
                    assertThat('1' + value).is(match.string.endsWith(value))
                    assertThat('1' + value + '1').is(match.string.includes(value))
                }
            ))
    })

    it('never matches with a different string', () => {
        fc.assert(
            fc.property(fc.string(), value => {
                    assertThat(value).isNot(match.string.startsWith('1' + value))
                    assertThat(value).isNot(match.string.endsWith(value) + '1')
                }
            ))
    })
});
