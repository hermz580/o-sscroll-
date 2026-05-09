## 2026-05-09 - Optimized Real-time Analysis Loop
**Learning:** High-frequency background observation loops using `face-api.js` were being choked by the expensive `withAgeAndGender()` call and overlapping async execution. Reusing a persistent offscreen canvas for frame capture significantly reduced memory churn compared to creating new DOM elements every 250ms.
**Action:** Always implement concurrency guards for async `setInterval` callbacks and use a 'fast' path for background scans that skips heavy inferences while caching secondary data.
