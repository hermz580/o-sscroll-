# Bolt's Performance Journal ⚡

## 2025-05-15 - Background ML Observation Bottleneck
**Learning:** Running full neural network inferences (MediaPipe + face-api.js) every 250ms in a background loop without concurrency guards can lead to "execution drift" where async calls stack up, pegging the CPU and causing UI stutter. face-api.js (age/gender/expressions) is significantly more expensive than MediaPipe's WASM-based landmarker.
**Action:** Implement concurrency guards (processing flags) for all background intervals. Use a "fast" mode for background analysis that caches expensive, slow-changing metrics like age and gender, only refreshing them periodically.
