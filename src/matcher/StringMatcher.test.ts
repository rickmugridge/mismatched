import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";
import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {validateThat} from "../validateThat";
import {stringDiff} from "../diff/StringDiff";

describe("StringMatcher:", () => {
    describe("assertThat():", () => {
        it('match()', () => {
            const actual = "a"
            assertThat(actual).is(match.string.match(actual))
            assertThat(actual).is(actual)
        })

        it('match() regular expression', () => {
            assertThat("abc").is(match.string.match(/a.c/))
        })

        it('startsWith():', () => {
            assertThat("abc").is(match.string.startsWith("ab"))
        })

        it('endsWith():', () => {
            assertThat("abc").is(match.string.endsWith("bc"))
        })

        it('includes():', () => {
            assertThat("abc").is(match.string.includes("a"))
            assertThat("abc").is(match.string.includes("b"))
            assertThat("abc").is(match.string.includes("c"))
            assertThat("abc").is(match.string.includes("ab"))
            assertThat("abc").is(match.string.includes("bc"))
            assertThat("abc").is(match.string.includes("abc"))
        })

        it("uuid()", () => {
            assertThat('b28a0a82-a721-11e9-9037-077495dd0010').is(match.uuid())
            assertThat('077495dd00').isNot(match.uuid())
        })

        it("nonEmpty()", () => {
            assertThat('cafe').is(match.string.nonEmpty())
            assertThat('').isNot(match.string.nonEmpty())
        })

        it("asDate() via UTC does not match", () => {
            const date = new Date()
            assertThat(date.toUTCString()).isNot(match.string.asDate(date))
            assertThat(new Date(date.toUTCString())).is(new Date(date.toUTCString()))
        })

        it("asSplit()", () => {
            assertThat("a,b,c").is(match.string.asSplit(",", ["a", "b", "c"]))
        })

        it("asNumber()", () => {
            assertThat("345").is(match.string.asNumber(345))
        })

        it("asDecimal()", () => {
            assertThat("3.45").is(match.string.asDecimal(2, 3.45))
        })

        it("fromJson()", () => {
            assertThat('{"m":1}').is(match.string.fromJson({m: 1}))
            const obj = {m: 1, n: {o: 2}}
            assertThat(JSON.stringify(obj)).is(match.string.fromJson(obj))
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
