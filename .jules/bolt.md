## 2025-05-14 - Overlapping Asynchronous ML Processing
**Learning:** Real-time ML processing (face tracking, landmark detection) in `setInterval` can easily exceed the interval duration, causing multiple concurrent async operations. This leads to severe CPU/GPU congestion and UI lag.
**Action:** Always implement a mutex/lock using `useRef` to skip subsequent ticks if processing is still underway. Use `try...finally` to ensure the lock is reliably released.

## 2025-05-14 - Redundant Re-renders in High-Frequency Intervals
**Learning:** State updates within high-frequency intervals (e.g., 100ms) trigger React re-renders even if the state value is identical to the previous one (especially with objects or if the value is derived from captured state).
**Action:** Use functional state updates (`setState(prev => ...)`) and perform equality checks before applying the update to minimize React reconciliation overhead.
