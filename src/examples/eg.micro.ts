import {assertThat} from "../assertThat";
import {match} from "../match";

describe("Object-matching Examples", () => {
    const actual = {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

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
