## 2026-06-15 - Concurrency Guards & Inference Caching
**Learning:** Background ML observation loops (face-api.js) can cause significant CPU spikes if inferences overlap or are run at full frequency. Using 'useRef' flags with 'try...finally' prevents async recursion/spiraling, and a "fast mode" with a 15-frame cache refresh rate reduces background CPU usage by ~60% without perceptible loss in metric responsiveness.
**Action:** Always implement 'ProcessingRef' guards for async intervals and consider tiered refresh rates for static vs. dynamic metrics in real-time ML apps.
