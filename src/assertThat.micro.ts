import {assertThat} from "./assertThat";
import {match} from "./match";
import {MatchResult} from "./MatchResult";
import {fail} from "assert";

describe("assertThat():", () => {
    describe("is():", () => {
        it('matches', () => {
            const actual = 3.4;
            assertThat(actual).is(actual);
        });

        it('mismatches', () => {
            assertThat(3.4).failsWith(3.5,
                {[MatchResult.was]: 3.4, [MatchResult.expected]: 3.5});
        });
    });

    describe("isIt():", () => {
        it('matches', () => {
            const actual = {f: 3.4};
            assertThat(actual).isIt(actual);
        });

        it('mismatches', () => {
            assertThat(() => assertThat({f: 3.4}).isIt({f: 3.4})).throws();
        });
    });

    describe("isNot():", () => {
        it("matches", () => {
            assertThat(2).isNot(4);
        });

        it("mismatches", () => {
            assertThat(2).failsWith(match.not(2),
                {[MatchResult.was]: 2, [MatchResult.expected]: {not: 2}});
        });
    });

    describe("isAnyOf():", () => {
        it("Matches", () => {
            assertThat(new Date()).isAnyOf([match.isEquals(3), match.instanceOf(Date)]);
        });

        it("Mismatches", () => {
            assertThat("ab")
                .failsWith(match.anyOf([match.instanceOf(Date)]),
                    {[MatchResult.was]: "ab", [MatchResult.expected]: {anyOf: [{instanceOf: "Date"}]}});
        });
    });

    describe("isAnyOf():", () => {
        it("Matches", () => {
            assertThat(new Date()).isAnyOf([match.isEquals(3), match.instanceOf(Date)]);
        });

        it("Mismatches", () => {
            assertThat("ab")
                .failsWith(match.anyOf([match.instanceOf(Date)]),
                    {[MatchResult.was]: "ab", [MatchResult.expected]: {anyOf: [{instanceOf: "Date"}]}});
        });
    });

    describe("throws()", () => {
        it("Matches", () => {
            assertThat(() => {
                throw new Error("error");
            }).throws(match.instanceOf(Error));
        });

        it("Matches with no expectation", () => {
            assertThat(() => {
                throw new Error("error");
            }).throws();
        });

        it("Mismatches", () => {
            let passed = false;
            try {
                assertThat(() => 3).throws(match.instanceOf(Error));
                passed = true;
            } catch (e) {
                assertThat(e).is({message: "Problem"});
            }
            assertThat(passed).is(false);
        });

        it("Actual is not a function", () => {
            assertThat(() =>
                assertThat(4).throws("error")
            ).throws(match.instanceOf(Error));
        });
    });

    describe("catches():", () => {
        it("Matches", () => {
            const fn = () => Promise.reject(4);
            return assertThat(fn).catches(4);
        });

        it("Mismatches", () => {
            const fn = () => Promise.resolve(4);
            return assertThat(fn)
                .catches(4)
                .catch(e => assertThat(e).is("Problem"));
        });

        it("Actual is not a function", () => {
            const assertonFn = () => assertThat(4).catches("error");
            return assertThat(assertonFn).throws(match.instanceOf(Error));
        });

        it("Return from actual function is not a Promise", () => {
            const assertionFn = () => assertThat(() => 4).catches("error");
            return assertThat(assertionFn).throws(match.instanceOf(Error));
        });

        it("Alternative", () => {
            return Promise
                .reject(4)
                .then(
                    () => fail("Unexpected"),
                    e => assertThat(e).is(4));
        });
    });
});