import * as fc from 'fast-check'
import {assertThat} from "../assertThat";
import {ofType} from "../ofType";
import {match} from "../match";
import {anyJavascriptValue} from "./AnyMatcher.propTest";

describe("match.itIs() property tests:", () => {
    describe("value always matches itself", () => {
        const check = (property: any) => fc.assert(fc.property(property, (value) => {
            assertThat(value).is(match.itIs(value))
        }));

        it('A string or symbol', () => {
            check(fc.oneof(fc.string(), fc.char(), fc.string().map(s => Symbol(s))));
        })

        it('A number', () => {
            check(fc.oneof(fc.integer(), fc.float(), fc.double()).filter(v => !isNaN(v)));
        })

        it('A number or boolean', () => {
            check(fc.boolean());
        })

        it('A null or undefined', () => {
            check(fc.oneof(fc.constant(undefined), fc.constant(null)));
        })

        it('A build-in object', () => {
            check(fc.oneof(fc.bigInt(), fc.date(), fc.string().map(s => fc.constant(new Error(s)))));
        })

        it('An object', () => {
            check(fc.oneof(fc.object()));
        })

        it('An array or tuple value', () => {
            check(fc.oneof(fc.array(fc.integer()), fc.tuple(fc.integer(), fc.string())));
        })
    })

    describe("value never matches a different value", () => {
        it('differs ', () => {
            const valueThatIsNotNaN = () => anyJavascriptValue()
                .filter((v: any) => !ofType.isNumber(v) || !isNaN(v));
            fc.assert(
                fc.property(fc.tuple(valueThatIsNotNaN(), valueThatIsNotNaN()), (value) => {
                    const v0 = value[0];
                    const v1 = value[1];
                    if (v0 !== v1)
                        assertThat(v0).isNot(match.itIs(v1))
                })
            );
        });
    });
})

