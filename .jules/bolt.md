## 2025-05-15 - Face-API.js Background Inference Bottleneck
**Learning:** Real-time ML inference using multiple models (MediaPipe + Face-API.js) on a tight interval (250ms) creates significant CPU overhead and UI jitter, especially during background observation phases where full precision for secondary metrics (age, gender, expressions) is not immediately required.
**Action:** Implement a "fast mode" for ML services that uses caching for expensive, slow-changing inferences while maintaining high-frequency updates for primary structural data (landmarks).

## 2025-05-15 - Maintaining Data Correctness in Optimized Paths
**Learning:** Purely skipping ML inferences and returning dummy/placeholder data (e.g., `age: 0`) can cause functional regressions if that data is consumed by other parts of the app during the optimized phase.
**Action:** Always implement a caching mechanism (last-known-value) when creating optimized "fast" paths to ensure that the application state remains consistent and correct even when full computation is deferred.
