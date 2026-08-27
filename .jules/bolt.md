## 2025-05-14 - Background ML Inference Contention
**Learning:** High-frequency background loops (like landmark drawing and candid frame analysis) can cause CPU contention and "jank" if overlapping async inferences are not guarded. Interval-based loops don't wait for the previous execution to finish, leading to a queue of heavy tasks.
**Action:** Always implement a concurrency guard (using `useRef` boolean or similar) and consider a "fast path" (throttling/caching expensive neural network calls) for non-critical background observations.
