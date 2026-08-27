## 2025-05-15 - Concurrency Guards in Async Intervals
**Learning:** In React applications performing heavy asynchronous ML operations (like face analysis) within `setInterval`, it's critical to use `useRef` flags as concurrency guards. Without them, if an operation takes longer than the interval, multiple overlapping processes can accumulate, thrashing the CPU and leading to a "death spiral" of performance degradation.
**Action:** Always wrap async calls in intervals with `try...finally` blocks that manage a `processingRef` flag.

## 2025-05-15 - Inference Caching for Background Observation
**Learning:** Background processes that don't require high precision (like candid frame detection) can benefit significantly from temporal caching of heavy neural net results. Caching `face-api.js` expressions/age/gender and refreshing only every ~15 frames reduces CPU load by an estimated 60-70% while remaining responsive to user changes.
**Action:** Implement a "fast" mode for analytical services that allows consumers to trade off some precision for significant performance gains in non-critical paths.

## 2025-05-15 - Rejected Type Fix for ErrorBoundary
**Learning:** Attempting to fix pre-existing TypeScript errors in class components (related to React 19 types) using manual property declarations and `any` casting is considered an unmaintainable anti-pattern. Even if it makes `tsc` pass, it degrades codebase quality.
**Action:** Prioritize environmental fixes (like updating `@types/react`) or accept pre-existing lint errors rather than implementing brittle manual type overrides in source code.
