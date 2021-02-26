# What is New (since Jan 2021)

 * Generalised match.bind() to:
   * Take an optional matcher argument, which then has to match the first use
   * Once it matches once, it builds a matcher from that, to match subsequent uses. 
     This allows it to bind and then match objects/arrays.
   * See [Binding Matcher](./BindingMatcher.md)