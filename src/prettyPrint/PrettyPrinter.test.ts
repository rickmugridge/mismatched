import {assertThat} from "../assertThat";
import {cleanString, PrettyPrinter} from "./PrettyPrinter";
import {Colour} from "../Colour";
import {match} from "../match";

describe("PrettyPrinter():", () => {
    let prettyPrinter: PrettyPrinter;

    beforeEach(() => {
        prettyPrinter = PrettyPrinter.make();
    });

    describe("Simple values:", () => {
        it("number", () => {
            assertThat(prettyPrinter.render(45.78)).is('45.78');
        });

        it("NaN", () => {
            assertThat(prettyPrinter.render(NaN)).is('NaN');
        });

        it("string", () => {
            assertThat(prettyPrinter.render("ab")).is('"ab"');
        });

        it("boolean", () => {
            assertThat(prettyPrinter.render(true)).is('true');
        });

        it("regExp", () => {
            assertThat(prettyPrinter.render(/a.b/)).is('/a.b/');
        });

        it("symbol", () => {
            assertThat(prettyPrinter.render(Symbol("ab"))).is('Symbol(ab)');
        });
    });

    describe("Short Array", () => {
        it("of numbers", () => {
            assertThat(prettyPrinter.render([1, 2.3])).is('[1, 2.3]');
        });
        it("of nested numbers", () => {
            assertThat('\n' + prettyPrinter.render([1, [2.3, 3.4, 4, 5, 3.456789]])).is(`
[1, [2.3, 3.4, 4, 5, 3.456789]]`);
        });
        it("of strings", () => {
            assertThat(prettyPrinter.render(["a", "bc"])).is('["a", "bc"]');
        });
    });

    describe("Long Array", () => {
        it("of numbers", () => {
            const value = [
                1000001, 1000002, 1000003, 1000004,
                1000001, 1000002, 1000003, 1000004,
                1000001, 1000002, 1000003, 1000004,
                1000001, 1000002, 1000003, {was: 1000004, expected: 100005}
            ];
            // console.log(JSON.stringify(value))
            // console.log(JSON.stringify(value, undefined, 4))
            assertThat('\n' + prettyPrinter.render(value))
                .is(`
[
  1000001, 1000002, 1000003, 1000004, 1000001, 1000002, 1000003, 1000004, 
  1000001, 1000002, 1000003, 1000004, 1000001, 1000002, 1000003, 
  {was: 1000004, expected: 100005}
]`);
        });

        it("of nested numbers", () => {
            const value =
                [
                    1000001,
                    [1, 2, 1003],
                    1000004, 1000005,
                    1000006, [10007]];
            assertThat('\n' + prettyPrinter.render(value))
                .is(`
[1000001, [1, 2, 1003], 1000004, 1000005, 1000006, [10007]]`);
        });
    });

    describe("Short Object", () => {
        it("of numbers", () => {
            assertThat(prettyPrinter.render({a: 1, b: "a"})).is('{a: 1, b: "a"}');
        });

        it("of object of numbers", () => {
            const value = {
                a: 1,
                b: {c: "a"},
                d: {d: false}
            };
            assertThat('\n' + prettyPrinter.render(value)).is(`
{a: 1, b: {c: "a"}, d: {d: false}}`);
        });
    });

    it("Mixture", () => {
        const value = {
            a: [
                1, {z: 8},
                {y: true}
            ], b: "a"
        };
        assertThat('\n' + prettyPrinter.render(value))
            .is(`
{a: [1, {z: 8}, {y: true}], b: "a"}`);
    });

    it("Real object", () => {
        const value = {
            calfId: 56,
            matches: [{
                calfId: 56,
                match_id: 1,
                match_type: "dam-only",
                selection_state: "open",
                dam: {animalId: 561},
                loci: {failures: []},
                links: [{href: "www.example.com/calf/56/match/1", rel: "self"},
                    {
                        href: "www.example.com/calf/56/match/1/confirm",
                        rel: "confirm-match"
                    }]
            }],
            links: []
        };
        it("20 characters width", () => {
            assertThat('\n' + prettyPrinter.render(value))
                .is(`
{
  calfId: 56, 
  matches: [
    {
      calfId: 56, match_id: 1, match_type: "dam-only", selection_state: "open", 
      dam: {animalId: 561}, loci: {failures: []}, 
      links: [
        {
          href: "www.example.com/calf/56/match/1", 
          rel: "self"
        }, 
        {
          href: "www.example.com/calf/56/match/1/confirm", 
          rel: "confirm-match"
        }
      ]
    }
  ], links: []
}`);
        });

        it("80 characters width with complexity of 50", () => {
            prettyPrinter = PrettyPrinter.make(80, 50);
            assertThat('\n' + prettyPrinter.render(value))
                .is(`
{
  calfId: 56, 
  matches: [
    {
      calfId: 56, match_id: 1, match_type: "dam-only", selection_state: "open", 
      dam: {animalId: 561}, loci: {failures: []}, 
      links: [
        {
          href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1", 
          rel: "self"
        }, 
        {
          href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1/confirm", 
          rel: "confirm-match"
        }
      ]
    }
  ], links: []
}`);
        });

        it("80 characters width with default complexity of 10", () => {
            prettyPrinter = PrettyPrinter.make(80, 10);
            assertThat('\n' + prettyPrinter.render(value))
                .is(`
{
  calfId: 56, 
  matches: [
    {
      calfId: 56, match_id: 1, match_type: "dam-only", selection_state: "open", 
      dam: {animalId: 561}, loci: {failures: []}, 
      links: [
        {
          href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1", 
          rel: "self"
        }, 
        {
          href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1/confirm", 
          rel: "confirm-match"
        }
      ]
    }
  ], links: []
}`);
        });

        it("80 characters width with maxComplexity of 5", () => {
            prettyPrinter = PrettyPrinter.make(80, 5);
            assertThat('\n' + prettyPrinter.render(value))
                .is(`
{
  calfId: 56, 
  matches: [
    {
      calfId: 56, match_id: 1, match_type: "dam-only", selection_state: "open", 
      dam: {animalId: 561}, 
      loci: {failures: []}, 
      links: [
        {
          href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1", 
          rel: "self"
        }, 
        {
          href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1/confirm", 
          rel: "confirm-match"
        }
      ]
    }
  ], links: []
}`);
        });

        it("80 characters width with maxComplexity of 1", () => {
            prettyPrinter = PrettyPrinter.make(80, 1);
            assertThat('\n' + prettyPrinter.render(value))
                .is(`
{
  calfId: 56, 
  matches: [
    {
      calfId: 56, 
      match_id: 1, 
      match_type: "dam-only", 
      selection_state: "open", 
      dam: {
        animalId: 561
      }, 
      loci: {
        failures: [
        ]
      }, 
      links: [
        {
          href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1", 
          rel: "self"
        }, 
        {
          href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1/confirm", 
          rel: "confirm-match"
        }
      ]
    }
  ], 
  links: [
  ]
}`);
        });
    });

    it("Self-referential twice", () => {
        const g: any = {a: {c: 2}};
        g.b = g;
        g.a.b = g.a;
        assertThat(prettyPrinter.render(g))
            .is("{\n  a: {c: 2, b: " +
                Colour.bg_magenta("self-reference: this.a") + "}, \n  b: " +
                Colour.bg_magenta("self-reference: this.") + "\n}");
    });

    it("Date", () => {
        prettyPrinter = PrettyPrinter.make();
        assertThat(prettyPrinter.render({d: new Date(1566509915958), e: 3}))
            .is("{d: new Date(\"2019-08-22T21:38:35.958Z\"), e: 3}")
    });

    it("Set", () => {
        prettyPrinter = PrettyPrinter.make();
        assertThat(prettyPrinter.render(new Set([1, 2, 3])))
            .is("new Set([1, 2, 3])")
    });

    it("Map", () => {
        prettyPrinter = PrettyPrinter.make();
        assertThat(prettyPrinter.render(new Map([[1, 10], [2, 20], [3, 30]])))
            .is("new Map([[1, 10], [2, 20], [3, 30]])")
    });

    describe("function", () => {
        it("arrow", () => {
            prettyPrinter = PrettyPrinter.make();
            assertThat(prettyPrinter.render((a, b) => a + b))
                .is('{arrow: "(a, b)"}')
        });
        it("function", () => {
            function someFunction(a: number, b) {
                return a + b;
            }

            prettyPrinter = PrettyPrinter.make();
            assertThat(prettyPrinter.render(someFunction))
                .is('{"function": "someFunction(a, b)"}')
        });
    });

    it("has a custom pretty printer", () => {
        class Hide {
            constructor(public f: number, public g: number, public h: number) {
            }
        }

        PrettyPrinter.addCustomPrettyPrinter(match.instanceOf(Hide),
            (hide: Hide) => 'Hide(' + hide.f + ')');
        assertThat(prettyPrinter.render({d: new Hide(12, 1566509915958, 1566509915958), e: 3}))
            .is("{d: Hide(12), e: 3}");
        assertThat(prettyPrinter.render({outer: {outer: {d: new Hide(12, 1566509915958, 1566509915958), e: 3}}}))
            .is("{outer: {outer: {d: Hide(12), e: 3}}}");
    });

    it("Handles symbol-based properties", () => {
        const sym = Symbol("sym");
        assertThat(prettyPrinter.render({a: 1, [sym]: 3})).is("{a: 1, Symbol(sym): 3}");
    });

    it("Handles strings needing quotes as key", () => {
        assertThat(prettyPrinter.render({"a b": 4})).is(`{"a b": 4}`);
    });

    it("Handles array index as key", () => {
        assertThat(prettyPrinter.render({[0]: 4})).is(`{"0": 4}`);
    });

    it("Handles inheritance", () => {
        class A {
            a = 1;
        }

        class B extends A {
            b = 2;
        }

        assertThat(prettyPrinter.render(new B())).is("{a: 1, b: 2}");
    });

    it("Uses mock name", () => {
        const sym = Symbol("test");
        prettyPrinter = PrettyPrinter.make(80, 10, 100, sym);
        const obj = new Function();
        obj[sym] = () => "MOCK";
        assertThat(prettyPrinter.render(obj)).is(`{mock: "MOCK"}`);
        assertThat(prettyPrinter.render({obj})).is(`{obj: {mock: "MOCK"}}`);
    });

    describe("Handles pseudoCall", () => {
        it("Undefined args", () => {
            const obj = {
                [PrettyPrinter.symbolForPseudoCall]: "tar.prop"
            };
            assertThat(prettyPrinter.render(obj)).is("tar.prop");
        });

        it("No args", () => {
            const obj = {
                [PrettyPrinter.symbolForPseudoCall]: "tar.get",
                args: []
            };
            assertThat(prettyPrinter.render(obj)).is("tar.get()");
        });

        it("With args", () => {
            const obj = {
                [PrettyPrinter.symbolForPseudoCall]: "fn",
                args: [1, true, "a", [123, 456, 789], {a: 33, b: 44}]
            };
            assertThat(prettyPrinter.render(obj))
                .is(`fn(1, true, "a", [123, 456, 789], {a: 33, b: 44})`);
        });
    });

    describe("cleanString():", () => {
        it("No quotes", () => {
            assertThat(cleanString(`a`)).is(`"a"`);
        });

        it("Double-quotes", () => {
            assertThat(cleanString(`"a"`)).is(`'"a"'`);
        });

        it("Single-quotes", () => {
            assertThat(cleanString(`"a"`)).is(`'"a"'`);
        });

        it("Back-quotes", () => {
            assertThat(cleanString('`a`')).is('"`a`"');
        });

        it("Escaped double-quotes", () => {
            assertThat(cleanString(`\"a"`)).is(`'"a"'`);
        });

        it("Single- and double-quotes", () => {
            assertThat(cleanString(`'"a"'`)).is("`'\"a\"'`");
        });

        it("Single-, back- and double-quotes", () => {
            assertThat(cleanString("\"`'a'`\"")).is("\"\\\"`'a'`\\\"\"");
        });
    });


    describe("MaxTilesCount:", () => {
        it("Tiles count equal to max", () => {
            prettyPrinter = PrettyPrinter.make(80, 10, 1);
            assertThat(prettyPrinter.render("string")).is(`"string"`);
        });
        it("Tiles count greater than max", () => {
            prettyPrinter = PrettyPrinter.make(80, 10, 1);
            assertThat(prettyPrinter.render([1, 2, [1, 2]])).is("[... ********* this array has been truncated *********]");
        });
        it("Tiles count greater than max, one actual element shown", () => {
            prettyPrinter = PrettyPrinter.make(80, 10, 4);
            assertThat(prettyPrinter.render([1, 2, [1, 2]])).is("[1, 2, [... ********* this array has been truncated *********]]");
        });
        it("Tiles count greater than max, deeply nested", () => {
            prettyPrinter = PrettyPrinter.make(80, 10, 7);
            assertThat(prettyPrinter.render([1, 2, [1, 2, {
                named: "thing",
                array: ["1", 2, [3, 4, 5]]
            }], [7, 6, 5, 4, 3]])).is(`[
  1, 2, [1, 2, {note: ... ********* this object has been truncated *********}], 
  [... ********* this array has been truncated *********]
]`);
        });
    });
});
