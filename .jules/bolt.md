## 2026-06-12 - Background ML Loop Optimization
**Learning:** Background intervals performing asynchronous ML tasks can cause "execution drift" and UI lag if tasks take longer than the interval or overlap. face-api.js inferences for relatively static traits (age, gender) are expensive and don't need to be run at the same frequency as landmark detection.
**Action:** Use Boolean Refs as concurrency guards in React intervals to skip cycles if a previous task is still running. Implement a "fast" mode with caching for ML services to skip redundant heavy inferences during background observation.
