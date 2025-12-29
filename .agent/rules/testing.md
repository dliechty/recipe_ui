---
trigger: always_on
---

When testing, use the `npm run test:once` as the base command so that the process does not continue listening for changes. This includes when running a single test file. When testing with a file, the command would be something like: `npm run test:once <file>`.

Always run `npm run test:once` at the end of your changes to ensure there are no regressions.