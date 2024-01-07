import {assertThat} from "./assertThat"

describe("matchBestOf", () => {
    it("generator", () => {
        function* gen(): Generator<[number, number]> {
            yield [1, 2]
            yield [3, 4]
        }

        const generator = gen()
        assertThat(generator.next()).is({value: [1, 2], done: false})
        assertThat(generator.next()).is({value: [3, 4], done: false})
        assertThat(generator.next()).is({value: undefined, done: true})
    })
})