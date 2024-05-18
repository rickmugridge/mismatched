import {match} from "../match";
import {internalAssertThat} from "../utility/internalAssertThat"

describe("array.length:", () => {
    it('matches', () => {
        internalAssertThat(["b", "b"]).is(match.array.length(2))
    });

    it('does not match', () => {
        const actual = ["a", "b"]
        internalAssertThat(actual).failsWith(match.array.length(1)).wasExpected(2, {"array.length": 1},
            ['actual: ["a", "b"], expected: {"array.length": 1}'])
    })
})
