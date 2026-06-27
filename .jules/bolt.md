## 2026-06-27 - Preventing ML Congestion with Concurrency Locks
**Learning:** High-frequency intervals (e.g., 100ms) calling asynchronous ML functions (e.g., `analyzeFace`, `getLandmarks`) can lead to CPU/GPU congestion if tasks overlap.
**Action:** Always use `useRef` locks (e.g., `isProcessingRef`) and `try...finally` blocks to ensure only one asynchronous task is in flight at a time.
