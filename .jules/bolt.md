# Bolt's Performance Journal

## 2025-05-15 - Async Lock Implementation for ML Intervals
**Learning:** High-frequency asynchronous ML processing (like face landmark detection and background observation) can lead to CPU/GPU congestion if new interval ticks start before previous ones complete.
**Action:** Use `useRef` flags and `try...finally` blocks to implement asynchronous locks, ensuring only one instance of an expensive ML operation runs at a time.
