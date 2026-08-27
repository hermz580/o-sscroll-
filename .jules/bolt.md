# Bolt's Performance Journal ⚡

## 2025-05-15 - Optimizing Background Face Analysis
**Learning:** The background observation loop was performing redundant full-suite ML inferences (MediaPipe + face-api.js) every 250ms, even though only blendshapes were needed for candid frame selection. This creates unnecessary CPU/GPU load and drains battery on mobile devices.
**Action:** Implement a "fast mode" in `analyzeFace` that caches slowly-changing metrics (age, gender) and skips expensive face-api.js calls during background observation. Added concurrency guards to prevent overlapping inferences.
