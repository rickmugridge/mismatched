import {assertThat} from "../assertThat";
import {PropertyName} from "./PropertyName";

describe("PropertyName", () => {
    describe("render()", () => {
        it("is a normal identifier", () => {
            assertThat(PropertyName.render("identifier")).is("identifier");
            assertThat(PropertyName.render("$identifier")).is("$identifier");
            assertThat(PropertyName.render("_identifier")).is("_identifier");
        });

        it("is treated as a string", () => {
            assertThat(PropertyName.render("a b")).is('"a b"');
            assertThat(PropertyName.render("identifier.")).is('"identifier."');
            assertThat(PropertyName.render("ident ifier")).is('"ident ifier"');
            assertThat(PropertyName.render("4identifier")).is('"4identifier"');
            assertThat(PropertyName.render("if")).is('"if"');
            assertThat(PropertyName.render("let")).is('"let"');
            assertThat(PropertyName.render("0")).is('"0"');
        });
    });
});