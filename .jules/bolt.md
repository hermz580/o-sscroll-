## 2025-05-15 - Background Face Analysis Optimization
**Learning:** The application uses a background loop to analyze the user's face every 250ms for "candid" moments. This was calling full `face-api.js` inferences (emotions, age, gender) on every tick, which is expensive and unnecessary for background observation where core features like landmarks change slowly.
**Action:** Implemented a 'fast' path in `analyzeFace` that skips secondary inferences and uses a periodic refresh (1/15 rate). Also added a concurrency guard to prevent overlapping async inferences in the background loop.
