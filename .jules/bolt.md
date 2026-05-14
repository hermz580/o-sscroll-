## 2026-05-14 - Optimize real-time face analysis pipeline
**Learning:** High-frequency background observation loops can be a major source of CPU/GPU overhead if they perform expensive inferences like age/gender detection on every frame. Caching these secondary metrics and implementing a 'fast' analysis path significantly improves application responsiveness.
**Action:** Always implement a 'fast' mode for background ML analysis that skips non-essential inferences and utilizes cached values.
