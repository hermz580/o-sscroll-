## 2026-07-05 - Asynchronous locks and drawing batching in CameraView
**Learning:** Real-time ML processing in React intervals (100-250ms) can easily overlap if detection takes longer than the interval, leading to cumulative performance degradation. Batching hundreds of canvas 'arc' calls into a single 'fill' significantly reduces draw calls.
**Action:** Always use 'useRef' locks for async operations within 'setInterval'. Batch canvas operations by grouping geometry in a single 'beginPath'/'fill' context.
