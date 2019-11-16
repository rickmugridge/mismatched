import {DiffMatcher} from "./matcher/DiffMatcher";
import {AnyOfMatcher} from "./matcher/AnyOfMatcher";
import {AllOfMatcher} from "./matcher/AllOfMatcher";
import {matchMaker} from "./matcher/matchMaker";
import {fail} from "assert";
import {match} from "./match";
import {ofType} from "./ofType";
import {PrettyPrinter} from "./prettyPrint/PrettyPrinter";
import {ErrorMatcher} from "./matcher/ErrorMatcher";

export function assertThat<T>(actual: any) {
    return new Assertion(actual);
}

const printer = PrettyPrinter.make();

class Assertion<T> {
    constructor(private actual: any) {
    }

    is(expected: DiffMatcher<T> | any) {
        const result = this.match(expected);
        if (!result.passed()) {
            result.bad(this.actual);
        }
    }

    itIs(expected: object) {
        return this.is(match.itIs(expected));
    }

    isNot(expected: DiffMatcher<T> | any) {
        return this.is(match.not(matchMaker(expected)));
    }

    isAnyOf(expected: Array<DiffMatcher<T> | any>) {
        const result = new AnyOfMatcher(expected.map(e => matchMaker(e))).matches(this.actual);
        if (!result.passed()) {
            result.bad(this.actual);
        }
    }

    isAllOf(expected: Array<DiffMatcher<T> | any>) {
        const result = new AllOfMatcher(expected.map(e => matchMaker(e))).matches(this.actual);
        if (!result.passed()) {
            result.bad(this.actual);
        }
    }

    // This is used internally for testing error messages:
    failsWith(expected: any, message: object) {
        const result = this.match(expected);
        const matchResult = assertThat(result.diff).match(message);
        if (!matchResult.passed()) {
            throw new Error(`Incorrect message: 
actual:   '${printer.render(result.diff)}' 
expected: '${printer.render(message)}'`);
        }
    }

    throws(expected: any = match.any()) {
        if (!ofType.isFunction(this.actual)) {
            throw new Error("Need to use the form: assertThat(()=> expression).throws('error')");
        }
        const matcher = matchMaker(expected);
        let passed = false;
        try {
            this.actual();
            passed = true;
        } catch (e) {
            const result = matcher.matches(e);
            if (!result.passed()) {
                result.bad(e.message);
            }
        }
        if (passed) {
            this.logExceptionFail("Expected an exception matching:", matcher);
            throw new Error("Problem in throws()");
        }
    }

    throwsError(message: string) {
        return this.throws(ErrorMatcher.make(message));
    }

    catches(expected: any = match.any()): Promise<unknown> {
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
                    result.bad(e.message);
                }
                return false;
            }).then(passed => {
            if (passed) {
                this.logExceptionFail("Expected a promise.catch matching:", matcher);
                return Promise.reject("Problem in catches()");
            }
            return Promise.resolve();
        });
    }

    catchesError(message: string) {
        return this.catches(ErrorMatcher.make(message));
    }

    logExceptionFail(message: string, matcher: DiffMatcher<any>) {
        console.log(message, PrettyPrinter.make().render(matcher.describe()));
    }

    private match(expected: DiffMatcher<T> | any) {
        const matcher = matchMaker(expected);
        return matcher.matches(this.actual);
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