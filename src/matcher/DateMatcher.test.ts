import {assertThat} from "../assertThat";
import {match} from "../match";
import {MatchResult} from "../MatchResult";

describe("DateMatcher:", () => {
    const date = new Date(Date.now())
    const later = new Date(Date.now() + 100000)

    it('Date is weird: has no keys, etc. Error is also weird but does have ownPropertyNames', () => {
        assertThat(Object.keys(new Date())).is([])
        assertThat(Object.getOwnPropertyNames(new Date())).is([])

        assertThat(Object.keys(new Error("err"))).is([])
        assertThat(Object.getOwnPropertyNames(new Error("err"))).is(["stack", "message"])
    })

    describe("match", () => {
        it('matches', () => {
            assertThat(date).is(date)
            assertThat(later).is(later)
        })

        it('Fails to match', () => {
            assertThat(date).isNot(later)
            assertThat(later).isNot(date)
        })

        it('failsWith', () => {
            assertThat(date).failsWith(later,
                {[MatchResult.was]: date, [MatchResult.expected]: later})
        })
    })

    describe("before", () => {
        it('matches', () => {
            assertThat(date).is(match.date.before(later))
            assertThat(later).isNot(match.date.before(date))
            assertThat(date).isNot(match.date.before(date))
        })

        it('failsWith', () => {
            assertThat(later).failsWith(match.date.before(date),
                {[MatchResult.was]: later, [MatchResult.expected]: {"date.before": date}})
        })
    })

    describe("after", () => {
        it('matches', () => {
            assertThat(date).isNot(match.date.after(later))
            assertThat(later).is(match.date.after(date))
            assertThat(date).isNot(match.date.after(date))

        })

        it('failsWith', () => {
            assertThat(date).failsWith(match.date.after(later),
                {[MatchResult.was]: date, [MatchResult.expected]: {"date.after": later}})
        })
    })
})
