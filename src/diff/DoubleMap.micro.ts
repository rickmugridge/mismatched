import {DoubleMap} from "./DoubleMap";
import {assertThat} from "../assertThat";

describe("DoubleMap",()=>{
    it("is empty", () => {
        const doubleMap = new DoubleMap<number, number, number>()
        assertThat(doubleMap.get(1,2)).is(undefined)
    });

    it("Contains values with different first key", () => {
        const doubleMap = new DoubleMap<number, number, number>()
        doubleMap.set(1,2,3)
        doubleMap.set(10,20,30)
        assertThat(doubleMap.get(1,2)).is(3)
        assertThat(doubleMap.get(1,3)).is(undefined)
        assertThat(doubleMap.get(10,20)).is(30)
        assertThat(doubleMap.get(10,30)).is(undefined)
        assertThat(doubleMap.get(2,2)).is(undefined)
    });

    it("Contains values with same first key", () => {
        const doubleMap = new DoubleMap<number, number, number>()
        doubleMap.set(1,2,3)
        doubleMap.set(1,20,30)
        assertThat(doubleMap.get(1,2)).is(3)
        assertThat(doubleMap.get(1,3)).is(undefined)
        assertThat(doubleMap.get(1,20)).is(30)
        assertThat(doubleMap.get(1,30)).is(undefined)
        assertThat(doubleMap.get(2,2)).is(undefined)
    });
});