## 2026-04-26 - [Face Analysis Fast Mode]
**Learning:** The application performs continuous background observation using both MediaPipe and face-api.js. While MediaPipe is efficient for landmarks, face-api.js neural network inference (expressions, age, gender) is expensive and redundant during the idle observation phase. Implementing a 'fast' mode that bypasses face-api.js during observation yields a massive CPU reduction while maintaining the necessary landmark data for UI feedback and candid frame selection.

**Action:** Always check if heavy secondary neural network inferences can be deferred or disabled when only primary structural data (like landmarks) is needed for real-time UI updates.
