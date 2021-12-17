import {match} from "../match";
import {assertThat} from "../assertThat";
import {MatchResult} from "../MatchResult";
import {validateThat} from "../validateThat";
import {randomUUID} from "crypto";

describe("BindMatcher:", () => {
    describe("assertThat():", () => {
        describe("No nested matcher:", () => {
            it('matches exact same value:', () => {
                const bind = match.bind()
                assertThat(2).is(bind);
                assertThat(2).is(bind);
            });

            it('fails to match on something different', () => {
                const bind = match.bind()
                assertThat(2).is(bind);
                assertThat(3).failsWith(bind,
                    {[MatchResult.was]: 3, [MatchResult.expected]: 2});
            });

            it("Multiple values in same object are bound together", () => {
                const parentPartyId = '3d109f84-cbb3-4512-b26b-ace282d16183'
                const value = {
                    id: '3d109f84-cbb3-4512-b26b-ace282d16183',
                    relationships: [
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            parentPartyId,
                            childPartyId: 'd65650a0-4445-4aa9-80d9-1f1aa11ff1c6',
                            type: "Red"
                        },
                        {
                            id: "78e95615-0e08-4449-aad5-3644b37e36e1",
                            parentPartyId,
                            childPartyId: 'b7acb8a7-b077-4a89-abc9-7f263856726b',
                            type: "Red"
                        }
                    ]
                };
                const bindParentPartyId = match.bind(match.uuid())
                assertThat(value).is({
                    id: bindParentPartyId,
                    relationships: [
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            parentPartyId: bindParentPartyId,
                            childPartyId: match.any(),
                            type: "Red"
                        },
                        {
                            id: "78e95615-0e08-4449-aad5-3644b37e36e1",
                            parentPartyId: bindParentPartyId,
                            childPartyId: match.any(),
                            type: "Red"
                        }
                    ]
                })
            });

            it("First bind builds a matcher", () => {
                const value = {
                    colours: [
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: "Red"
                        },
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: "Red"
                        },
                    ]
                };
                const bindColour = match.bind()
                assertThat(value).is({
                    colours: [
                        bindColour,
                        bindColour
                    ]
                })
            });

            it("First bind builds a matcher that fails on matching", () => {
                const value = {
                    colours: [
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: "Red"
                        },
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: "Green"
                        },
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: "Red"
                        },
                    ]
                };
                const bindColour = match.bind()
                assertThat(value).failsWith({
                    colours: [
                        bindColour,
                        bindColour,
                        bindColour
                    ]
                }, {
                    colours: [
                        {id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb", type: "Red"},
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: {[MatchResult.was]: "Green", [MatchResult.expected]: "Red"}
                        },
                        {id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb", type: "Red"}
                    ]
                })
            });
        });

        describe("Nested matcher:", () => {
            it('Nested matcher fails', () => {
                const bind = match.bind(match.ofType.string())
                assertThat(2).failsWith(bind,
                    {[MatchResult.was]: 2, [MatchResult.expected]: "ofType.string"});
            });

            it('matches exact same value:', () => {
                const bind = match.bind(match.ofType.number())
                assertThat(2).is(bind);
                assertThat(2).is(bind);
            });

            it('fails to match on something different', () => {
                const bind = match.bind(match.ofType.number())
                assertThat(2).is(bind);
                assertThat(3).failsWith(bind,
                    {[MatchResult.was]: 3, [MatchResult.expected]: 2});
            });

            it("Multiple values in same object are bound together", () => {
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
                const bindRootId = match.bind(match.ofType.string())
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

            it("First bind builds a matcher", () => {
                const value = {
                    colours: [
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: "Red"
                        },
                        {
                            id: "615fa1d3-2c79-4f46-a06a-0d04cdc9c0eb",
                            type: "Red"
                        },
                    ]
                };
                const bindColour = match.bind(match.ofType.object())
                assertThat(value).is({
                    colours: [
                        bindColour,
                        bindColour
                    ]
                })
            });
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
                `{actual: 3, expected: false}`
            ]);
        });
    });
});



