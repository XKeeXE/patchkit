# PatchKit

A collection of technical React utilities. This overall package aims to reduce the need of manually managing / set-up of various UI behaviors such as positioning, stacking, lifecycle, and state. These packages are aimed to only manage the technical side of the spectrum; the projects that use these packages are obligated to define their own stylized component as this does not introduce any.

**[Interactive demo →](https://xkeexe.github.io/patchkit/)**

---

## Packages

| Package | Description | Version |
|---|---|---|
| [`@patch-kit/popover`](#patch-kitpopover) | Popover Engine | ![npm](https://img.shields.io/npm/v/@patch-kit/popover) |
| [`@patch-kit/modal`](#patch-kitmodal) | Modal Engine | ![npm](https://img.shields.io/npm/v/@patch-kit/modal) |
| [`@patch-kit/toast`](#patch-kittoast) | Toast Engine | ![npm](https://img.shields.io/npm/v/@patch-kit/toast) |
| [`@patch-kit/history`](#patch-kithistory) | History Command Pattern | ![npm](https://img.shields.io/npm/v/@patch-kit/history) |
| [`@patch-kit/virtualized-list`](#patch-kitvirtualized-list) | Virtualized list with drag-and-drop | ![npm](https://img.shields.io/npm/v/@patch-kit/virtualized-list) |

---

## `@patch-kit/popover`

Popover engine with smart viewport-aware positioning, automatic flip, safe zones, and auto-close.

```tsx
import { PopoverRenderer, usePopover } from "@patch-kit/popover";

// App root
<PopoverRenderer />

// Anywhere
const { showPopover } = usePopover();

showPopover(ref.current.getBoundingClientRect(), <MyContent />, { ... });
```
---

## `@patch-kit/modal`

Modal engine with backdrop, focus management, and outside-click close.

```bash
npm install @patch-kit/modal
```

```tsx
import { ModalRenderer, useModal } from "@patch-kit/modal";

// App root
<ModalRenderer />

// Anywhere
const { showModal, closeModal } = useModal();

showModal(<MyModalContent />, { ... });
```

---

## `@patch-kit/toast`

Toast engine with queuing, placement, and auto-dismiss.

```bash
npm install @patch-kit/toast
```

```tsx
import { ToastRenderer, useToast } from "@patch-kit/toast";

// App root — pass your own toast component
<ToastRenderer component={MyToast} { ... } />

// Anywhere
const { toast } = useToast();

toast("Saved successfully", "success");
```

---

## `@patch-kit/history`

History manager based on the Command pattern. Scoped per provider — supports multiple independent histories.

```bash
npm install @patch-kit/history
```

```tsx
import { createHistory } from "@patch-kit/history";

const { HistoryProvider, useHistory } = createHistory();

// Wrap your feature
<HistoryProvider { ... }>
  <MyEditor />
</HistoryProvider>

// Inside
const { addHistory, undo, redo, canUndo, canRedo } = useHistory();

addHistory({ name: "edit", undo: () => prev, redo: () => next }, ...);
```

---

## `@patch-kit/virtualized-list`

Virtualized list with drag-and-drop reordering powered by `react-virtuoso` and `dnd-kit`. Generic typed.

```bash
npm install @patch-kit/virtualized-list
```

```tsx
import { VirtualizedList } from "@patch-kit/virtualized-list";

<VirtualizedList
  data={items}
  ItemComponent={MyRow}
  reorder
  onChange={setItems}
  keyExtractor={(item) => item.id}
/>
```

**Props:** `data`, `ItemComponent`, `context`, `reorder`, `onChange`, `gap`, `restrictAxis`, `SeparatorComponent`, `onActiveIndexChange`, `onDragStateChange`
