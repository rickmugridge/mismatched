import {assertThat} from "../assertThat";
import {match} from "../match";
import {testing} from "../testing"

const t = testing
describe("Object-matching Examples", () => {
    const actual =
        {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

    describe("assertThat():", () => {
        it('Full object match', () => {
            assertThat(actual)
                .is({name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}});
        });

        describe("Partial object match", () => {
            it('Do not care about one field', () => {
                assertThat(actual)
                    .is({
                        name: "hamcrest",
                        address: {number: 3, street: "Oak St", other: match.any()}
                    });
            });

            it('Matching optionally on several fields', () => {
                assertThat(actual)
                    .is({
                        name: match.anyOf(["hamcrest", "tsDiffMatcher"]),
                        address: {
                            number: match.number.greater(0),
                            street: "Oak St",
                            other: match.ofType.array()
                        }
                    });
            });
        });

        it("arrays with objects and arrays match", () => {
            assertThat([1, {a: 2, b: 3}, [[3, 4]]]).is([1, {a: 2, b: 3}, [[3, 4]]])
        })

        it("arrays with objects and arrays almost match", () => {
            t.fails([[[3, 4, 5]], 6, {a: 2, b: 333}], [1, {a: 2, b: 3}, [[3, 4]]],
                [
                    t.wrongOrder([[3, 4, t.unexpected(5)]]),
                    t.unexpected(6),
                    {a: 2, b: t.wasExpected(333, 3)},
                    t.expected(1)
                ], 7, 11, [
                    "test[]: out of order: [[3, 4, 5]]", // todo Needs improvement. eg include first mismatched[] as well
                    "test[1]: unexpected: 6",
                    "test[2].b: 333, expected: 3",
                    "test[]: expected: 1"
                ])
        })
    });

    describe("validateThat():", () => {
        it('Full object validation', () => {
            assertThat(actual)
                .is({
                    name: match.ofType.string(),
                    address: {
                        number: match.number.greater(0),
                        street: match.ofType.string(),
                        other: match.array.every(match.ofType.number())
                    }
                });
        });
    });
});
