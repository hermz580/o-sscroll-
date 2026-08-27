## 2025-05-22 - Blendshape Lookup Optimization
**Learning:** Repeatedly calling `.find()` on the MediaPipe blendshapes array (52+ categories) during real-time analysis creates $O(M \cdot N)$ complexity in the hot path. Converting the array to a Map/Record once per frame reduces lookups to $O(1)$, resulting in $O(N + M)$ total complexity.
**Action:** Always convert blendshape arrays to lookup objects when multiple specific shapes need to be extracted.
