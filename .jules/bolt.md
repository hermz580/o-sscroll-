## 2025-05-15 - Async Execution Locks in High-Frequency ML Pipelines
**Learning:** In real-time ML applications (e.g., face landmark drawing at 100ms intervals), asynchronous calls (analyzeFace, getLandmarks) can overlap if processing time exceeds the interval. This leads to "jank", CPU/GPU congestion, and potential browser hangs.
**Action:** Always use 'useRef' locks (isProcessingRef) within 'try...finally' blocks to skip subsequent interval ticks if a previous async operation is still in flight.
