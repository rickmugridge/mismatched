import {match} from "../match";
import {internalAssertThat} from "../utility/internalAssertThat"

describe("MappedMatcher()", () => {
    const matcher = match.mapped((a: { m: number }) => a.m, 2, {extract: "m"});

    it("matches", () => {
        internalAssertThat({m: 2}).is(matcher);
    });

    it("mismatches", () => {
        internalAssertThat({m: 3})
            .failsWith(matcher)
            .wasExpected(3, 2, ["mapped(actual): 3, expected: 2"])
    });

    it("mismatches due to thrown exception in map()", () => {
        const matcher = match.mapped(() => {
            throw new Error('err')
        }, 2, {extract: "m"});

        internalAssertThat({m: 3})
            .failsWith(matcher)
            .wasExpected('mapping failed: "err"', {
                mapped: {
                    description: {extract: "m"},
                    matcher: 2
                }
            }, ['mapped(actual): mapping failed: "err"'])
    });

    it("Handles a string mapped", () => {
        const actual = {
            detail: JSON.stringify({f: [0]})
        }
        internalAssertThat(actual).is({detail: match.mapped(JSON.parse, {f: [0]}, 'json')})
    });
});