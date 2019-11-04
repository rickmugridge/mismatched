import {DiffMatcher} from "./matcher/DiffMatcher";
import {AnyOfMatcher} from "./matcher/AnyOfMatcher";
import {AllOfMatcher} from "./matcher/AllOfMatcher";
import {matchMaker} from "./matcher/matchMaker";
import {fail} from "assert";
import {match} from "./match";
import {ofType} from "./ofType";
import {CompactPrettyPrinter} from "./prettyPrint/CompactPrettyPrinter";

export function assertThat<T>(actual: any) {
    return new Assertion(actual);
}

class Assertion<T> {
    constructor(private actual: any) {
    }

    is(expected: DiffMatcher<T> | any) {
        const result = this.match(expected);
        if (!result.passed()) {
            result.bad();
        }
    }

    isNot(expected: DiffMatcher<T> | any) {
        return this.is(match.not(matchMaker(expected)));
    }

    isAnyOf(expected: Array<DiffMatcher<T> | any>) {
        const result = new AnyOfMatcher(expected.map(e => matchMaker(e))).matches(this.actual);
        if (!result.passed()) {
            result.bad();
        }
    }

    isAllOf(expected: Array<DiffMatcher<T> | any>) {
        const result = new AllOfMatcher(expected.map(e => matchMaker(e))).matches(this.actual);
        if (!result.passed()) {
            result.bad();
        }
    }

    // THis is used internally for testing error messages:
    failsWith(expected: any, message: object) {
        const result = this.match(expected);
        const matchResult = assertThat(result.diff).match(message);
        if (!matchResult.passed()) {
            throw new Error(`Incorrect message: 
actual:   '${JSON.stringify(result.diff)}' 
expected: '${JSON.stringify(message)}'`);
        }
    }

    throws(expected: any) {
        if (!ofType.isFunction(this.actual)) {
            throw new Error("Need to use the form: assertThat(()=> expression).throws('error')");
        }
        const matcher = matchMaker(expected);
        let passed = false;
        try {
            const result = this.actual();
            passed = true;
        } catch (e) {
            const result = matcher.matches(e);
            if (!result.passed()) {
                result.bad();
            }
        }
        if (passed) {
            this.logExceptionFail("Expected an exception matching:", matcher);
            throw new Error("Problem");
        }
    }

    catches(expected: any): Promise<unknown> {
        if (!ofType.isFunction(this.actual)) {
            throw new Error("Need to use the form: assertThat(()=> expression).catches('error')");
        }
        const matcher = matchMaker(expected);
        const result = this.actual();
        assertThat(result).is(match.instanceOf(Promise));
        return result.then(
            () => true,
            e => {
                const result = matcher.matches(e);
                if (!result.passed()) {
                    result.bad();
                }
                return false;
            }).then(passed => {
            if (passed) {
                this.logExceptionFail("Expected a promise.catch matching:", matcher);
                return Promise.reject("Problem");
            }
            return Promise.resolve();
        });
    }

    logExceptionFail(message: string, matcher: DiffMatcher<any>) {
        console.log(message, new CompactPrettyPrinter().render(matcher.describe()));
    }

    private match(expected: DiffMatcher<T> | any) {
        const diffMatcher = matchMaker(expected);
        return diffMatcher.matches(this.actual);
    }
}

export function assertException<T>(fn: () => any) {
    return new ExceptionAssertion(fn);
}

class ExceptionAssertion<T> {
    constructor(private fn: () => any) {
    }

    catchWithMessage(expected: T) {
        let failed = false;
        let result = undefined;
        try {
            result = this.fn();
            failed = true;
        } catch (e) {
            assertThat(e.message).is(expected);
        }
        if (failed) {
            fail(`Failed to throw exception. Expecting ${expected} but got ${result}`);
        }
    }

    catch(expected: T) {
        let failed = false;
        let result = undefined;
        try {
            result = this.fn();
            failed = true;
        } catch (e) {
            assertThat(e).is(expected);
        }
        if (failed) {
            fail(`Failed to throw exception. Expecting ${expected} but got ${result}`);
        }
    }
}