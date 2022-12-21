import {assertThat} from "./assertThat";
import {match} from "./match";
import {MatchResult} from "./MatchResult";
import {fail} from "assert";

describe("assertThat():", () => {
    it("Ensure that mismatched basically works, without using itself", () => {
        if (!match.itIs(3).matches(3).passed())
            fail("Mismatched did not match, but it should have")
        if (match.itIs(3).matches(4).passed())
            fail("Mismatched matched but should not have")
        let exceptionThrown = false
        try {
            assertThat(3).is(4)
        } catch (e) {
            exceptionThrown = true
        }
        if (!exceptionThrown)
            fail("assertThat did not pick up error")
    });

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

    describe("itIs():", () => {
        it('matches', () => {
            const actual = {f: 3.4};
            assertThat(actual).itIs(actual);
        });

        it('mismatches', () => {
            assertThat(() => assertThat({f: 3.4}).itIs({f: 3.4})).throws();
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
            assertThat(4).isAnyOf([match.isEquals(4), match.instanceOf(Date)]);
        });

        it("Mismatches", () => {
            assertThat("ab")
                .failsWith(match.anyOf([match.instanceOf(Date)]),
                    {[MatchResult.was]: "ab", [MatchResult.expected]: {instanceOf: "Date"}});
        });
    });

    describe("isAllOf():", () => {
        it("Matches", () => {
            assertThat(3).isAllOf([match.isEquals(3), match.number.greater(2)]);
        });

        it("Mismatches", () => {
            assertThat("ab")
                .failsWith(match.allOf([match.isEquals(3), match.number.greater(2)]),
                    {[MatchResult.was]: "ab", [MatchResult.expected]: {allOf: [3, {"number.greater": 2}]}});
        });
    });

    describe("throws()", () => {
        it("Matches by Error class", () => {
            assertThat(() => {
                throw new Error("error");
            }).throws(match.instanceOf(Error));
        });

        it("Matches", () => {
            assertThat(() => {
                throw new Error("error");
            }).throws(new Error("error"));
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
            } catch (e: any) {
                assertThat(e).is({message: "Problem in throws()"});
            }
            assertThat(passed).is(false);
        });

        it("Actual is not a function", () => {
            assertThat(() =>
                assertThat(4).throws("error")
            ).throws(match.instanceOf(Error));
        });
    });

    describe("throwsError()", () => {
        it("Matches all", () => {
            assertThat(() => {
                throw new Error("error");
            }).throwsError(match.string.startsWith("e"));
            const matcher = match.string.startsWith("e");
        });

        it("Matches start", () => {
            assertThat(() => {
                throw new Error("error");
            }).throwsError("error");
        });
    });

    describe("catches():", () => {
        it("Matches", () => {
            return assertThat(Promise.reject(4)).catches(4);
        });

        it("Matches Error", () => {
            return assertThat(Promise.reject(new Error('err'))).catches(new Error('err'));
        });

        it("Matches Error in an async function with await", async () => {
            return await assertThat(Promise.reject(new Error('err'))).catches(new Error('err'));
        });

        it("Mismatches", () => {
            return assertThat(Promise.resolve(4))
                .catches(4)
                .catch((e: any) => assertThat(e).is("Problem in catches()"));
        });

        it("Actual is not a function", () => {
            const assertionFn = () => assertThat(4).catches("error");
            return assertThat(assertionFn).throws(match.instanceOf(Error));
        });

        it("Return from actual function is not a Promise", () => {
            const assertionFn = () => assertThat(4).catches("error");
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

    it("catchesError()", () => {
        assertThat(Promise.reject(new Error("error")))
            .catchesError("error");
        assertThat(Promise.reject(new Error("error")))
            .catchesError(match.string.startsWith("err"));
    });
});