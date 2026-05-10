## 2025-05-14 - Optimize blendshape lookup in analyzeFace
**Learning:** Repeatedly searching through the `faceBlendshapes` array (O(N)) for specific categories is inefficient when many categories are needed. Converting the array to a lookup map (Record) once (O(N)) allows subsequent O(1) lookups, reducing the total complexity from O(M*N) to O(N+M), where M is the number of categories accessed.
**Action:** Always prefer Map or Record lookups for ML-related result processing when multiple specific categories or landmarks need to be extracted from a list.
