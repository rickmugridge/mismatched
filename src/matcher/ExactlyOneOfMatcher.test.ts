import {assertThat} from "../assertThat"
import {match} from "../match"
import {wasExpected} from "./Mismatched"
import {MatchResult} from "../MatchResult"
import {validateThat} from "../validateThat"

describe("ExactlyOneOfMatcher", () => {
    it("succeeds with one", () => {
        const actual = {a: {b: 3}}
        const matcher = match.exactlyOneOf([actual])
        assertThat(actual).is(matcher)
        assertThat(validateThat(actual).is(matcher).passed()).is(true)
    })

    it("fails with one, as extra field expected", () => {
        const actual = {a: {b: 3}}
        const matcher = match.exactlyOneOf([{a: {b: 3, c: 4}}])
        assertThat(actual).failsWith(matcher,
            {
                a: {b: 3, c: wasExpected(undefined, 4)}
            })
        assertThat(validateThat(actual).is(matcher).errors)
            .is(['actual.a.c: undefined, expected: 4'])
    })

    it("fails with one, as field missing", () => {
        const actual = {a: {b: 3, c: 4}}
        const matcher = match.exactlyOneOf([{a: {b: 3}}])
        assertThat(actual).failsWith(matcher,
            {
                a: {b: 3, [MatchResult.unexpected]: {c: 4}}
            })
    })

    it("succeeds with three possibilities", () => {
        const actual = {a: {b: 3}}
        const matcher = match.exactlyOneOf([
            {a: {b: 3}},
            {b: {b: 3}},
            {c: {b: 3}},
        ])
        assertThat(actual).is(matcher)
        assertThat(validateThat(actual).is(matcher).passed()).is(true)
    })

    it("Fails with three possibilities, one better than the others", () => {
        const actual = {a: {b: 4}}
        const matcher = match.exactlyOneOf([
            {a: {b: 3}},
            {b: {b: 3, c: 4}},
            {c: {b: 3, c: 4}},
        ])
        assertThat(actual).failsWith(matcher,
            {a: {b: wasExpected(4, 3)}})
        assertThat(validateThat(actual).is(matcher).errors)
            .is(['actual.a.b: 4, expected: 3'])
    })
})