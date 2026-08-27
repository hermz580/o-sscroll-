
## 2026-06-07 - [Optimized background face observation loop]
**Learning:** Asynchronous ML operations in React intervals can cause "task accumulation" and UI lag if the execution time exceeds the interval. Using useRef boolean flags as concurrency guards is essential. Additionally, expensive inferences (age, gender, expressions) can be throttled/cached during background observation as they don't change as rapidly as landmarks.
**Action:** Always wrap concurrency guards in try...finally blocks to ensure flags are reset. Implement a Fast Mode with caching for non-critical ML data to reduce CPU/GPU overhead.
