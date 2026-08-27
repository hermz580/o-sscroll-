## 2026-05-21 - Background Face Analysis Optimization
**Learning:** Real-time ML applications often suffer from "frame piling" where overlapping async processing calls compete for CPU/GPU resources. Throttling heavy inferences (like age/gender/expressions) while maintaining high-frequency light tracking (landmarks) is a crucial pattern for mobile/low-power responsiveness.
**Action:** Always use concurrency guards (useRef boolean flags) in async interval loops. Implement a 'fast path' with a refresh counter (e.g., every 15 frames) for non-critical metrics to balance accuracy and performance.
