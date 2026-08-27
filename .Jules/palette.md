## 2025-03-24 - [Micro-UX & Accessibility Polish]

**Learning:** Micro-UX features that rely on DOM-based selectors (like "click-to-define" for text) are fragile and can easily break if the rendered output (e.g., Markdown-generated content) lacks the expected wrapper classes. Additionally, secondary actions hidden behind hover states (like "Delete" buttons) are completely inaccessible to keyboard users unless explicitly shown via `group-focus-within` or similar focus-state triggers.

**Action:** When implementing or fixing interactive text selection, always verify that the target containers consistently carry the required identifier classes (e.g., `.reading-content`). For hover-only actions, ensure they are paired with `focus-visible` or `group-focus-within` styles to maintain parity between mouse and keyboard users.
