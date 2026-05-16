## 2026-05-16 - ML Background Observation Optimization
**Learning:** High-frequency background ML loops (like facial analysis) can cause significant GC pressure and main-thread blocking if they repeatedly allocate DOM elements (like canvases) or perform heavy neural network inferences for data that changes slowly (like age/gender). Using a 'fast' path that skips secondary inferences and reuses a persistent offscreen canvas significantly improves responsiveness.
**Action:** Always implement a 'fast' mode for background ML tasks and use persistent refs for reusable DOM artifacts like canvases.

## 2026-05-16 - Concurrency Guards in Async Loops
**Learning:** Background intervals calling async ML functions can overlap if an inference takes longer than the interval, leading to resource contention.
**Action:** Use a mutable ref (e.g., `isProcessingRef`) as a concurrency guard inside the `setInterval` callback, wrapping the logic in a `try/finally` block to ensure the guard is always reset.
