import {assertThat} from "../assertThat";
import {match} from "../match";

describe("match.obj:", () => {
    describe("obj.match", () => {
        const actual = {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

        it('Explicit', () => {
            assertThat(actual)
                .is(match.obj.match({name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}}));
            assertThat(actual)
                .is({name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}});
        });

        it('Embedded', () => {
            assertThat(actual)
                .is({
                    name: "hamcrest",
                    address: {
                        number: match.number.lessEqual(3),
                        street: "Oak St",
                        other: match.ofType.array()
                    }
                });
        });
    });

    describe("obj.has", () => {
        const actual = {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

        it('Explicit', () => {
            assertThat(actual)
                .is(match.obj.has({name: "hamcrest"}));
        });

        it('Embedded', () => {
            assertThat(actual)
                .is(match.obj.has({
                    address: {
                        street: "Oak St",
                        other: match.ofType.array()
                    }
                }));
        });
    });
});
