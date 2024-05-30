// import {match} from "../match";
// import {internalAssertThat} from "../utility/internalAssertThat"
// import {testing} from "../testing"
// import wasExpected = testing.wasExpected
//
// describe("SelectivelyAssertMatcher()", () => {
//     it("matches", () => {
//         internalAssertThat({f: [{g: 2}]}).is({f: [{g: match.selectivelyAssert(2)}]});
//     });
//
//     it("mismatches", () => {
//         internalAssertThat({f: [{g: 2}]})
//             .failsWith({f: [{g: match.selectivelyAssert(3)}]})
//             .wasDiff({f: [{g: wasExpected(2, 3)}]}
//                 , ["actual.f[0].g: 2, expected: 3"]);
//     });
// });