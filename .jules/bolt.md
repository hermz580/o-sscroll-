## 2025-05-15 - Background Async Task Overlap
**Learning:** High-frequency `setInterval` loops (100-250ms) involving heavy async ML inferences (MediaPipe/face-api.js) can cause task stacking and "death spiral" CPU usage if processing time exceeds the interval.
**Action:** Always use mutable refs (e.g., `isProcessingRef`) as concurrency guards and wrap async logic in `try...finally` blocks to ensure the guard is released regardless of the outcome.

## 2025-05-15 - Strategic ML Inference Throttling
**Learning:** Static metrics like age and gender don't need real-time refresh during background tracking. Skipping these expensive inferences significantly reduces CPU load without affecting UX.
**Action:** Implement a 'fast' mode for ML services that uses cached values for secondary metrics, with a periodic full refresh (e.g., every 15 cycles) to maintain data freshness.
