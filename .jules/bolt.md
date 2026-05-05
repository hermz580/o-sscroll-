## 2025-05-06 - Optimized background face analysis and loop concurrency

**Learning:** The background observation loop in `CameraView.tsx` was performing redundant and expensive `face-api.js` inferences (expressions, age, gender) every 250ms, causing high CPU usage. Additionally, `setInterval` callbacks lacked concurrency guards, potentially leading to overlapping async executions and UI jitter.

**Action:** Implemented a `fast` mode for `analyzeFace` to skip expensive inferences during background monitoring and introduced `useRef` based concurrency guards (`isProcessingRef`, `isDrawingRef`) to prevent overlapping task execution in the ML loops.
