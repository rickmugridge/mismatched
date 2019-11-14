import {assertThat} from "../../assertThat";
import {SimpleTile} from "./SimpleTile";

describe("SimpleTile", () => {
    it("Short string", () => {
        const s = "hello";
        assertThat(new SimpleTile(s)).is({s, stringLength: 5, complexity: 1});
    });
    it("Long string", () => {
        const s = "hellohellohellohellohello";
        assertThat(new SimpleTile(s)).is({s, stringLength: 25, complexity: 2});
    });
    it("Very long string", () => {
        const s = "hellohellohellohellohellohellohellohellohellohello";
        assertThat(new SimpleTile(s)).is({s, stringLength: 50, complexity: 3});
    });
    it("Number", () => {
        const s = 44;
        assertThat(new SimpleTile(s)).is({s: "44", stringLength: 2, complexity: 1});
    });
    it("Regexp", () => {
        const s = /44/;
        assertThat(new SimpleTile(s)).is({s: "/44/", stringLength: 4, complexity: 1});
    });
    it("Boolean", () => {
        const s = true;
        assertThat(new SimpleTile(s)).is({s: "true", stringLength: 4, complexity: 1});
    });
});