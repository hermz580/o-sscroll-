## 2026-06-10 - [Background Inference Bottleneck]
**Learning:** Found that 'analyzeFace' was performing heavy neural network inferences every 250ms during background observation, significantly impacting CPU usage. Implemented a 'fast' mode with caching and concurrency guards.
**Action:** Use 'ProcessingRef' (useRef) flags and 'try...finally' blocks for all ML-related intervals to prevent overlapping async calls and reduce redundant inferences.
