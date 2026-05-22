# @patch-kit/popover

A Popover Engine built with Zustand and React.

This popover focuses on being a purely technical engine — its only job is to handle the mechanics of managing floating content so the application never has to. The application remains fully in control of every visual decision.

The popover automatically handles stacking, z-indexing, viewport boundary correction, safe zone tracking, auto-close on mouse leave, outside-click close, and parent-child cascade closing.

## Folder contents
- `usePopover.tsx` — Zustand store, `usePopover` hook, and shared popover types.
- `Popover.tsx` — Single popover instance renderer (positioning + event handling).
- `PopoverRenderer.tsx` — Root renderer that portals the popover stack.
- `index.ts` — Public exports.

## Exports
- `usePopover` — Hook that exposes `showPopover`, `closePopover`, `closeAllPopovers`.
- `PopoverRenderer` — Component that renders all active popovers to `document.body`.

## How it works
- Popovers are stored in a stack (`PopoverConfig[]`) in Zustand.
- `showPopover(anchor, content, options?)` pushes a new popover, or replaces an existing one by id.
- `closePopover()` closes the most recently opened; `closePopover(id)` closes a specific one.
- `PopoverRenderer` maps the stack to `Popover` instances and portals them outside the React tree.

## Usage

```tsx
// 1) Render the engine once, near the app root
<PopoverRenderer />

// 2) Open/close popovers from anywhere
const { showPopover, closePopover } = usePopover();

// Dropdown anchored below a button
showPopover(buttonRef.current.getBoundingClientRect(), <MyDropdown options={[...]} />, {
  placement: "bottom",
  safeZone: { trigger: buttonRef.current },
});

// Tooltip on hover
showPopover(buttonRef.current.getBoundingClientRect(), <MyTooltip text="Align left" />, {
  placement: "top",
  safeZone: { trigger: buttonRef.current },
  autoCloseDelay: 150,
});

// Submenu opening to the right of a menu item
showPopover(itemRef.current.getBoundingClientRect(), <MySubmenu />, {
  id: "submenu",
  parentId: "my-dropdown",
  placement: "right",
  safeZone: { trigger: itemRef.current },
  autoCloseDelay: 150,
});
```

## `showPopover` options

- `id`: string — If provided and already open, the popover is replaced in-place.
- `parentId`: string — If the parent popover closes, this one closes too (cascade).
- `placement`: `"top" | "bottom" | "left" | "right"` — Preferred render direction. The engine centers the popover on the relevant edge of the anchor rect and flips to the opposite side if the viewport clips. Default: `"bottom"`.
- `gap`: number — Pixel distance between the trigger and the popover. Default: `4`.
- `safeZone.trigger`: HTMLElement — Element that opened the popover. Cursor entering it cancels auto-close.
- `safeZone.container`: HTMLElement — Larger parent region. Cursor entering it cancels auto-close.
- `autoCloseDelay`: number — ms after cursor leaves all safe zones before closing. `0` closes immediately on leave. `undefined` disables auto-close entirely.
- `closeOnOutsideClick`: boolean — Closes on `mousedown` outside the popover. Default: `false`.
- `toggable`: boolean — Calling `showPopover()` with the same `id` while the popover is already open will close it instead of reopening it. To make it work correctly with `closeOnOutsideClick`, `safeZone.trigger` must be set to the element that calls `showPopover()`. Default: `false`.
- `onOpen`: function — Callback fired when the popover opens.
- `onClose`: function — Callback fired when the popover closes.

## Placement and viewport correction

The engine uses the `DOMRect` passed as `anchor` to compute the correct position:

- `"bottom"` / `"top"` — horizontally centered on the trigger, placed below/above
- `"left"` / `"right"` — vertically centered on the trigger, placed to the left/right

If the computed position clips the viewport, the engine flips to the opposite side. After flipping, the position is hard-clamped with 10px padding from all viewport edges.

## Safe zones

Safe zones are HTML elements where the cursor is considered "still engaged" with a popover. They prevent premature close when the cursor briefly passes through whitespace between the trigger and the popover.

```
[Button]          ← trigger (safe zone 1)
    ↕ gap         ← cursor passes through here — do NOT close
┌─────────┐
│  Menu   │       ← popover content (implicitly safe — cursor is inside)
└─────────┘
```

```
┌──────────────────────┐
│  container (panel)   │  ← safe zone 2: anywhere inside = don't close
│                      │
│  [Button]            │  ← safe zone 1
│      ↕ gap           │
│  ┌─────────┐         │
│  │  Menu   │         │
│  └─────────┘         │
└──────────────────────┘
```

## Nested popovers and cascade closing

Each popover is independent. A submenu is opened from inside the parent's content by calling `showPopover` again with `parentId` set to the parent's id:

```tsx
// Inside <MyDropdown /> — consumer code
function MyDropdown() {
  const { showPopover } = usePopover();

  return (
    <button
      onMouseEnter={(e) => {
        showPopover(e.currentTarget.getBoundingClientRect(), <MySubmenu />, {
          id: "submenu",
          parentId: "my-dropdown",
          placement: "right",
          safeZone: { trigger: e.currentTarget },
          autoCloseDelay: 150,
        });
      }}
    >
      More options →
    </button>
  );
}
```

When `"my-dropdown"` closes, the engine automatically closes `"submenu"` and any further descendants.

## Behavior details

- **Outside click** — Uses `mousedown` (not `click`) for reliable capture before other handlers. Checks all rendered `[data-popover]` elements so clicking inside a sibling popover (e.g. a submenu) does not close the parent.
- **Auto-close** — `mouseleave` on the popover div checks `relatedTarget` against safe zones before starting the timer. Re-entering the popover or any safe zone cancels the timer.
- **Container leave** — If a `safeZone.container` is provided and the cursor leaves it entirely, the popover closes after 100ms unless the cursor moved into another popover.
- **Viewport correction** — Runs after mount via `useEffect` + `getBoundingClientRect()`. No external positioning library.
- **Cascade closing** — `closePopover(id)` recursively closes all popovers with `parentId` matching that id before closing itself, firing each `onClose` callback in order.
