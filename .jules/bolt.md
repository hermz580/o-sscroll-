## 2025-05-15 - Async ML Congestion
**Learning:** Overlapping asynchronous ML calls (face-api.js and MediaPipe) in short-interval callbacks cause significant CPU/GPU jank and memory pressure, especially on lower-end devices where processing time exceeds the interval (100ms/250ms).
**Action:** Always use 'useRef' locks with 'try...finally' blocks in interval-based ML tasks to skip subsequent ticks if previous processing is still active.

## 2025-05-15 - Canvas Render Batching
**Learning:** Drawing 478+ individual points using separate 'beginPath'/'fill' calls per frame is extremely inefficient for the Canvas 2D API.
**Action:** Group related points (like face landmarks) into a single path using 'ctx.moveTo' to avoid connecting lines, then perform a single 'ctx.fill' to reduce draw calls from hundreds to one per frame.
