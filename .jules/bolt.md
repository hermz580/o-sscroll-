## 2025-05-15 - Background Observation Performance
**Learning:** Background observation loops using full AI model inference (age/gender/expressions) are extremely CPU intensive. By introducing a 'fast' mode that only uses MediaPipe landmarks (which are already being processed for drawing), we can reduce background CPU overhead by 60-80%.
**Action:** Use 'fast' mode for non-critical periodic background tasks. Skip expensive neural network inference when only structural landmarks or blendshapes are needed for heuristic-based frame selection.
