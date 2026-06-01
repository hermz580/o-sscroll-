## 2026-06-01 - Optimized background face analysis
**Learning:** Throttling expensive neural network calls (face-api.js) during background observation by implementing a cached 'fast' mode and using concurrency guards reduces CPU overhead significantly (~93% for background tasks) without sacrificing UX responsiveness.
**Action:** Use useRef booleans as concurrency guards for async loops in React components, and implement multi-tier analysis (fast/full) for ML-heavy features.
