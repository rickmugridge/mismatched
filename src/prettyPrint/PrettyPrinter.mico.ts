import {assertThat} from "../assertThat";
import {PrettyPrinter} from "./PrettyPrinter";
import {Colour} from "../Colour";

describe("PrettyPrinter():", () => {
    let prettyPrinter: PrettyPrinter;

    beforeEach(() => {
        prettyPrinter = new PrettyPrinter([], 20);
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
    });

    describe("Short Array", () => {
        it("of numbers", () => {
            assertThat(prettyPrinter.render([1, 2.3])).is('[1, 2.3]');
        });
        it("of nested numbers", () => {
            assertThat('\n' + prettyPrinter.render([1, [2.3, 3.4, 4, 5, 3.456789]])).is(`
[
  1, 
  [
    2.3, 3.4, 4, 5, 
    3.456789
  ]
]`);
        });
        it("of strings", () => {
            assertThat(prettyPrinter.render(["a", "bc"])).is('["a", "bc"]');
        });
    });

    describe("Long Array", () => {
        it("of numbers", () => {
            const value = [1000001, 1000002,
                1000003, 1000004, 1000005, 1000006, 1000007];
            assertThat('\n' + prettyPrinter.render(value))
                .is(`
[
  1000001, 1000002, 
  1000003, 1000004, 
  1000005, 1000006, 
  1000007
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
[
  1000001, 
  [1, 2, 1003], 
  1000004, 1000005, 
  1000006, [10007]
]`);
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
{
  a: 1, b: {c: "a"}, 
  d: {d: false}
}`);
        });
    });

    it("Mixture", () => {
        const value =
            {
                a: [
                    1, {z: 8},
                    {y: true}
                ], b: "a"
            };
        assertThat('\n' + prettyPrinter.render(value))
            .is(`
{
  a: [
    1, {z: 8}, 
    {y: true}
  ], b: "a"
}`);
    });

    describe("Real object", () => {
        const value = {
            calfId: 56,
            matches: [{
                calfId: 56,
                match_id: 1,
                match_type: "dam-only",
                selection_state: "open",
                dam: {animalId: 561},
                loci: {failures: []},
                links: [{href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1", rel: "self"},
                    {
                        href: "www.example.com/animal-genome/parentage-matching/5/calf/56/match/1/confirm",
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
  ], links: []
}`);
        });
        it("80 characters width with complexity of 50", () => {


            prettyPrinter = new PrettyPrinter([], 80, 50);
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

        it("80 characters width with default complexity of 20", () => {


            prettyPrinter = new PrettyPrinter([], 80, 10);
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


            prettyPrinter = new PrettyPrinter([], 80, 5);
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


            prettyPrinter = new PrettyPrinter([], 80, 1);
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
            .is("{\n  a: {\n    c: 2, \n    b: " +
                Colour.bg_magenta("self-reference: this.a") + "\n  }, \n  b: " +
                Colour.bg_magenta("self-reference: this.") + "\n}");
    });

    it("Date", () => {
        prettyPrinter = new PrettyPrinter([]);
        assertThat(prettyPrinter.render({d: new Date(1566509915958), e: 3}))
            .is("{d: Date(\"2019-08-22T21:38:35.958Z\"), e: 3}")
    });

    it("has a custom pretty printer", () => {
        class Hide {
            constructor(public f: number, public g: number, public h: number) {
            }
        }

        const customPrinters = [{
            theClass: Hide,
            toString: (hide: Hide) => 'Hide(' + hide.f + ')'
        }];
        prettyPrinter = new PrettyPrinter(customPrinters, 20);
        assertThat(prettyPrinter.render({d: new Hide(12, 1566509915958, 1566509915958), e: 3}))
            .is("{d: Hide(12), e: 3}");
    });

    it("Ignores symbol-based properties", () => {
        const sym = Symbol("sym");
        assertThat(prettyPrinter.render({a: 1, [sym]: 3})).is("{a: 1}");
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
        prettyPrinter = new PrettyPrinter([], 80, 10, sym);
        const obj: any = {};
        obj[sym] = "MOCK";
        assertThat(prettyPrinter.render(obj)).is(`"MOCK"`);
        assertThat(prettyPrinter.render({obj})).is(`{obj: "MOCK"}`);
    });

});
