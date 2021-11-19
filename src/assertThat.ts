import {DiffMatcher} from "./matcher/DiffMatcher";
import {AnyOfMatcher} from "./matcher/AnyOfMatcher";
import {AllOfMatcher} from "./matcher/AllOfMatcher";
import {matchMaker} from "./matchMaker/matchMaker";
import {fail} from "assert";
import {match} from "./match";
import {ofType} from "./ofType";
import {exceptionMessage, PrettyPrinter} from "./prettyPrint/PrettyPrinter";
import {ErrorMatcher} from "./matcher/ErrorMatcher";
import {MatchResult} from "./MatchResult";
import {Mismatched} from "./matcher/Mismatched";

export function assertThat<T>(actual: T) {
    return new Assertion<T>(actual);
}

const printer = PrettyPrinter.make();

class Assertion<T> {
    private message = "Mismatched";

    constructor(private actual: any) {
    }

    withMessage(failMessage: string): this {
        this.message = failMessage;
        return this;
    }

    is(expected: T) {
        this.checkForFunction();
        const result = this.match(expected);
        if (!result.passed()) {
            result.bad(this.actual, this.message);
        }
    }

    itIs(expected: T) {
        this.checkForFunction();
        return this.is(match.itIs(expected));
    }

    isNot<T=any>(expected: T) {
        this.checkForFunction();
        return this.is(match.not(matchMaker(expected)));
    }

    isAnyOf(expected: Array<DiffMatcher<T> | any>) {
        this.checkForFunction();
        const result = AnyOfMatcher.make(expected).matches(this.actual);
        if (!result.passed()) {
            result.bad(this.actual, this.message);
        }
    }

    isAllOf(expected: Array<DiffMatcher<T> | any>) {
        this.checkForFunction();
        const result = AllOfMatcher.make(expected).matches(this.actual);
        if (!result.passed()) {
            result.bad(this.actual, this.message);
        }
    }

    // This is used internally for testing error messages:
    failsWith(expected: any, message: object) {
        const result = this.match(expected);
        if(result.passed()) {throw new Error('Did not expect it to pass')
        }
        const matchResult = assertThat(result.diff).match(message);
        if (!matchResult.passed()) {
            throw new Error(`Incorrect message: 
actual:   '${printer.render(result.diff)}' 
expected: '${printer.render(message)}'`);
        }
    }

    // This is used internally for testing error messages:
    failsWithRendering(expected: any, rendered: string) {
        const result = this.match(expected);
        assertThat(printer.render(result.diff)).is(rendered);
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
        } catch (e: any) {
            const result = matcher.matches(e);
            if (!result.passed()) {
                result.bad(exceptionMessage(e));
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
        const matcher = matchMaker(expected);
        const result = this.actual;
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

    catchesError(message: string): Promise<unknown> {
        return this.catches(ErrorMatcher.make(message));
    }

    logExceptionFail(message: string, matcher: DiffMatcher<any>) {
        console.log(message, PrettyPrinter.make().render(matcher.describe()));
    }

    private match(expected: DiffMatcher<T> | any): MatchResult {
        const matcher = matchMaker(expected);
        return matcher.matches(this.actual);
    }

    private checkForFunction() {
        ensureNotFunction(this.actual);
    }
}

export function ensureNotFunction(actual: any) {
    if (ofType.isFunction(actual && !actual[PrettyPrinter.symbolForMockName])) {
        throw new Error("Can't assertThat() on a function, as functions are not matched");
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
        } catch (e: any) {
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
        } catch (e: any) {
            assertThat(e).is(expected);
        }
        if (failed) {
            fail(`Failed to throw exception. Expecting ${expected} but got ${result}`);
        }
    }
}
