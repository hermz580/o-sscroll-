# Bolt's Performance Journal - Olari

This journal documents critical performance learnings and optimizations for the Olari codebase.

## 2025-05-22 - Background Inference Optimization
**Learning:** Real-time background face observation for candid frame detection in `CameraView.tsx` triggers expensive `face-api.js` inferences (emotions, age, gender) every 250ms, which is unnecessary for frame filtering and causes significant CPU/GPU overhead.
**Action:** Implement a 'fast' mode in `analyzeFace` that skips these expensive inferences and uses a last-known-value caching strategy for static secondary metrics (age, gender) during background observation. Dynamic metrics like expressions are defaulted in 'fast' mode to ensure consistent performance without stale data.
