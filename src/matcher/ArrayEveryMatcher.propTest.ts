import * as fc from "fast-check";
import {assertThat} from "../assertThat";
import {match} from "../match";

describe("array.every property tests:", () => {
    it('match.every() always matches which each element is matched', () => {
        fc.assert(
            fc.property(fc.array(fc.integer()), value =>
                assertThat(value).is(match.array.every(match.any()))))
    })

    it('match.every() never matches when any element fails to match', () => {
        fc.assert(
            fc.property(fc.array(fc.constant(3)), value =>
                assertThat([...value, true]).isNot(match.array.every(Symbol()))))
    })
});