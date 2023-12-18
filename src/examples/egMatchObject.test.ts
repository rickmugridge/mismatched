import {assertThat} from "../assertThat";
import {match} from "../match";

describe("match.obj:", () => {
    describe("obj.match", () => {
        const actual = {name: "hamcrest", address: {number: 3, street: "Oak St", other: [1, 2]}};

        it('Explicit', () => {
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
                        number: 3,
                        street: "Oak St",
                        other: match.ofType.array()
                    }
                }));
        });

        // it("Nested with various differences", () => {
        //     assertThat({
        //         supplier_id: 54,
        //         match_id: 1,
        //         match_type: "duo",
        //         selection_state: "open",
        //         loci: {count_loci_tested: 101, failures: []},
        //         dam: {
        //             animal_id: 55,
        //             active_snp_count: 103,
        //             identifiers: [
        //                 "DNA-XAX-152", "DNA-XAX-154"
        //             ],
        //             sample_date: "2018-08-28T18:54:00Z"
        //         }
        //     }).is({
        //         supplier_id: 54,
        //         match_id: 1,
        //         match_type: "duo",
        //         selection_state: "closed",
        //         loci: {count_loci_tested: 101, failures: []},
        //         dam: {
        //             animal_id: 55,
        //             active_snp_count: match.number.lessEqual(100),
        //             identifiers: [
        //                 "DNA-XAX-152", "DNA-XAX-154"
        //             ]
        //         }
        //     });
        // });
    });
});
