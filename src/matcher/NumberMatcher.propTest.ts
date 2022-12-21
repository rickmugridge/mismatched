import * as fc from 'fast-check'
import {assertThat} from "../assertThat";
import {match} from "../match";

const numberValue = () => fc.oneof(fc.integer(), fc.float(), fc.double())
    .filter(v => v > Number.MIN_SAFE_INTEGER && v < Number.MAX_SAFE_INTEGER)
const realValue = () => fc.oneof(fc.integer(), fc.float(), fc.double())
    .filter(v => v !== Infinity && v !== -Infinity && !isNaN(v))

describe("match.number...() property tests:", () => {
    it("always matches when the relation is true with a positive number", () => {
        fc.assert(
            fc.property(numberValue(), (value) => {
                assertThat(value).is(value)
                assertThat(value).is(match.number.less(value + 1))
                assertThat(value).is(match.number.lessEqual(value))
                assertThat(value).is(match.number.lessEqual(value + 1))
                assertThat(value).is(match.number.greater(value - 1))
                assertThat(value).is(match.number.greaterEqual(value))
            })
        );
    })

    it("always matches when real is close, disregarding Infinity", () => {
        fc.assert(
            fc.property(realValue(), (value) => {
                assertThat(value).is(match.number.withinDelta(value, 0.0))
                assertThat(value).is(match.number.withinDelta(value, 100.0))
                assertThat(value + 0.1).is(match.number.withinDelta(value, 0.2))
                assertThat(value - 0.1).is(match.number.withinDelta(value, 0.2))
            })
        );
    })

    it("never matches when the relation is false with a positive number", () => {
        fc.assert(
            fc.property(numberValue(), (value) => {
                assertThat(value).isNot(match.number.less(value - 1))
                assertThat(value).isNot(match.number.lessEqual(value - 1))
                assertThat(value).isNot(match.number.greater(value + 1))
                assertThat(value).isNot(match.number.greaterEqual(value + 1))
            })
        );
    });
})