# History Manager

A self-contained undo/redo system for using the Command Pattern.

**Interactive demo:** [Default](https://xkeexe.github.io/patchkit/?path=/story/history--default)

---

## Overview

Each user action is recorded as a command with `undo()` and `redo()` functions, enabling full history traversal. The factory pattern ensures each history instance is independently scoped and fully typed.

Example usage

---

## Setup

Call `createHistory()` once at module level and export the bound pair. Both `HistoryProvider` and `useHistory` must come from the same call — they share the same context instance.

```typescript
import { createHistory } from '@patch-kit/history';

export const { HistoryProvider, useHistory } = createHistory();
```

For multiple independent history stacks, each call creates its own isolated instance:

```typescript
export const { HistoryProvider: HistoryA, useHistory: useHistoryA } = createHistory();
export const { HistoryProvider: HistoryB, useHistory: useHistoryB } = createHistory();
```

---

## Basic Usage

```tsx
<HistoryProvider>
  <App />
</HistoryProvider>
```

```typescript
const { addHistory, undo, redo, canUndo, canRedo } = useHistory();

addHistory({
  name: 'History Command',
  undo() {
    // Undoes the action (called on undo)
  }
  redo() {
    // Re-applies the action (called on redo)
  },
});
```

### `immediate`

Pass `true` as the second argument to apply the action immediately on record, instead of applying it manually beforehand:

```typescript
// without immediate — apply manually first, then record
applyChange(next);
addHistory({ undo: () => applyChange(prev), redo: () => applyChange(next) });

// with immediate — record and apply in one call
addHistory({ undo: () => applyChange(prev), redo: () => applyChange(next) }, true);
```

---

## Typed Return Values

Commands can return a value from `undo()` and `redo()`. When they do, the Provider's `onUndo`/`onRedo` callbacks receive that value — letting you centralise any shared logic that would otherwise be repeated at every call site.

```typescript
type HistoryValue = { type: string; payload: unknown };

export const { HistoryProvider, useHistory } = createHistory<HistoryValue>();
```

```tsx
<HistoryProvider
  onUndo={(value) => { /* handle value centrally */ }}
  onRedo={(value) => { /* handle value centrally */ }}
>
  <App />
</HistoryProvider>
```

```typescript
addHistory({
  name: 'Update',
  undo() { return { type: 'update', payload: previous }; },
  redo() { return { type: 'update', payload: next }; }
});
```

If no return value is needed, `undo()` and `redo()` can be void — `onUndo`/`onRedo` are optional and only relevant when commands return data.

---

## API

### `createHistory<T = any>()`

Factory function. Call at module level, outside any component.

Returns `{ HistoryProvider, useHistory }` bound to the same context instance.

### `<HistoryProvider>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `limit` | `number` | `64` | Max number of history entries |
| `onUndo` | `(value: T) => void` | — | Called after `undo()` with its return value |
| `onRedo` | `(value: T) => void` | — | Called after `redo()` with its return value |

### `useHistory()`

Must be called inside the matching `HistoryProvider`.

```typescript
const {
  addHistory,   // (command: Command<T>, immediate?: boolean) => void
  undo,         // () => void
  redo,         // () => void
  resetHistory, // () => void
  canUndo,      // boolean
  canRedo,      // boolean
} = useHistory();
```

### `Command<T>`

```typescript
type Command<T = any> = {
  name: string;
  undo: () => T;  // return value passed to onUndo
  redo: () => T;  // return value passed to onRedo
}
```

---

## Patterns

### Capture state before mutating

Always snapshot the previous state before applying the change:

```typescript
const previous = structuredClone(item);
applyChange(next);

addHistory({
  name: 'Update',
  undo() { applyChange(previous); },
  redo() { applyChange(next); }
});
```

### Batch related operations

Multiple related changes should be a single history entry:

```typescript
// ✅ one entry, one undo
addHistory({
  name: `Move ${ids.length} items`,
  undo() { ids.forEach(id => move(id, prevPos[id])); },
  redo() { ids.forEach(id => move(id, nextPos[id])); }
});

// ❌ N entries, N undos
ids.forEach(id => addHistory({ ... }));
```

### Delayed commit (drag, resize, etc.)

For continuous interactions, accumulate changes and commit once on release:

```typescript
const pending = useRef({ initial: null, final: null });

onDragStart(() => { pending.current.initial = getPosition(); });
onDragMove((pos) => { pending.current.final = pos; });
onDragEnd(() => {
  const { initial, final } = pending.current;
  addHistory({
    name: 'Move',
    undo() { setPosition(initial); },
    redo() { setPosition(final); }
  });
});
```

Updating state on every move event causes re-renders that feed back into the drag — commit once at the end instead.

---