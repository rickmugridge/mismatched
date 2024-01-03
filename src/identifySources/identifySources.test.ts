import {assertThat} from "../assertThat";
import {PrettyPrinter} from "../prettyPrint/PrettyPrinter";
import {buildMap, identify} from "./identifySources";

describe("identifySources", () => {
    describe("identifySources()", () => {
        it("is primitive, unmapped", () => {
            assertThat(identify(null, {})).is(null)
            assertThat(identify(undefined, {})).is(undefined)
            assertThat(identify(1.2, {})).is(1.2)
            assertThat(identify("abc", {})).is("abc")
            assertThat(identify(false, {})).is(false)
        })

        it("is primitive within an object", () => {
            assertThat(identify(null, {n: null})).is(null)
            assertThat(identify(undefined, {u: undefined})).is(undefined)
            // assertThat(decompile(1.2, {n: 1.2})).is(identifier('n'))
            assertThat(identify("abc", {s: "abc"})).is(symbolEncoded('s'))
            assertThat(identify(false, {f: false})).is(false)
        })

        it("is object", () => {
            const obj = {b: 1, c: 2}
            const result = identify(1, {obj})
            assertThat(result).is(symbolEncoded("obj.b"))
        })

        it("is object and array with no contributors", () => {
            const actual = {a: [1, [2]], b: {c: "d"}}
            assertThat(identify(actual, {})).is(actual)
        })

        it("is an enum", () => {
            enum E {AA = "E.A", BB = "E.B"}

            let result = identify("E.A", {}, {E: E})
            assertThat(result).is(symbolEncoded('E.AA'))
        })

        it("small number values (elements) of an enum are ignored", () => {
            enum E {A, B, C = 23}

            let result = identify([0, 23], {}, {E: E})
            assertThat(result).is([0, symbolEncoded('E.C')])
        })

        it("small number values (elements) of an enum are ignored in an object", () => {
            enum E {A, B, C = 23}

            let result = identify({a: 0, c: 23}, {}, {E: E})
            assertThat(result).is({a: 0, c: symbolEncoded('E.C')})
        })

        it("results in paths", () => {
            enum E {A = "E.A", B = "E.B"}

            const source = {
                a: {
                    b: [
                        {c: E.A}
                    ],
                    d: {e: E.B},
                    f: 334,
                    g: true,
                    h: true,
                    i: [0, 11]
                }
            }
            const actual = {
                c: E.A,
                e: E.B,
                f: 334,
                g: true,
                i: [0, 11],
            }
            let result = identify(actual, {source}, {E: E});
            assertThat(result)
                .is({
                    c: symbolEncoded("source.a.b[0].c"),
                    e: symbolEncoded("source.a.d.e"),
                    f: symbolEncoded("source.a.f"),
                    g: true,
                    i: [symbolEncoded("source.a.i[0]"), symbolEncoded("source.a.i[1]")], //identifier("source.i"),
                })
        });

        it("Ignores potential mappings when there are more than 2 of them", () => {
            const source = [0, 1, 1, 2, 2, 2]
            const actual = [0, 1, 2]
            const result = identify(actual, {source})
            assertThat(result).is([
                symbolEncoded("source[0]"),
                symbolEncoded("source[1] | source[2]"),
                2
            ])
        })

        it("is object and array mapped", () => {
            enum E {
                A = 'A1',
                B = 'B2',
                C = 'C3',
            }

            const two = 2
            const a2 = [two]
            const aa = [1, a2]
            const dee = "d"
            const b = {c: dee}
            const productCode = '123456'
            const product = {productCode}
            const actual = {a: aa, b, ce: E.A, product, productCode}
            assertThat(identify(actual, {all: actual}, {E}))
                .is(symbolEncoded("all"))
            assertThat(identify(actual, {aa, b}))
                .is({...actual, a: symbolEncoded("aa"), b: symbolEncoded("b")})
            assertThat(identify(actual, {aa, b}, {E}))
                .is({...actual, a: symbolEncoded("aa"), b: symbolEncoded("b"), ce: symbolEncoded('E.A')})
            assertThat(identify(actual, {aa}))
                .is({...actual, a: symbolEncoded("aa")})
            assertThat(identify(actual, {aa}, {E}))
                .is({...actual, a: symbolEncoded("aa"), ce: symbolEncoded('E.A')})
            assertThat(identify(actual, {a2})).is({...actual, a: [1, symbolEncoded("a2")]})
            // match.decompiledActual(actual, {dee, a1, counterpartyCode, counterparty}, {E})
        })
    })

    describe("buildMap", () => {
        it("is object", () => {
            const obj = {b: 1, c: 2}
            const result = buildMap({a: obj}, {}, [])
            assertThat(result.getAllElements()).is([
                [obj, ["a"]],
                [1, ["a.b"]],
                [2, ["a.c"]]
            ])
        })

        it("is array", () => {
            const as = [1, 2, {c: "abc"}]
            const result = buildMap({as}, {}, [])
            assertThat(result.getAllElements()).is([
                [as, ["as"]],
                [1, ["as[0]"]],
                [2, ["as[1]"]],
                [as[2], ["as[2]"]],
                ["abc", ["as[2].c"]]
            ])
        })

        it("is an array with too many elements", () => {
            const source = [0, 1, 1, 2, 2, 2]
            let result = buildMap({source}, {}, [])
            assertThat(result.getAllElements()).is([
                [source, ["source"]],
                [0, ["source[0]"]],
                [1, ["source[1]", "source[2]"]]
            ])
        })

        it("enum with strings", () => {
            enum E {A = "AA", B = "BB"}

            const result = buildMap({}, {E: E}, [])
            assertThat(result.getAllElements()).is([
                ["AA", ["E.A"]],
                ["BB", ["E.B"]]
            ])
        })

        it("enum with numbers", () => {
            enum E {AA, BB, CC = 32}

            const result = buildMap({}, {E: E}, [])
            assertThat(result.getAllElements()).is([
                [32, ["E.CC"]]
            ])
        })

        it("is object with self-reference", () => {
            let obj = {b: 1, c: 2}
            obj["d"] = obj
            const result = buildMap({a: obj}, {}, [])
            assertThat(result.getAllElements()).is([
                [obj, ["a"]],
                [1, ["a.b"]],
                [2, ["a.c"]]
            ])
        })

        it("is array with self-reference", () => {
            let as: any[] = [1, 2, {c: "abc"}]
            as.push(as)
            const result = buildMap({as}, {}, [])
            assertThat(result.getAllElements()).is([
                [as, ["as"]],
                [1, ["as[0]"]],
                [2, ["as[1]"]],
                [as[2], ["as[2]"]],
                ["abc", ["as[2].c"]]
            ])
        })
    })
})

const symbolEncoded = (s: string) => ({[PrettyPrinter.symbolForPseudoCall]: s})
