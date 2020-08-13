import {match} from "../match";
import {assertThat} from "../assertThat";
import {MatchResult} from "../MatchResult";
import {validateThat} from "../validateThat";

describe("BindMatcher:", () => {
    describe("assertThat():", () => {
        it('matches exact same value:', () => {
            const bind = match.bind()
            assertThat(2).is(bind);
            assertThat(2).is(bind);
        });

        it('fails to match on something different', () => {
            const bind = match.bind()
            assertThat(2).is(bind);
            assertThat(3).failsWith(bind,
                {[MatchResult.was]: 3, [MatchResult.expected]: {boundExpected: 2}});
        });

        it("Multiple values bound together", () => {
            const value = {
                id: '3d109f84-cbb3-4512-b26b-ace282d16183',
                relationships: [
                    {
                        id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                        parentPartyId: '3d109f84-cbb3-4512-b26b-ace282d16183',
                        childPartyId: 'd65650a0-4445-4aa9-80d9-1f1aa11ff1c6',
                        type: "Red"
                    },
                    {
                        id: "78e95615-0e08-4449-aad5-3644b37e36e1",
                        parentPartyId: '3d109f84-cbb3-4512-b26b-ace282d16183',
                        childPartyId: 'b7acb8a7-b077-4a89-abc9-7f263856726b',
                        type: "Red"
                    }
                ]
            };
            const bindRootId = match.bind()
            assertThat(value).is({
                id: bindRootId,
                relationships: [
                    {
                        id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                        parentPartyId: bindRootId,
                        childPartyId: match.any(),
                        type: "Red"
                    },
                    {
                        id: "78e95615-0e08-4449-aad5-3644b37e36e1",
                        parentPartyId: bindRootId,
                        childPartyId: match.any(),
                        type: "Red"
                    }
                ]
            })
        });
    });

    describe("validateThat():", () => {
        it("succeeds", () => {
            const bind = match.bind()
            const validation = validateThat(2).satisfies(bind);
            assertThat(validation.passed()).is(true);
        });

        it("fails", () => {
            const bind = match.bind()
            validateThat(false).satisfies(bind);
            const validation = validateThat(3).satisfies(bind);
            assertThat(validation.passed()).is(false);
            assertThat(validation.errors).is([
                `{actual: 3, expected: {boundExpected: false}}`
            ]);
        });
    });
});



