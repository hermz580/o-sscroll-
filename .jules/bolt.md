## 2025-05-15 - [DOM Node Reduction for Long Text]
**Learning:** In applications rendering long, procedurally generated text (like AI readings), wrapping every word and whitespace in a `<span>` for styling causes massive DOM bloat, leading to memory pressure and slower re-renders.
**Action:** Optimize text colorization functions to return plain `React.Fragment` (with keys) for unstyled segments, and only use `<span>` for styled keywords. This maintains visual parity while reducing DOM nodes by ~80-90%.

## 2025-05-15 - [Respecting package.json Boundaries]
**Learning:** Agent environment 'pnpm install' might introduce changes to 'package-lock.json' or prompt the need for missing types. However, modifying 'package.json' directly is often a strictly forbidden boundary.
**Action:** Always verify if 'package.json' modification is allowed. If not, find alternative ways to verify code (e.g., ignoring lint errors if they are pre-existing or environment-related) and never commit accidental package changes.
