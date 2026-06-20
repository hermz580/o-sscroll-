## 2025-05-24 - Concurrency Guards for ML Intervals
**Learning:** Asynchronous ML operations (like face detection/analysis) scheduled via `setInterval` or `setTimeout` can overlap if the execution time exceeds the interval duration, leading to CPU/GPU congestion and UI unresponsiveness. Using a simple boolean `useRef` as a lock is effective, but it must be wrapped in a `try...finally` block to ensure the lock is released even if the ML call fails.
**Action:** Always implement `try...finally` guards for recurring async tasks in the camera/analysis loop.

## 2025-05-24 - DOM Node Reduction in Text Processing
**Learning:** Functions that process large amounts of text (like `colorizeText`) can inadvertently bloat the DOM if they wrap every single word in a `<span>`, even those without styling. This increases memory usage and slows down subsequent re-renders or style recalculations.
**Action:** Only wrap elements in additional DOM nodes when a specific style or behavior is required; leave standard text as plain strings or single text nodes whenever possible.
