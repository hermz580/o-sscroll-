## 2025-03-24 - Concurrency Guards in Async React Loops

**Learning:** Intervals executing asynchronous ML operations (like MediaPipe or face-api) can stack execution if the model inference takes longer than the interval duration, leading to severe UI jank or memory leaks.

**Action:** Always use a `useRef` boolean flag as a concurrency guard and wrap the async call in a `try...finally` block to ensure the flag is reset even on failure.

## 2025-03-24 - Throttling Non-Critical ML Inferences

**Learning:** Constant re-inference of static or slow-changing attributes (age, gender) is wasteful in background observation loops.

**Action:** Implement a "fast mode" with a caching mechanism and a refresh counter to skip heavy neural network passes on most frames, drastically reducing CPU usage.
