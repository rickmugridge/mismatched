import {DiffMatcher, PrettyPrinter} from "..";

export class CustomiseMismatcher {
    public static customMatchers = new Map<DiffMatcher<any>, (expected: any) => DiffMatcher<any>>();
    public static customMatcherWhenToUses: Array<DiffMatcher<any>> = [];

    static addCustomMatcher(whenToUse: DiffMatcher<any>, matcher: (expected: any) => DiffMatcher<any>) {
        CustomiseMismatcher.customMatchers.set(whenToUse, matcher);
        CustomiseMismatcher.customMatcherWhenToUses.push(whenToUse);
    }

    static addCustomPrettyPrinter(matcher: DiffMatcher<any>, toString: (t: any) => string) {
        PrettyPrinter.addCustomPrettyPrinter(matcher, toString);
    }
}