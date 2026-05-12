# Modal

A stack-based modal system built with Zustand and React Portals.
It supports multiple open modals, layered rendering, keyboard handling,
accessibility hooks, focus trapping, body scroll locking, and optional
open/close animations.

## Folder contents
- `useModal.tsx`: Zustand store, `useModal` hook, and shared modal types.
- `ModalItem.tsx`: Single modal instance renderer (overlay + dialog).
- `ModalRenderer.tsx`: Root renderer that portals the modal stack.
- `index.ts`: Public exports.

## Exports
- `useModal`: Hook that exposes `showModal`, `closeModal`, `closeAllModals`.
- `ModalRenderer`: Component that renders all active modals to `document.body`.
- `ModalItem`: Low-level modal renderer used by `ModalRenderer`.

## How it works
- Modals are stored in a stack (`ModalInstance[]`) in Zustand.
- `showModal` pushes a new modal, or replaces an existing one by id.
- `closeModal()` closes the top modal; `closeModal(id)` closes a specific modal.
- Closing can be animated; the modal is removed after its duration completes.
- `ModalRenderer` maps the stack to `ModalItem` and uses a portal to render
  outside the React tree.
- Each modal gets its own overlay and dialog layer with incremental z-index.

## Usage
```tsx
// 1) Render the modal system once (ideally near app root)
<ModalRenderer />

// 2) Open/close modals anywhere
const { showModal, closeModal } = useModal();

showModal(
  <YourComponent />,
  {
    closeOnOutsideClick: true, // default
    id: "optional-custom-id", // default: auto-generated
    animationDuration: 200,    // ms, default
    ariaLabel: "account settings",
    ariaDescribedBy: "account-settings-help",
  }
);
```

## Options
`showModal(content, options)` accepts:
- `id`: string. If provided and already open, the modal is replaced.
- `closeOnOutsideClick`: boolean. When `true`, outside click + Escape closes
  the top modal. Default: `true`.
- `animationDuration`: number (ms). Duration for enter/exit transitions.
  Use `0` to disable animation for that modal. Default: `200`.
- `ariaLabel`: string. Applied to the dialog for screen readers.
- `ariaDescribedBy`: string. ID of a descriptive element inside the modal.

## Accessibility
- Dialog uses `role="dialog"` and `aria-modal="true"`.
- Optional `ariaLabel` and `ariaDescribedBy` are forwarded to the dialog.
- Focus is trapped within the top modal while it is open.
- Top modal is auto-focused when it becomes active.

## Behavior details
- **Stacking**: Each modal is rendered above the previous with z-indexes
  `1100 + index * 2` for overlays and `+ 1` for dialogs.
- **Escape key**: Closes the top modal if `closeOnOutsideClick` is `true`.
- **Outside click**: Clicking the overlay closes the modal when enabled.
- **Scroll lock**: Body scroll is disabled while any modal is open, and
  scrollbar width is added to `padding-right` to prevent layout shift.
- **SSR safety**: Rendering is skipped until mounted on the client.

## Notes
- `ModalItem` is exported for advanced usage, but the common path is to
  use `useModal` + `ModalRenderer`.
- If you pass custom `ariaDescribedBy`, ensure the referenced element ID
  exists inside the modal content.
