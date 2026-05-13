# @patch-kit/modal

A stack-based modal engine built with Zustand and React Portals.

The engine owns: stacking, z-index, focus trapping, body scroll lock, escape key, and outside-click dismissal.
The consumer owns: all visual styling — overlay color, dialog shape, typography, animations.

## Folder contents
- `useModal.tsx` — Zustand store, `useModal` hook, and shared modal types.
- `ModalItem.tsx` — Single modal instance renderer (overlay + dialog).
- `ModalRenderer.tsx` — Root renderer that portals the modal stack.
- `index.ts` — Public exports.

## Exports
- `useModal` — Hook that exposes `showModal`, `closeModal`, `closeAllModals`.
- `ModalRenderer` — Component that renders all active modals to `document.body`.
- `ModalItem` — Low-level modal renderer used by `ModalRenderer`.

## How it works
- Modals are stored in a stack (`ModalInstance[]`) in Zustand.
- `showModal` pushes a new modal, or replaces an existing one by id.
- `closeModal()` closes the top modal; `closeModal(id)` closes a specific one.
- `ModalRenderer` maps the stack to `ModalItem` and portals it outside the React tree.
- Each modal gets its own overlay and dialog layer with incremental z-index.

## Usage

```tsx
// 1) Render the engine once, near the app root
<ModalRenderer />

// 2) Open/close modals from anywhere
const { showModal, closeModal } = useModal();

showModal(
  <YourStyledModal onClose={() => closeModal()} />,
  {
    closeOnOutsideClick: true,       // default: true
    id: "optional-custom-id",        // default: auto-generated UUID
    ariaLabel: "account settings",
    ariaDescribedBy: "settings-desc",
  }
);
```

The content you pass to `showModal` is rendered inside the engine's dialog wrapper.
Your component is responsible for all visual styling — size, color, padding, borders, etc.

## Options
`showModal(content, options)` accepts:
- `id`: string — If provided and already open, the modal is replaced.
- `closeOnOutsideClick`: boolean — Closes on overlay click and Escape. Default: `true`.
- `ariaLabel`: string — Applied to the dialog for screen readers.
- `ariaDescribedBy`: string — ID of a descriptive element inside the modal content.
- `onClose`: function — Callback fired when the modal begins closing.

## DOM structure

The engine renders three unstyled elements you can target in CSS:

```
[data-id="<uuid>"]        fixed inset-0, centered — the positioning anchor
  [modal-backdrop]        absolute inset-0 — receives outside-click; style for the backdrop
  (dialog wrapper)        relative, z-index above backdrop — your content renders here
```

Example consumer CSS:

```css
[modal-backdrop] {
  background: rgba(0, 0, 0, 0.5);
}
```

## Accessibility
- Dialog uses `role="dialog"` and `aria-modal="true"`.
- `ariaLabel` and `ariaDescribedBy` options are forwarded to the dialog element.
- Focus is trapped within the top modal while it is open.
- The top modal is auto-focused when it becomes active.

## Behavior details
- **Stacking** — Overlays use z-index `1100 + index * 2`; dialogs use `+ 1`.
- **Escape key** — Closes the top modal if `closeOnOutsideClick` is `true`.
- **Outside click** — Clicking the backdrop closes when `closeOnOutsideClick` is `true`.
- **Scroll lock** — Body scroll is disabled while any modal is open; scrollbar width is compensated via `padding-right` to prevent layout shift.
- **SSR safety** — Rendering is skipped until the component is mounted on the client.

## Notes
- `ModalItem` is exported for advanced use cases; the normal path is `useModal` + `ModalRenderer`.
- If you pass `ariaDescribedBy`, ensure the referenced element ID exists inside the modal content.
