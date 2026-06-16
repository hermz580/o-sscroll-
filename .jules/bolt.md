## 2025-05-15 - Async Concurrency in React Loops
**Learning:** Background intervals calling asynchronous ML models (MediaPipe/face-api.js) can easily overlap if the processing time exceeds the interval duration, leading to CPU spikes and UI stutter. Using a `useRef` boolean flag is effective, but it MUST be wrapped in a `try...finally` block to prevent the loop from permanently locking if an error occurs during inference.
**Action:** Always use `try...finally` when implementing concurrency guards for background processing loops.
