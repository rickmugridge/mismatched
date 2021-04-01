import {assertThat} from "../assertThat";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";
import {decompile} from "./decompileActual";

describe("decompile()", () => {
    it("is primitive, unmapped", () => {
        assertThat(decompile(null, {})).is(null)
        assertThat(decompile(undefined, {})).is(undefined)
        assertThat(decompile(1.2, {})).is(1.2)
        assertThat(decompile("abc", {})).is("abc")
        assertThat(decompile(false, {})).is(false)
    });

    it("is primitive, mapped", () => {
        assertThat(decompile(null, {n: null})).is(identifier('n'))
        assertThat(decompile(undefined, {u: undefined})).is(undefined)
        assertThat(decompile(1.2, {n: 1.2})).is(identifier('n'))
        assertThat(decompile("abc", {s: "abc"})).is(identifier('s'))
        assertThat(decompile(false, {f: false})).is(identifier('f'))
    });

    it("is object and array unmapped", () => {
        const actual = {a: [1, [2]], b: {c: "d"}}
        assertThat(decompile(actual, {})).is(actual)
    });

    it("is object and array mapped", () => {
        enum E {
            A = 'A1',
            B = 'B2',
            C = 'C3',
        }

        const two = 2;
        const a1 = 'A1';
        const a2 = [two];
        const aa = [1, a2]
        const dee = "d";
        const b = {c: dee};
        const productCode = '123456'
        const product = {productCode}
        const actual = {a: aa, b, ce: E.A, product, productCode}
        assertThat(decompile(actual, {all: actual}, [E]))
            .is(identifier("all"))
        assertThat(decompile(actual, {aa, b}))
            .is({...actual, a: identifier("aa"), b: identifier("b")})
        assertThat(decompile(actual, {aa, b}, {E}))
            .is({...actual, a: identifier("aa"), b: identifier("b"), ce: identifier('E.A')})
        assertThat(decompile(actual, {aa}))
            .is({...actual, a: identifier("aa")})
        assertThat(decompile(actual, {aa}, {E}))
            .is({...actual, a: identifier("aa"), ce: identifier('E.A')})
        assertThat(decompile(actual, {a2})).is({...actual, a: [1, identifier("a2")]})
        // match.decompiledActual(actual, {dee, a1, counterpartyCode, counterparty}, {E})
    });
});

const identifier = (s: string) => ({[PrettyPrinter.symbolForPseudoCall]: s})