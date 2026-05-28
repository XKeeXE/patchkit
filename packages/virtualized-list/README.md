# VirtualizedList Component System

A highly optimized, type-agnostic list component with drag-and-drop reordering capabilities. Designed for maximum React performance when rendering large collections of data.

## Overview

The VirtualizedList system provides a generic, reusable list component that efficiently renders arrays of items. It uses a **Component-Prop Architecture** (passing a Component reference rather than an inline render function) to guarantee stable memory references, preventing React from unnecessarily re-rendering massive lists.

## Architecture

```
VirtualizedList/
├── index.ts              # Main exports - import from here
├── types.ts              # TypeScript interfaces and types
├── README.md             # This documentation
├── VirtualizedList.tsx   # Core list component with drag-and-drop
└── SortableItem.tsx      # Individual item wrapper with order tracking
```

## Core Components

### VirtualizedList

The main container component that renders a scrollable list with optional drag-and-drop reordering.

> ⚠️ **Critical Concept: Data vs. Context**
>
> To achieve maximum performance, this component strictly separates your data into two channels:
> - **`data`**: The array of unique items. Only changes if items are added, removed, or modified.
> - **`context`**: A shared object containing callbacks, global state, or rules that every row uses (e.g., `onItemClick`, `currentTheme`, `mode`).

```tsx
<VirtualizedList
  data={items}
  ItemComponent={CustomItemRow}
  context={listContext}
  keyExtractor={keyExtractor}
  reorder={true}
  onChange={handleReorder}
  SeparatorComponent={CustomSeparator}
/>
```

**Props:**

* `data: T[]` - Array of unique items to display
* `ItemComponent: React.ComponentType<ItemComponentProps<T, C>>` - A memoized React Component used to render each row
* `context?: C` - A stable (memoized) object containing shared callbacks or state for all rows
* `keyExtractor?: (item: T, index: number) => string | number` - Unique key generator (defaults to index)
* `reorder?: boolean` - Enable drag-and-drop reordering
* `onChange?: (updatedData: T[]) => void` - Callback when list order changes
* `onClick?: (item: T, index: number) => void` - Callback when an item container is clicked
* `onActiveIndexChange?: (activeIndex: number, visibleRange: { start: number; end: number }) => void` - Fires when the center of the visible range changes
* `onDragStateChange?: (isDragging: boolean) => void` - Fires when a drag starts or ends
* `gap?: number` - Spacing between items in pixels
* `overscan?: number` - Number of pixels to render beyond the visible area (default `250`)
* `className?: string` - Custom CSS classes for the container
* `itemClassName?: string` - Custom CSS classes for each item wrapper
* `SeparatorComponent?: React.ComponentType<SeparatorComponentProps>` - A memoized component rendered between items
* `showSeparatorAtEnds?: boolean` - If true, renders the SeparatorComponent before the first item and after the last item
* `restrictAxis?: "vertical" | "horizontal"` - Constrain drag movement to one axis

### SortableItem

Internal wrapper that manages individual item rendering and drag-and-drop behavior. Wrapped in `React.memo` so each row bails out of the render cycle independently — when you click one item or drag another, only the affected rows re-render. The rest of the list remains frozen in memory.

## Performance Best Practices

### The Blast Radius Rule

Every piece of state you put in `context` has a **blast radius**: when it changes, every visible row re-renders. For stable callbacks this cost is zero — the reference never changes. For volatile state (anything that changes at runtime), the cost multiplies across every row in the list.

This means `context` and direct state subscriptions inside `ItemComponent` serve fundamentally different purposes:

| Channel | Use for | Re-render blast radius |
|---------|---------|----------------------|
| `context` | Stable callbacks (`onClick`, `onRightClick`) | Zero — reference never changes |
| Direct subscription inside `ItemComponent` | Volatile state (`scale`, `selectedId`, per-row data) | Pinpoint — only the rows whose slice actually changed |

**The canonical failure case — putting volatile state in `context`:**

