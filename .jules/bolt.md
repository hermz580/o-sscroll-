## 2026-06-04 - ML Inference Optimization in Request Loops
**Learning:** In performance-critical ML tasks involving continuous video processing (e.g., setInterval loops), overlapping async inferences can cause a promise backlog that spikes CPU usage and degrades UI responsiveness.
**Action:** Always implement concurrency guards using boolean refs and try/finally blocks to ensure locks are released. Additionally, implement a 'fast mode' with caching for relatively static traits (like age or gender) to reduce the frequency of expensive neural network calls.
