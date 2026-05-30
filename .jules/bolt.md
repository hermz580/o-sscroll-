
## 2026-05-30 - Throttled Neural Inference in Background Loop
**Learning:** Background observation loops that run heavy neural network inferences (like face-api.js) on every frame can saturate the main thread, causing UI jank and high power consumption. Throttling the most expensive parts (age, gender, expressions) while keeping the lighter parts (landmarks) provides a smooth experience without sacrificing functionality.
**Action:** Always use a concurrency guard (isProcessingRef) and a refresh-rate-based cache (fast mode) for background ML observation loops.
