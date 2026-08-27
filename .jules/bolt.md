# Bolt's Journal - Performance Learnings

This journal documents critical performance learnings in the Olari's Resonance codebase.

## 2025-05-15 - Initial Audit
**Learning:** The application uses MediaPipe and face-api.js for real-time facial analysis. The background observation loop runs every 250ms.
**Action:** Focus on optimizing the observation loop and ML inference paths to reduce main-thread blocking.
