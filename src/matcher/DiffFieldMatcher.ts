import {ContextOfValidationError, DiffMatcher} from "./DiffMatcher";
import {Mismatched} from "./Mismatched";
import {MatchResult} from "../MatchResult";
import {matchMaker} from "../matchMaker/matchMaker";
import {ObjectKeyMatcher} from "./ObjectKeyMatcher";
import {BindMatcher} from "./BindMatcher";
import {allKeys} from "../allKeys";

export class DiffFieldMatcher<T> extends DiffMatcher<T> {
    private constructor(public fieldName: string | symbol, private matcher: DiffMatcher<T>) {
        super();
        this.specificity = matcher.specificity
    }

    mismatches(context: ContextOfValidationError, errors: Array<Mismatched>, actual: T): MatchResult {
        return this.matcher.mismatches(context.add("." + this.fieldName.toString()), errors, actual[this.fieldName]);
    }

    describe(): any {
        return {[this.fieldName]: this.matcher.describe()};
    }

    isKey() {
        return this.matcher instanceof ObjectKeyMatcher
    }

    isBind() {
        return this.matcher instanceof BindMatcher
    }

    static make<T>(fieldName: string, expected: DiffMatcher<T> | any): DiffFieldMatcher<T> {
        return new DiffFieldMatcher<T>(fieldName, matchMaker(expected));
    }

    static makeAll<T>(obj: object): Array<DiffFieldMatcher<T>> {
        return allKeys(obj).map(key => new DiffFieldMatcher(key, matchMaker(obj[key])));
    }
}
