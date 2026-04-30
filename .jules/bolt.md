## 2025-04-30 - Background Analysis Optimization
**Learning:** Background observation loops that perform full neural network inference (like `face-api.js`) can significantly strain CPU/battery. MediaPipe landmarks are often sufficient for background tasks like frame filtering or basic tracking.
**Action:** Implement a 'fast' mode for face analysis that bypasses expensive secondary inferences when they aren't strictly required for the immediate UI feedback or processing step.
