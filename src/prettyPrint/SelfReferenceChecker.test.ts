import {SelfReferenceChecker} from "./SelfReferenceChecker";
import {assertException, assertThat} from "../assertThat";
import {match} from "../match";

describe("SelfReferenceChecker", () => {
    it("finds no self reference", () => {
        const checker = new SelfReferenceChecker();
        assertThat(checker.recurse("this", 4, () => 5)).is(5);
    });

    it("finds a direct self reference within an object", () => {
        const checker = new SelfReferenceChecker();
        const obj: any = {};
        obj.f = obj;
        assertThat(checker.recurse("this", obj, () => obj)).is(match.any());
        assertException(() =>
            checker.recurse("this", obj, () =>
                checker.recurse("this.f", obj.f, () => 4)))
            .catchWithMessage(SelfReferenceChecker.colouredMessage("this"));
    });

    it("finds an indirect self reference within an object", () => {
        const checker = new SelfReferenceChecker();
        const obj: any = {};
        obj.f = {g: obj};
        assertThat(checker.recurse("this", obj, () =>
            checker.recurse("this.f", obj.f, () => 4))).is(match.any());
        assertException(() =>
            checker.recurse("this", obj, () =>
                checker.recurse("this.f", obj.f, () =>
                    checker.recurse("this.f.g", obj.f.g, () => 4))))
            .catchWithMessage(SelfReferenceChecker.colouredMessage("this"));
    });

    it("finds a direct self reference within an array", () => {
        const checker = new SelfReferenceChecker();
        const obj: Array<any> = [];
        obj.push(obj);
        assertThat(checker.recurse("this", obj, () => obj)).is(match.any());
        assertException(() =>
            checker.recurse("this", obj, () =>
                checker.recurse("this[0]", obj[0], () => 4)))
            .catchWithMessage(SelfReferenceChecker.colouredMessage("this"));
    });

    it("finds an indirect self reference within a nested array", () => {
        const checker = new SelfReferenceChecker();
        const obj: Array<any> = [];
        obj.push([obj]);
        assertThat(checker.recurse("this", obj, () =>
            checker.recurse("this[0]", obj[0], () => 4))).is(match.any());
        assertException(() =>
            checker.recurse("this", obj, () =>
                checker.recurse("this[0]", obj[0], () =>
                    checker.recurse("this[0][0]", obj[0][0], () => 4))))
            .catchWithMessage(SelfReferenceChecker.colouredMessage("this"));
    });

    it("finds an indirect self reference within a nested array 2", () => {
        const checker = new SelfReferenceChecker();
        const obj: Array<any> = [[1]];
        obj[0].push([obj[0]]);
        assertException(() =>
            checker.recurse("this", obj, () =>
                checker.recurse("this[0]", obj[0], () =>
                    checker.recurse("this[0][1]", obj[0][1], () =>
                        checker.recurse("this[0][1][0]", obj[0][1][0], () => 4)))))
            .catchWithMessage(SelfReferenceChecker.colouredMessage("this[0]"));
    });
});