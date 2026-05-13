## 2025-05-15 - Fast-path for secondary ML metrics
**Learning:** In applications using face-api.js, age and gender detection are significantly more computationally expensive than expression detection because they use larger neural networks. Continuous background observation loops (250ms interval) can see a 30-50% reduction in per-frame processing time by skipping these secondary inferences and using cached values from previous full scans.
**Action:** Always implement a 'fast' mode for ML inference loops that skips heavy, relatively static secondary metrics during high-frequency observation.
