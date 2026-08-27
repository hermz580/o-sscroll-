## 2025-05-15 - Optimizing CameraView performance and resource utilization
**Learning:** Real-time landmark drawing with hundreds of `ctx.arc()` calls is a major GPU/CPU bottleneck. Grouping them into a single `beginPath()`/`fill()` path significantly reduces draw calls. Additionally, asynchronous processing in `setInterval` can "stack" and cause performance degradation if not protected by locks.
**Action:** Always batch canvas drawing operations and use `useRef` locks for async processing within high-frequency intervals.
