# @patch-kit/toast

A Toast Engine built with Zustand and React.

This toast focuses on being a purely technical engine — its only job is to handle queuing, placement, auto-dismiss, and lifecycle. The application remains fully in control of every visual decision by providing its own styled component.

**Interactive demo:** [Default](https://xkeexe.github.io/patchkit/?path=/story/toast--default)

---

## Folder contents
- `useToast.tsx` — Zustand store, `useToast` hook, and shared toast types.
- `ToastRenderer.tsx` — Root renderer that portals the toast stack and manages placement.
- `index.tsx` — Single toast instance with auto-dismiss timer.

## Exports
- `useToast` — Hook that exposes `toast`, `closeAllToasts`.
- `ToastRenderer` — Component that renders all active toasts to `document.body`.
- `ToastItemProps` — Props type for your custom toast component.

---

## Usage

```tsx
// 1) Render the engine once, near the app root — pass your own styled component
<ToastRenderer component={MyToast} placement="bottom-right" duration={4000} />

// 2) Fire toasts from anywhere
const { toast } = useToast();

toast("Saved successfully", "success");
toast("Something went wrong", "error");
```

Your component receives `content`, `type`, and `closeToast`:

```tsx
function MyToast({ content, type, closeToast }: ToastItemProps<"success" | "error">) {
  return (
    <div className={type === "error" ? "bg-red-500" : "bg-green-500"}>
      {content}
      <button onClick={closeToast}>✕</button>
    </div>
  );
}
```

---

## `ToastRenderer` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `component` | `ComponentType<ToastItemProps>` | required | Your styled toast component |
| `placement` | `ToastPlacement` | `"bottom-right"` | Where toasts appear on screen |
| `duration` | `number` | `4000` | Auto-dismiss delay in ms |
| `offset` | `number` | `16` | Distance from the screen edge in px |
| `limit` | `number` | — | Max number of toasts visible at once |
| `onOpen` | `() => void` | — | Fired when any toast opens |
| `onClose` | `() => void` | — | Fired when any toast closes |

**Placements:** `top-left` · `top-center` · `top-right` · `bottom-left` · `bottom-center` · `bottom-right`

---

## `useToast`

```ts
const { toast, closeAllToasts } = useToast<"success" | "error">();

toast(content, type, options?)
```

Per-toast options override the renderer defaults:

```ts
toast("Uploading…", "info", { duration: undefined }); // stays until manually closed
```

| Option | Type | Description |
|---|---|---|
| `duration` | `number \| undefined` | Override auto-dismiss. `undefined` = never auto-close |
| `onOpen` | `() => void` | Fired when this specific toast opens |
| `onClose` | `() => void` | Fired when this specific toast closes |
