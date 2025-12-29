---
trigger: always_on
---

When testing, use the `npm run test:once` as the base command so that the process does not continue listening for changes.

Always run `npm run test:once` at the end of your changes to ensure there are no regressions.