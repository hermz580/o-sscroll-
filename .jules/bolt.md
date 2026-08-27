## 2026-06-18 - Concurrency Guards in ML Intervals
**Learning:** Overlapping asynchronous ML processing in React intervals (like landmarks or observation) can saturate the main thread and cause UI stutter. Using 'useRef' based flags with 'try...finally' ensures that only one task runs at a time and the lock is always released.
**Action:** Always implement concurrency guards for background ML loops to maintain high FPS in the main UI thread.

## 2026-06-18 - Multi-Model 'Fast' Mode
**Learning:** In applications using multiple ML libraries (MediaPipe + face-api.js), the bottleneck is often the cumulative load. Implementing a 'fast' mode that skips heavier detections (age/gender/expressions) for background tasks significantly reduces CPU overhead while maintaining necessary tracking.
**Action:** Decouple critical real-time tracking from expensive inference features to allow for more efficient background monitoring.
