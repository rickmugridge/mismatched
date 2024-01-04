import {assertThat} from "../assertThat";
import {match} from "../match";

describe("SelectMatch", () => {
    it("works", () => {
        let matcher = match.selectMatch((actual: any) => {
            switch (actual.a) {
                case 1:
                    return match.obj.match({a: 1, b: 2})
                case 2:
                    return match.obj.match({a: 2, b: 3})
                default:
                    throw new Error("unknown")
            }
        })
        assertThat({a: 1, b: 2}).is(matcher)
        assertThat({a: 2, b: 3}).is(matcher)
        // assertThat({a: 2, b: 2}).is(matcher)
        // assertThat({a: 3, b: 2}).is(matcher)
    })

    // todo Include tests for failing cases
})