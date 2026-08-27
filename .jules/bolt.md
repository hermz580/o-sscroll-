## 2025-03-24 - Async Interval Concurrency in ML Pipeline
**Learning:** Using `setInterval` with asynchronous ML operations (like `face-api.js` or MediaPipe) in React can lead to "ghost" executions where multiple frames are processed simultaneously if an operation exceeds the interval duration. This causes severe CPU/GPU contention and UI jank.
**Action:** Protect asynchronous operations within intervals using `useRef` locks and `try...finally` blocks to ensure sequential execution and reliable lock release.
