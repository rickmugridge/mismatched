import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";
import {stringDiff} from "../diff/StringDiff";
import {internalAssertThat} from "../utility/internalAssertThat"

describe("StringMatcher:", () => {
    describe("assertThat():", () => {
        it('match()', () => {
            const actual = "a"
            internalAssertThat(actual).is(actual)
        })

        it('match() regular expression', () => {
            internalAssertThat("abc").is(match.string.match(/a.c/))
            internalAssertThat("abc").isNot(match.string.match(/a.b/))
        })

        it('startsWith():', () => {
            internalAssertThat("abc").is(match.string.startsWith("ab"))
            internalAssertThat("abc").isNot(match.string.startsWith("ac"))
        })

        it('endsWith():', () => {
            internalAssertThat("abc").is(match.string.endsWith("bc"))
            internalAssertThat("abc").isNot(match.string.endsWith("ac"))
        })

        it('includes():', () => {
            internalAssertThat("abc").is(match.string.includes("a"))
            internalAssertThat("abc").is(match.string.includes("b"))
            internalAssertThat("abc").is(match.string.includes("c"))
            internalAssertThat("abc").is(match.string.includes("ab"))
            internalAssertThat("abc").is(match.string.includes("bc"))
            internalAssertThat("abc").is(match.string.includes("abc"))
        })

        it("uuid()", () => {
            internalAssertThat('b28a0a82-a721-11e9-9037-077495dd0010').is(match.uuid())
            internalAssertThat('077495dd00').isNot(match.uuid())
        })

        it("nonEmpty()", () => {
            internalAssertThat('cafe').is(match.string.nonEmpty())
            internalAssertThat('').isNot(match.string.nonEmpty())
        })

        describe("asDate()", () => {
            it("asDate() via UTC", () => {
                const date = new Date()
                internalAssertThat(date.toUTCString()).is(match.string.asDate(match.ofType.date()))
            })

            it("Via UTC does not match the same date", () => {
                const date = new Date()
                internalAssertThat(date.toUTCString()).isNot(match.string.asDate(date))
                internalAssertThat(new Date(date.toUTCString())).is(new Date(date.toUTCString()))
            })

            it("arbitrary string is not a date", () => {
                const date = new Date("2024-05-26T22:58:44.714Z")
                internalAssertThat("wrong")
                    .failsWith(match.string.asDate(date))
                    .wasExpected(match.any(), date,
                        ['mapped(actual): new Date(null), expected: new Date("2024-05-26T22:58:44.714Z")'])
            })

            it("true is not a date", () => {
                internalAssertThat(true)
                    .failsWith(match.string.asDate(match.ofType.date()))
                    .wasExpected('mapping failed: "match.string.asDate() can only take a string as argument"',
                        {
                            mapped: {description: "match.string.asDate", matcher: "ofType.date"}
                        },
                        ['mapped(actual): mapping failed: "match.string.asDate() can only take a string as argument"'])
            })

            it("4 is not a date", () => {
                internalAssertThat(4)
                    .failsWith(match.string.asDate(match.ofType.date()))
                    .wasExpected('mapping failed: "match.string.asDate() can only take a string as argument"',
                        {
                            mapped: {description: "match.string.asDate", matcher: "ofType.date"}
                        },
                        ['mapped(actual): mapping failed: "match.string.asDate() can only take a string as argument"'])
            })

            it("undefined is not a date", () => {
                const date = new Date("2024-05-26T22:58:44.714Z")
                internalAssertThat(undefined)
                    .failsWith(match.string.asDate(date))
                    .wasExpected(match.any(), match.any(),
                        ['mapped(actual): mapping failed: "match.string.asDate() can only take a string as argument"'])
            })

            it('"4" is a date!', () => {
                internalAssertThat("4")
                    .failsWith(match.ofType.date())
                    .wasExpected(match.any(), match.any(),
                        ['actual: "4", expected: "ofType.date"'])
            })
        })

        it("asSplit()", () => {
            internalAssertThat("a,b,c").is(match.string.asSplit(",", ["a", "b", "c"]))
        })

        it("asNumber()", () => {
            internalAssertThat("345").is(match.string.asNumber(345))
        })

        it("asDecimal()", () => {
            internalAssertThat("3.45").is(match.string.asDecimal(2, 3.45))
        })

        it("fromJson()", () => {
            internalAssertThat('{"m":1}').is(match.string.fromJson({m: 1}))
            const obj = {m: 1, n: {o: 2}}
            internalAssertThat(JSON.stringify(obj)).is(match.string.fromJson(obj))
        })

    })

    describe("assertThat():failsWith()", () => {
        it('not a string', () => {
            assertThat(1 as any).failsWith("a",
                {[MatchResult.was]: 1, [MatchResult.expected]: "a"})
        })

        it('mismatches', () => {
            assertThat("a").failsWith("b",
                {[MatchResult.was]: "a", [MatchResult.expected]: "b"})
            assertThat("a").failsWith(null,
                {[MatchResult.was]: "a", [MatchResult.expected]: null})
        })

        it('mismatches long strings', () => {
            const actual = "abcd-e-fghijk";
            const expected = "abcd+E+fghijk";
            assertThat(actual).failsWith(expected,
                {
                    [MatchResult.was]: actual,
                    [MatchResult.expected]: expected,
                    [MatchResult.differ]: `abcd${stringDiff.missingColour("-e-")}${stringDiff.extraColour("+E+")}fghijk`
                })
        })

        it('mismatches: errors', () => {
            assertThat("a").failsWith("b",
                {[MatchResult.was]: "a", [MatchResult.expected]: "b"})

            const mismatched: string[] = []
            const matcher = match.string.match("b");
            (matcher as DiffMatcher<any>).mismatches(new ContextOfValidationError(), mismatched, "a")
            assertThat(mismatched).is([
                'actual: "a", expected: "b"'
            ])
        })
    })

    describe("validateThat():", () => {
        const expected = match.string.startsWith("a");

        it("succeeds", () => {
            const validation = validateThat("abc").satisfies(expected)
            assertThat(validation.passed()).is(true)
        })

        it("fails string match", () => {
            const expected = "c"
            const validation = validateThat("b").satisfies(expected)
            assertThat(validation.passed()).is(false)
            assertThat(validation.errors).is([
                `actual: "b", expected: "c"`
            ])
        })

        it("fails with 'starts with'", () => {
            const validation = validateThat("b").satisfies(expected)
            assertThat(validation.passed()).is(false)
            assertThat(validation.errors).is([
                `actual: "b", expected: {"match.string.startsWith": "a"}`
            ])
        })
    })
})
