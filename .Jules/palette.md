## 2025-05-15 - WAI-ARIA Tab Pattern for Multi-page Readings
**Learning:** The multi-page reading interface in ReadingDisplay.tsx benefited from a standard WAI-ARIA tab pattern, providing better context for screen reader users and structured keyboard navigation.
**Action:** Use `role="tablist"`, `role="tab"`, and `role="tabpanel"` with appropriate `aria-selected` and `aria-controls` for all tabbed navigation in this project.
