import {match} from "../match";
import {internalAssertThat} from "../utility/internalAssertThat"
import {testing} from "../testing"
import wasExpected = testing.wasExpected

describe("PreviewMatcher()", () => {
    it("matches", () => {
        internalAssertThat({f: [{g: 2}]}).is({f: [{g: match.preview(2)}]});
    });

    it("mismatches", () => {
        internalAssertThat({f: [{g: 2}]})
            .failsWith({f: [{g: match.preview(3)}]})
            .wasDiff({f: [{g: wasExpected(2, 3)}]}
                , ["actual.f[0].g: 2, expected: 3"]);
    });
});

// Note that we can't test for expected effects of this, as they arise as a side-effect of pretty printing when a test fails.