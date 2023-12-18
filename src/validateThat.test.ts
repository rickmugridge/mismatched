import {assertThat} from "./assertThat";
import {match} from "./match";
import {validateThat, ValidationResult} from "./validateThat";

const passed = (result: ValidationResult) => assertThat(result.passed()).is(true)
const errors = (result: ValidationResult, errors: string[]) => assertThat(result.errors).is(errors)

describe("validateThat():", () => {
    it("Simple value:", () => {
        const actual = 3.4;
        passed(validateThat(actual).satisfies(actual))
        errors(validateThat(3.4).satisfies(3.5), ["{actual: 3.4, expected: 3.5}"]);
    });

    it("Object:", () => {
        passed(validateThat({f: 1, g: 2}).satisfies({f: 1, g: 2}))
        errors(validateThat({f: 1, g: 2}).satisfies({f: 1}), ["{actual: {f: 1, g: 2}, unexpected: {g: 2}}"]);
    });

    it("not:", () => {
        passed(validateThat(true).satisfies(match.not(false)))
        errors(validateThat(true).satisfies(match.not(true)),
            ["{actual: true, expected: {not: true}}"]);
    });

    it("anyOf():", () => {
        passed(validateThat(new Date()).satisfies(match.anyOf([3, match.instanceOf(Date)])))
        errors(validateThat(true).satisfies(match.anyOf([3, match.instanceOf(Date)])),
            ['{actual: true, expected: {anyOf: [3, {instanceOf: "Date"}]}}']);
    });

    it("allOf():", () => {
        passed(validateThat(3).satisfies(match.allOf([3, match.number.greater(2)])))
        errors(validateThat(2).satisfies(match.allOf([2, match.number.greater(2)])),
            ['{actual: 2, expected: {"number.greater": 2}}']);
    });
});