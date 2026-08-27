## 2025-05-27 - Background Analysis Bottleneck
**Learning:** Real-time ML inference loops (250ms) using face-api.js for secondary metrics like age/gender were significantly taxing the CPU/GPU, even though these values are relatively static. Overlapping async calls in these loops could lead to execution piling and UI lag.
**Action:** Implement a 'fast' mode with cached results and a refresh rate (e.g., 1/15) for background observation. Use concurrency guards (Refs) and try/finally blocks to prevent overlapping inferences in async loops.
