## 2025-05-15 - Throttling Multi-Model ML Inferences
**Learning:** Running `face-api.js` (Age/Gender/Expressions) at 4Hz (every 250ms) alongside MediaPipe landmarks causes significant CPU/GPU contention. Landmark data is high-frequency, but classifications like age and gender are static and expressions change relatively slowly.
**Action:** Implement a `fast` mode for ML classification tasks that uses a refresh rate (e.g., 1/15) to cache results, while maintaining high-frequency landmark updates for UI responsiveness.