```tsx
// ❌ Volatile state in context: one item's data changes, the context object
// rebuilds, and every visible row re-renders — even those that didn't change.
const context = useMemo(() => ({
  itemsById,               // ← volatile Map, new reference on every mutation
  scale,                   // ← changes on every zoom event
  onRightClick: handler,   // ✅ stable callback, fine here
}), [itemsById, scale, handler]);
```

```tsx
// ✅ Volatile state subscribed directly inside the row with a pinpoint selector.
// The state manager compares per-row — only the affected row re-renders.
const MyRow = memo(({ item, context }: ItemComponentProps<Item, RowContext>) => {
  const scale = useMyStore((state) => state.ui.scale);
  const rowData = useMyStore(
    useCallback((state) => state.data.itemsById.get(item.id) ?? null, [item.id])
  );
  // context only carries stable callbacks
});
```

### Decision Checklist

Before adding anything to `context`, ask: *"Does this value change at runtime?"*

- **Stable callbacks** (`onClick`, `onRightClick`, imperative refs) → **`context`**
- **Global volatile state** (`scale`, `mode`, `selectedId`) → **Subscribe directly inside `ItemComponent`**
- **Per-row volatile state** (data keyed to this row's ID) → **Pinpoint selector keyed to `item.id`** inside `ItemComponent`

### Additional Rules

| How | Why |
|-----|-----|
| Never use inline arrow functions for `ItemComponent` or `SeparatorComponent` | Inline definitions create a new reference on every render, defeating `React.memo` |
| Always wrap your `ItemComponent` in `React.memo` | Prevents re-renders when unchanged props flow through |
| Always wrap your `context` object in `useMemo` | A new object reference on every render will invalidate all rows |
| Use `useCallback` for `keyExtractor` | Same reason — unstable function reference breaks the dependency chain |

## Ref Methods

The VirtualizedList exposes imperative methods through refs for programmatic control:

```tsx
const listRef = useRef<VirtualizedListRef>(null);

// Scroll to a specific pixel offset
listRef.current?.scrollTo(500);

// Scroll to a specific row index (smooth, centers the row)
listRef.current?.scrollToRow(15);

// Get the last known scroll offset
const offset = listRef.current?.getScrollOffset();

// Get the index at the center of the currently visible range
const activeIndex = listRef.current?.getActiveIndex();

// Set the active item and scroll it into view
listRef.current?.setActiveIndex(2);
```

**Available Methods:**

* `scrollTo(offset: number)` - Scroll to a specific pixel offset
* `scrollToRow(index: number)` - Smooth-scroll a row index into the center of the viewport
* `getScrollOffset()` - Returns the last recorded scroll position in pixels
* `getActiveIndex()` - Returns the index at the center of the currently visible range
* `setActiveIndex(index: number)` - Sets the active index and smooth-scrolls it into view

## TypeScript Support

Full TypeScript support with generics for both row data (`T`) and shared context (`C`):

```typescript
// The props injected into your custom ItemComponent
export interface ItemComponentProps<T, C = any> {
  item: T;
  index: number;
  isDragging?: boolean;
  context?: C;
}

// The props injected into your custom SeparatorComponent
export interface SeparatorComponentProps {
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface VirtualizedListProps<T, C = any> {
  data: T[];
  ItemComponent: React.ComponentType<ItemComponentProps<T, C>>;
  context?: C;
  reorder?: boolean;
  overscan?: number;
  onChange?: (updatedData: T[]) => void;
  onClick?: (item: T, index: number) => void;
  onActiveIndexChange?: (activeIndex: number, visibleRange: { start: number; end: number }) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
  itemClassName?: string;
  gap?: number;
  SeparatorComponent?: React.ComponentType<SeparatorComponentProps>;
  showSeparatorAtEnds?: boolean;
  restrictAxis?: "vertical" | "horizontal";
}

export interface VirtualizedListRef {
  scrollTo: (offset: number) => void;
  scrollToRow: (index: number) => void;
  getScrollOffset: () => number;
  getActiveIndex: () => number;
  setActiveIndex: (index: number) => void;
}
```

## Installation

```bash
npm install @patch-kit/virtualized-list
```

All dependencies are bundled — no additional installs required.
