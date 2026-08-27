
## 2026-06-02 - Throttled ML Inference & Concurrency Guards
**Learning:** Background observation loops using heavy ML models (like face-api.js) can cause browser unresponsiveness if async calls overlap or run at high frequencies without caching. Using a "fast mode" that prioritizes lightweight landmarks while throttling expensive classification (age/gender/expressions) drastically reduces CPU/GPU overhead (~90% for those specific tasks) without degrading perceived UX.
**Action:** Always implement concurrency guards (Ref-based boolean flags with try/finally) in component-level intervals calling async ML services. Implement result caching and refresh counters for non-critical classifications to preserve resources for UI-critical animations.
