## 2026-04-27 - Optimized background face analysis
**Learning:** Background observation was performing full face-api.js inference (expressions, age, gender) every 250ms, which is a major CPU/GPU bottleneck. MediaPipe blendshapes are sufficient for micro-expression detection in the background.
**Action:** Implement a 'fast' mode for 'analyzeFace' that bypasses expensive inferences and use it for background observation and real-time UI tasks. Added concurrency guards to prevent task overlap.
