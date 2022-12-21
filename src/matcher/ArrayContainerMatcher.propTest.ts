import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("array.contains property tests:", () => {
    it('match.contains() always matches with any element of the array', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()).filter(a => a.length > 0), value => {
                const index = randomInt(0, value.length - 1)
                assertThat(value).is(match.array.contains(value[index]))
            }))
    })

    it('match.contains() never matches with a non-element', () => {
        fc.assert(
            fc.property(fc.array(anyJavascriptValue()), value =>
                assertThat(value).isNot(match.array.contains(Symbol()))))
    })
});

const randomInt = (min: number, max: number) => // min and max inclusive
    Math.floor(Math.random() * (max - min + 1) + min)

