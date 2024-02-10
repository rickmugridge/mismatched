import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";

describe("array.match:", () => {
    describe("assertThat():", () => {
        it('matches with undefined and null', () => {
            const actual = [2, undefined, null]
            assertThat(actual).is([2, undefined, null])
        })

        it('matches with an empty array', () => {
            assertThat([]).is([])
        })

        describe("Primitive values only", () => {
            it('matches', () => {
                const actual = [2, 2, 2]
                assertThat(actual).is([2, 2, 2])
            })

            it('Actual longer: unexpected', () => {
                assertThat(["a", "b", "c", "d"]).failsWith(["a", "c"],
                    [
                        "a",
                        unexpected("b"),
                        "c",
                        unexpected("d")
                    ])
            })

            it('Expected longer: expected', () => {
                assertThat(["c", "d"])
                    .failsWith(["a", "b", "c", "d"],
                        ["c", "d", expected("a"), expected("b")]);
            })

            it('Various differences, including in order: unexpected and expected', () => {
                assertThat(["b", "x", "y"])
                    .failsWith(["a", "b", "c", "x"],
                        [
                            "b", "x", unexpected("y"), expected("a"), expected("c")
                        ])
            })

            it('does not match: length difference: errors', () => {
                const mismatched: string[] = []
                const matcher = match.array.match(["a", "b", "c"]);
                (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, ["a", "b"]);
                assertThat(mismatched).is([
                    'actual[]: expected: "c"'
                ]);
            });
        });

        it('Other differences', () => {
            assertThat([{b: "b"}, ["x"], "y"]).failsWith([{a: "a"}, {b: "b"}, "c", ["x"]],
                [{b: "b"}, ["x"], {[MatchResult.unexpected]: "y"},
                    expected({a: "a"}), expected("c")])
        })

        it('matches the best first (sub)', () => {
            assertThat([{a: 11, b: [0]}]).failsWith([{a: 11, b: [1]}],
                [{a: 11, b: [unexpected(0), expected(1)]}]);
        })


        it('does not match: values mismatch', () => {
            assertThat(["a", "b"])
                .failsWith(["a", "c"],
                    ["a", unexpected("b"), expected("c")]);
        })

        it('does not match: values mismatch: errors', () => {
            const matcher = match.array.match(["a", "c"])
            assertThat([["a", "b"]]).failsWith(matcher, [
                unexpected(["a", "b"]),
                expected("a"), expected("c")
            ])
        })

        it('matches literally nested', () => {
            assertThat([2, 2, [3, [4]]])
                .is([2, 2, [3, [4]]])
        })

        it('does not match literally nested #1', () => {
            assertThat([1, 2, [3, [5]]])
                .failsWith([2, 2, [3, [4, 6]]],
                    [
                        unexpected(1), 2,
                        [3,
                            [unexpected(5), expected(4), expected(6)]
                        ], expected(2)
                    ])
        })

        it('does not match literally nested with objects #1', () => {
            assertThat([1, {a: 2}, [3, [{c: 5}]]])
                .failsWith([2, {a: 2}, [3, {d: [4, 6]}]],
                    [
                        unexpected(1), {a: 2},
                        [3, unexpected([{c: 5}]), expected({d: [4, 6]})],
                        expected(2)
                    ])
        })

        it('does not match literally nested #2', () => {
            assertThat([1, 2, [3, [5]]])
                .failsWith([1, 2, [3, [6]]],
                    [1, 2, [
                        3, [unexpected(5), expected(6)]
                    ]])
        })

        it('does not match literally nested with objects #2', () => {
            assertThat([1, {a: 2}, [3, [{c: 5}]]])
                .failsWith([1, [3, [6]]],
                    [1, unexpected({a: 2}),
                        [3, [unexpected({c: 5}), expected(6)]]])
        })

        it('does not match literally nested: errors', () => {
            assertThat([1, 2, [3, [5]]])
                .failsWith([2, 2, [3, [5, 6]]],
                    [
                        unexpected(1), 2,
                        [3, [5, expected(6)]
                        ], expected(2)])
        })

        it('does not match literally nested - wrong type', () => {
            const actual = [1, 2, [3, [5]]]
            let expect = [1, 2, [3, "a"]]
            assertThat(actual).failsWith(expect,
                [1, 2, [3, unexpected([5]), expected("a")]])
            assertThat(expect).failsWith(actual,
                [1, 2, [3, unexpected("a"), expected([5])]])
        })

        it("uses match.bind() to check for two values the same", () => {
            const value = {
                colours: [
                    {id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb", type: "Red"},
                    {id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb", type: "Red"},
                ]
            }
            const bindColour = match.bind(match.ofType.object())
            assertThat(value).is({
                colours: [
                    bindColour,
                    bindColour
                ]
            })
        })
    })

    describe("validateThat():", () => {
        const isNumber = match.ofType.number();
        const expected = [isNumber, isNumber, [isNumber, [isNumber]]];

        it("succeeds with an empty array", () => {
            const validation = validateThat([]).satisfies([]);
            assertThat(validation.passed()).is(true);
        });

        it("succeeds", () => {
            const validation = validateThat([1, 2, [3, [4]]]).satisfies(expected);
            assertThat(validation.passed()).is(true);
        });

        it("fails as element missing", () => {
            const expected = [isNumber];
            const validation = validateThat([]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                'actual[]: expected: "ofType.number"'
            ]);
        });

        it("fails as element unexpectedly present", () => {
            const expected = [];
            const validation = validateThat([1]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                'actual[0]: unexpected: 1'
            ]);
        });

        it("fails as incorrect array, simple", () => {
            const expected = [isNumber];
            const validation = validateThat(["s"]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                'actual[0]: unexpected: "s"',
                'actual[]: expected: "ofType.number"'
            ]);
        });

        it("fails as incorrect array, less simple", () => {
            const validation = validateThat([1, 2, [3, ["s"]]]).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                'actual[2][1][0]: unexpected: "s"',
                'actual[2][1][]: expected: "ofType.number"'
            ]);
        });

        it("fails as incorrect array with nested arrays", () => {
            const validation = validateThat([undefined, 2, [3, ["s"]]]).satisfies(expected)
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                "actual[0]: unexpected: undefined",
                'actual[2][1][0]: unexpected: "s"',
                'actual[2][1][]: expected: "ofType.number"',
                'actual[]: expected: "ofType.number"'
            ]);
        });

        it("fails as not an array", () => {
            const validation = validateThat(false).satisfies(expected);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `actual: false, expected: "array expected"`
            ])
        });
    });
})


const expected = (value: any): any => {
    return {[MatchResult.expected]: value}
}
const unexpected = (value: any): any => {
    return {[MatchResult.unexpected]: value}
}