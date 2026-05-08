## 2025-05-15 - Background Observation Optimization
**Learning:** High-frequency ML inference loops (250ms) that include age and gender detection significantly impact main thread performance. Bypassing these secondary metrics reduces the 'detectSingleFace' task overhead by skipping the heaviest neural network layers.
**Action:** Implement a 'fast' analysis path that skips expensive inferences, using a 'last-known-value' caching strategy with periodic full-scan refreshes (every 10 cycles) to maintain data continuity without the constant CPU/GPU cost.
