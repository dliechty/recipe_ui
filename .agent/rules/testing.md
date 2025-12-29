---
trigger: always_on
---

When executing a test, use `npm run test:once` instead of `npm test` as the base command. When testing with a specific file, the command should be: `npm run test:once <file>`.

Also, before finalizing changes, always run `npm run test:once` to run the entire test suite.