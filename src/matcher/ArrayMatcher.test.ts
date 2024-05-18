import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {validateThat} from "../validateThat";
import {internalAssertThat} from "../utility/internalAssertThat"
import {unexpected} from "./Mismatched"

describe("array.match:", () => {
    describe("assertThat():", () => {
        it('matches with undefined and null', () => {
            const actual = [2, undefined, null]
            internalAssertThat(actual).is([2, undefined, null])
        })

        it('matches with an empty array', () => {
            internalAssertThat([]).is([])
        })

        describe("Primitive values only", () => {
            it('matches', () => {
                const actual = [2, 2, 2]
                internalAssertThat(actual).is([2, 2, 2])
            })

          it('Actual longer: unexpected', () => {
                internalAssertThat(["a", "b", "c", "d"])
                    .failsWith(["a", "c"])
                    .wasDiff(
                        [
                            "a",
                            unexpected("b"),
                            "c",
                            unexpected("d")
                        ], ['actual[1]: unexpected: "b"',
                            'actual[3]: unexpected: "d"'])
            })

            it('Expected longer: expected', () => {
                internalAssertThat(["c", "d"])
                    .failsWith(["a", "b", "c", "d"])
                    .wasDiff(
                        ["c", "d", expected("a"), expected("b")],
                        ['actual[]: expected: "a"',
                            'actual[]: expected: "b"']);
            })

            it('Various differences, including in order: unexpected and expected', () => {
                internalAssertThat(["b", "x", "y"])
                    .failsWith(["a", "b", "c", "x"])
                    .wasDiff(
                        [
                            "b", "x", unexpected("y"), expected("a"), expected("c")
                        ],
                        ['actual[2]: unexpected: "y"', 'actual[]: expected: "a"',
                            'actual[]: expected: "c"'])
            })
        });

        it("succeeds", () => {
            const isNumber = match.ofType.number();
            const expected = [isNumber, isNumber, [isNumber, [isNumber]]];
            internalAssertThat([1, 2, [3, [4]]]).is(expected);
        });

        it('Other differences', () => {
            internalAssertThat([{b: "b"}, ["x"], "y"])
                .failsWith([{a: "a"}, {b: "b"}, "c", ["x"]])
                .wasDiff(
                    [{b: "b"}, ["x"], {[MatchResult.unexpected]: "y"},
                        expected({a: "a"}), expected("c")],
                    ['actual[2]: unexpected: "y"', 'actual[]: expected: {a: "a"}',
                        'actual[]: expected: "c"'])
        })

        it('matches the best first (sub)', () => {
            internalAssertThat([{a: 11, b: [0]}])
                .failsWith([{a: 11, b: [1]}])
                .wasDiff(
                    [{a: 11, b: [unexpected(0), expected(1)]}],
                    ["actual[0].b[0]: unexpected: 0", "actual[0].b[]: expected: 1"]);
        })


        it('does not match: values mismatch', () => {
            internalAssertThat(["a", "b"])
                .failsWith(["a", "c"]).wasDiff(
                ["a", unexpected("b"), expected("c")],
                ['actual[1]: unexpected: "b"', 'actual[]: expected: "c"']);
        })

        it('matches literally nested', () => {
            internalAssertThat([2, 2, [3, [4]]])
                .is([2, 2, [3, [4]]])
        })

        it('does not match literally nested #1', () => {
            internalAssertThat([1, 2, [3, [5]]])
                .failsWith([2, 2, [3, [4, 6]]])
                .wasDiff(
                    [
                        unexpected(1), 2,
                        [3,
                            [unexpected(5), expected(4), expected(6)]
                        ], expected(2)
                    ],
                    [
                        "actual[0]: unexpected: 1",
                        "actual[2][1][0]: unexpected: 5",
                        "actual[2][1][]: expected: 4",
                        "actual[2][1][]: expected: 6",
                        "actual[]: expected: 2"])
        })

        it('does not match literally nested with objects #1', () => {
            internalAssertThat([1, {a: 2}, [3, [{c: 5}]]])
                .failsWith([2, {a: 2}, [3, {d: [4, 6]}]])
                .wasDiff(
                    [
                        unexpected(1), {a: 2},
                        [3, unexpected([{c: 5}]), expected({d: [4, 6]})],
                        expected(2)
                    ],
                    [
                        "actual[0]: unexpected: 1",
                        "actual[2][1]: unexpected: [{c: 5}]",
                        "actual[2][]: expected: {d: [4, 6]}",
                        "actual[]: expected: 2"])
        })

        it('does not match literally nested #2', () => {
            internalAssertThat([1, 2, [3, [5]]])
                .failsWith([1, 2, [3, [6]]])
                .wasDiff(
                    [1, 2, [
                        3, [unexpected(5), expected(6)]
                    ]],
                    [
                        "actual[2][1][0]: unexpected: 5",
                        "actual[2][1][]: expected: 6"])
        })

        it('does not match literally nested with objects #2', () => {
            internalAssertThat([1, {a: 2}, [3, [{c: 5}]]])
                .failsWith([1, [3, [6]]])
                .wasDiff(
                    [1, unexpected({a: 2}),
                        [3, [unexpected({c: 5}), expected(6)]]],
                    [
                        "actual[1]: unexpected: {a: 2}",
                        "actual[2][1][0]: unexpected: {c: 5}",
                        "actual[2][1][]: expected: 6"])
        })

        it('does not match literally nested: errors', () => {
            internalAssertThat([1, 2, [3, [5]]])
                .failsWith([2, 2, [3, [5, 6]]])
                .wasDiff(
                    [
                        unexpected(1), 2,
                        [3, [5, expected(6)]
                        ], expected(2)],
                    [
                        "actual[0]: unexpected: 1",
                        "actual[2][1][]: expected: 6",
                        "actual[]: expected: 2"])
        })

        it('does not match literally nested - wrong type', () => {
            const actual = [1, 2, [3, [5]]]
            let expect = [1, 2, [3, "a"]]
            internalAssertThat(actual)
                .failsWith(expect)
                .wasDiff(
                    [1, 2, [3, unexpected([5]), expected("a")]],
                    [
                        "actual[2][1]: unexpected: [5]",
                        'actual[2][]: expected: "a"'])
            internalAssertThat(expect)
                .failsWith(actual)
                .wasDiff(
                    [1, 2, [3, unexpected("a"), expected([5])]],
                    [
                        'actual[2][1]: unexpected: "a"',
                        "actual[2][]: expected: [5]"])
        })

        it("uses match.bind() to check for two values the same", () => {
            const value = {
                colours: [
                    {id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb", type: "Red"},
                    {id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb", type: "Red"},
                ]
            }
            const bindColour = match.bind(match.ofType.object())
            internalAssertThat(value).is({
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
