## 2025-05-14 - background face analysis optimization
**Learning:** Concurrent asynchronous calls in `setInterval` loops can lead to performance degradation and race conditions if previous calls haven't finished, especially with heavy ML tasks like face analysis. Caching expensive model inferences for background observation significantly reduces CPU pressure without losing critical UX responsiveness.
**Action:** Always use `useRef` based concurrency guards for async intervals and implement optional 'fast' modes for background polling of expensive data.
