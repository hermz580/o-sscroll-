## 2025-05-14 - Accessible Secondary Actions in Interactive Cards
**Learning:** Secondary actions (like 'Delete') that only appear on hover in a card list are inaccessible to keyboard users if they remain hidden. Simply making the card focusable isn't enough; the hidden actions must also be revealed when the parent container or the action itself is focused.
**Action:** Use `group-focus-within:opacity-100` (or similar focus-state visibility classes) on elements that are normally `opacity-0` on hover, ensuring they are discoverable and usable for keyboard users.
