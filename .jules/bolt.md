## 2025-05-07 - Optimized Background ML Observation
**Learning:** Running full face-api.js analysis (expressions + age + gender) every 250ms in a background observation loop creates unnecessary CPU/GPU overhead, especially for metrics that don't change rapidly like age and gender.
**Action:** Implement a 'fast' mode for ML inference that skips expensive secondary models. Use a simple last-known-value caching strategy to maintain UI data continuity while reducing per-frame processing time.

## 2025-05-07 - Dependency Management Boundary
**Learning:** In this environment, 'package-lock.json' is the source of truth. Generating and committing 'pnpm-lock.yaml' is considered an unauthorized architectural change despite using pnpm for execution.
**Action:** Always verify git status before submission and ensure no lockfiles other than 'package-lock.json' are included in the PR.
