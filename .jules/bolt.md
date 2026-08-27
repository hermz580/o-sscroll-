## 2025-05-15 - Optimize scanning loop and ML processing
**Learning:** Asynchronous ML functions like `getLandmarks` and `analyzeFace` can stack up if they take longer than the `setInterval` delay, causing severe UI lag and browser congestion. Additionally, hundreds of individual `ctx.fill()` calls per frame for landmarks are extremely expensive.
**Action:** Always implement async locks using `useRef` and `try...finally` for recurring ML tasks. Group canvas drawing operations (like `arc()`) into single paths using `beginPath()` and a single `fill()` call to minimize GPU overhead.
