# @patch-kit/toast

A Toast Engine built with Zustand and React.

This toast focuses on being a purely technical engine — its only job is to handle queuing, placement, auto-dismiss, and lifecycle. The application remains fully in control of every visual decision by providing its own styled component.

**Interactive demo:** [Default](https://xkeexe.github.io/patchkit/?path=/story/toast--default)

---

## Folder contents
- `useToast.tsx` — Zustand store, `createToast` factory, and shared toast types.
- `ToastRenderer.tsx` — Root renderer that portals the toast stack and manages placement.
- `ToastItem.tsx` — Single toast instance with auto-dismiss timer.

## Exports
- `createToast` — Factory that returns a type-locked `useToast` hook and `ToastRenderer`.
- `ToastItemProps` — Props type for your custom toast component.

---

## Usage

### 1. Create your toast instance

Call `createToast` once at the app level with your type union. This locks `T` across both the hook and the renderer.

```ts
// lib/toast.ts
import { createToast } from "@patch-kit/toast";

export const { useToast, ToastRenderer } = createToast<"success" | "error" | "warning">();
```

### 2. Mount the renderer

```tsx
// layout.tsx
import { ToastRenderer } from "@/lib/toast";
import { MyToast } from "@/components/MyToast";

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ToastRenderer component={MyToast} placement="bottom-right" duration={4000} />
    </>
  );
}
```

### 3. Fire toasts from anywhere

```ts
import { useToast } from "@/lib/toast";

const { toast } = useToast();

toast("Saved successfully", "success");
toast("Something went wrong", "error");
```

### 4. Build your component

`ToastItemProps` is typed to the union you passed to `createToast`.

```tsx
// components/MyToast.tsx
import type { ToastItemProps } from "@patch-kit/toast";

export function MyToast({ content, type, closeToast }: ToastItemProps<"success" | "error" | "warning">) {
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
| `component` | `ComponentType<ToastItemProps<T>>` | required | Your styled toast component |
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
const { toast, closeAllToasts } = useToast();

toast(content, type, options?)
```

`T` is already bound from `createToast` — no generic needed at the call site.

Per-toast options override the renderer defaults:

```ts
toast("Uploading…", "warning", { duration: undefined }); // stays until manually closed
```

| Option | Type | Description |
|---|---|---|
| `duration` | `number \| undefined` | Override auto-dismiss. `undefined` = never auto-close |
| `onOpen` | `() => void` | Fired when this specific toast opens |
| `onClose` | `() => void` | Fired when this specific toast closes |
