## 2026-04-18 - Optimized Face Analysis Pipeline
**Learning:** Real-time ML loops often perform redundant, expensive inferences (like age/gender) and inefficient data structure traversals (like O(N) array searches) in high-frequency paths.
**Action:** Implement a 'fast' path that skips non-essential inferences and uses O(1) lookups via Record/Map, while caching results from 'full' scans to maintain data availability.
