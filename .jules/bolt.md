## 2025-05-14 - Throttling face-api.js Inferences
**Learning:** Background observation loops running multiple ML models concurrently (MediaPipe + face-api.js) create significant CPU/GPU contention. face-api.js inferences (age, gender, expressions) are relatively stable compared to landmarks and can be cached.
**Action:** Implement a 'fast' mode for 'analyzeFace' that uses cached face-api.js results while maintaining high-frequency MediaPipe tracking. Use a refresh counter to ensure cache eventually updates.

## 2025-05-14 - Concurrency Guards in Intervals
**Learning:** Using 'setInterval' with async functions can lead to task piling if the async work takes longer than the interval, especially on lower-end devices.
**Action:** Always use a 'useRef' boolean (e.g., 'isProcessingRef') as a concurrency guard with a 'try...finally' block to skip execution if the previous task is still running.
