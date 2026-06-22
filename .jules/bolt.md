## 2025-05-15 - Asynchronous ML Task Congestion
**Learning:** Asynchronous ML functions (like `analyzeFace` and `getLandmarks`) invoked within short intervals (`setInterval`) can overlap if processing time exceeds the interval. This leads to CPU/GPU congestion, memory pressure, and UI lag as the browser attempts to handle multiple concurrent heavyweight tasks.
**Action:** Always protect frequent asynchronous ML calls with a `useRef` lock and `try...finally` block to ensure sequential execution and skip frames when the processor is busy.
