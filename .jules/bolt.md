## 2025-05-15 - O(1) Blendshape Lookups
**Learning:** In high-frequency ML loops (10-30fps), performing multiple `.find()` calls on a 52-element array for facial blendshapes creates unnecessary O(N*M) overhead. Converting the array to a Map once per analysis reduces lookup time to O(1) per feature.
**Action:** Always prefer Map lookups over repeated array searches when accessing specific ML feature outputs in the render/analysis loop.
