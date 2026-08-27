## 2025-05-22 - Optimizing background ML observation loops
**Learning:** High-frequency background observation loops using heavy ML (like face-api.js) cause significant CPU/GPU strain. Secondary metrics (age, gender, expressions) rarely change frame-to-frame during observation.
**Action:** Implement a 'fast' analysis path that uses a 'last-known-value' cache for secondary metrics, refreshing it only periodically (e.g., every 15 frames) to maintain accuracy while saving ~60-70% resources. Always use concurrency guards (refs + try/finally) in async intervals to prevent overlapping inferences.
