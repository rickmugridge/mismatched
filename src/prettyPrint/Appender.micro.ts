import {Appender} from "./Appender";
import {assertThat} from "../assertThat";

describe("Appender()", () => {
    const lineWidth = 20;
    let appender: Appender;

    beforeEach(() => {
        appender = new Appender(lineWidth)
    });

    it("initially", () => {
        assertThat(appender.compose()).is("");
        assertThat(appender.remaininglineWidth).is(lineWidth);
        assertThat(appender.currentLineComplexity).is(0);
    });

    it("one line", () => {
        let text = "Hello";
        appender.add(text, 1);
        assertThat(appender.remaininglineWidth).is(lineWidth - text.length);
        assertThat(appender.currentLineComplexity).is(1);
        assertThat(appender.compose()).is(text);
    });

    it("2 parts", () => {
        appender.add("Hello", 1);
        appender.add(" ");
        assertThat(appender.remaininglineWidth).is(lineWidth - "Hello ".length);
        appender.add("World", 1);
        assertThat(appender.remaininglineWidth).is(lineWidth - "Hello World".length);
        assertThat(appender.currentLineComplexity).is(2);
        assertThat(appender.compose()).is("Hello World");
    });

    it("2 parts at once", () => {
        appender.adds(["Hello", " ", "World"], 3);
        assertThat(appender.remaininglineWidth).is(lineWidth - "Hello World".length);
        assertThat(appender.currentLineComplexity).is(3);
        assertThat(appender.compose()).is("Hello World");
    });

    it("2 lines", () => {
        appender.addsNewLine(["Hello"], 1);
        appender.add("World", 1);
        assertThat(appender.currentLineComplexity).is(1);
        assertThat(appender.compose()).is("Hello\nWorld");
    });

    it("2 lines with tabs", () => {
        appender.tabRight();
        assertThat(appender.remaininglineWidth).is(lineWidth - 2);
        appender.addsNewLine(["Hello"]);
        assertThat(appender.remaininglineWidth).is(lineWidth - 2);
        appender.add("World");
        assertThat(appender.remaininglineWidth).is(lineWidth - "  World".length);
        assertThat(appender.compose()).is("  Hello\n  World");
    });

    it("2 lines with tab in and then out", () => {
        appender.tabRight();
        appender.addsNewLine(["Hello"]);
        appender.tabLeft();
        assertThat(appender.remaininglineWidth).is(lineWidth);
        appender.add("World");
        assertThat(appender.compose()).is("  Hello\nWorld");
    });
});