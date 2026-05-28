# @patch-kit/modal

A Modal Engine built with Zustand and React. 

This modal focuses on being a purely technical engine, its only job is to handle the annoying parts of managing modals so the application never has to. The application remains fully in control of every visual decision.

The modal automatically handles stacking, z-indexing, focus-trapping, scroll-lock, keyboard-close, and outside-click close.

**Interactive demo:** [Default](https://xkeexe.github.io/patchkit/?path=/story/modal--default)

## Folder contents
- `useModal.tsx` - Zustand store, `useModal` hook, and shared modal types.
- `Modal.tsx` - Single modal instance renderer (overlay + content).
- `ModalRenderer.tsx` - Root renderer that portals the modal stack.
- `index.ts` - Public exports.

## Exports
- `useModal` - Hook that exposes `showModal`, `closeModal`, `closeAllModals`.
- `ModalRenderer` - Component that renders all active modals to `document.body`.

## How it works
- Modals are stored in a stack (`ModalInstance[]`) in Zustand.
- `showModal(content, options?)` pushes a new modal, or replaces an existing one by id.
- `closeModal()` closes the top modal; `closeModal(id)` closes a specific one.
- `ModalRenderer` maps the stack to `Modal` and portals it outside the React tree.

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

The content passed to `showModal` is rendered inside the engine's dialog wrapper.

## `ModalRenderer` props
- `root`: `HTMLElement | string` - Element (or CSS selector) used to disable the app's root to prevent background clicks.
- `closeKey`: `string | string[]` - Key or list of keys that close the top modal. Defaults to `"Escape"`. Any valid [`KeyboardEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key) value is accepted.

```tsx
// Single key (default)
<ModalRenderer closeKey="Escape" />

// Custom key
<ModalRenderer closeKey="q" />

// Multiple keys
<ModalRenderer closeKey={["Escape", "q"]} />
```

## `showModal` options
- `id`: string - If provided and already open, the modal is replaced.
- `closeOnOutsideClick`: boolean - Closes on backdrop click and the configured `closeKey`. Default: `true`.
- `disableBackground`: boolean - Disables the app's root layout to prevent clicks passing from the modal.
- `ariaLabel`: string - Applied to the dialog element for screen readers.
- `ariaDescribedBy`: string - ID of a descriptive element inside the modal content.
- `onOpen`: function - Callback fired when the modal opens.
- `onClose`: function - Callback fired when the modal begins closing.

## DOM structure

The engine renders allows to edit the backdrop optional styling with CSS:

Example:

```css
[modal-backdrop] {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
```

## Accessibility
- Dialog uses `role="dialog"` and `aria-modal="true"`.
- `ariaLabel` and `ariaDescribedBy` options are forwarded to the dialog element.
- Focus is trapped within the top modal while it is open.
- The top modal is auto-focused when it becomes active.

## Behavior details
- **Key dismissal** - Pressing the configured `closeKey` (default `"Escape"`) closes the top modal.
- **Outside click** - Clicking outside the modal when `closeOnOutsideClick` is `true` automatically closes the active modal.
- **Scroll lock** - Body scroll is disabled while any modal is open; scrollbar width is compensated via `padding-right` to prevent layout shift.
- **Disable Background** - When a modal with `disableBackground` is open, the app root blocks pointer and keyboard interaction behind the modal.