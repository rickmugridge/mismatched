import {assertThat} from "../assertThat";
import {enumFixer} from "./enumFixer";

enum NumberBased {A, B, C = 23}
enum StringBased {A = "AA", B = "BB"}
describe("enumFixer", () => {
    describe("Number values", () => {
        it("keysOf", () => {
            assertThat(Object.keys(NumberBased)).is(["0", "1", "23", "A", "B", "C"])
            assertThat(enumFixer.keysOf(NumberBased)).is(["A", "B", "C"])
        })

        it("valuesOf", () => {
            assertThat(Object.values(NumberBased)).is(["A", "B", "C", 0, 1, 23])
            assertThat(enumFixer.valuesOf(NumberBased)).is([0, 1, 23])
        })
    })

    describe("String values", () => {
        it("keysOf", () => {
            assertThat(Object.keys(StringBased)).is(["A", "B"])
            assertThat(enumFixer.keysOf(StringBased)).is(["A", "B"])
        })

        it("valuesOf", () => {
            assertThat(Object.values(StringBased)).is([StringBased.A, StringBased.B])
            assertThat(enumFixer.valuesOf(StringBased)).is(["AA", "BB"])
        })
    })
})