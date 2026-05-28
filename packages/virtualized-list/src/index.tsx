import React, {
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useCallback,
  memo,
} from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers";
import { VirtualizedListProps, VirtualizedListRef } from "./types";
import { SortableItem } from "./SortableItem";

function VirtualizedListComponent<T, C>(
  props: VirtualizedListProps<T, C>,
  ref: React.Ref<VirtualizedListRef>
) {
  const {
    data,
    ItemComponent,
    context,
    reorder,
    overscan = 250,
    className = "",
    itemClassName = "",
    gap = 0,
    restrictAxis,
    SeparatorComponent,
    showSeparatorAtEnds = false,
    keyExtractor = (_item, index) => index,
    onClick,
    onChange,
    onActiveIndexChange,
    onDragStateChange,
  } = props;

  const listRef = useRef<VirtuosoHandle>(null);
  const activeIndexRef = useRef<number>(0);
  const scrollOffsetRef = useRef<number>(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const sortableIds = useMemo(
    () => data.map((item, index) => keyExtractor(item, index)),
    [data, keyExtractor]
  );

  const handleRangeChanged = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      // Use the middle of the visible range as active index
      const middleIndex = Math.floor((range.startIndex + range.endIndex) / 2);
      activeIndexRef.current = middleIndex;

      // Notify parent component of active index change
      onActiveIndexChange?.(middleIndex, { start: range.startIndex, end: range.endIndex });
    },
    [onActiveIndexChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      onDragStateChange?.(false);
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      if (onChange) {
        const oldIndex = data.findIndex(
          (item, i) => keyExtractor(item, i) === active.id
        );
        const newIndex = data.findIndex(
          (item, i) => keyExtractor(item, i) === over.id
        );

        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
          const updatedData = arrayMove(data, oldIndex, newIndex);

          // Update active index ref after reordering
          if (activeIndexRef.current === oldIndex) {
            activeIndexRef.current = newIndex;
          } else if (activeIndexRef.current !== null) {
            if (oldIndex < activeIndexRef.current &&newIndex >= activeIndexRef.current) {
              activeIndexRef.current = activeIndexRef.current - 1;
            } else if (oldIndex > activeIndexRef.current &&newIndex <= activeIndexRef.current) {
              activeIndexRef.current = activeIndexRef.current + 1;
            }
          }

          onChange(updatedData);
        }
      }
    }, [data, keyExtractor, onChange, onDragStateChange]);

  const dataLength = data.length;

  const itemContent = useCallback(
    (index: number, item: T) => {
      const sortableId = keyExtractor(item, index);

      return (
        <SortableItem
          key={sortableId}
          id={sortableId}
          index={index}
          item={item}
          totalItems={dataLength}
          ItemComponent={ItemComponent}
          context={context}
          disabled={!reorder}
          onClick={onClick}
          itemClassName={itemClassName}
          SeparatorComponent={SeparatorComponent}
          showSeparatorAtEnds={showSeparatorAtEnds}
          gap={gap}
        />
      );
    },
    [dataLength, keyExtractor, ItemComponent, context, reorder, onClick, itemClassName, SeparatorComponent, showSeparatorAtEnds, gap]
  );

  useImperativeHandle(ref, () => ({
    scrollTo: (offset: number) => {
      if (listRef.current) {
        listRef.current.scrollTo({ top: offset });
        scrollOffsetRef.current = offset;
      }
    },
    scrollToRow: (index: number) => {
      if (listRef.current) {
        listRef.current.scrollToIndex({ index, align: "center", behavior: "smooth" });
      }
    },
    getScrollOffset: () => scrollOffsetRef.current,
    getActiveIndex: () => activeIndexRef.current,
    setActiveIndex: (index: number) => {
      activeIndexRef.current = index;
      if (index !== null && listRef.current) {
        listRef.current.scrollToIndex({ index, align: "center", behavior: "smooth" });
      }
    },
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => onDragStateChange?.(true)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => onDragStateChange?.(false)}
      modifiers={
        restrictAxis === "vertical"
          ? [restrictToVerticalAxis]
          : restrictAxis === "horizontal"
          ? [restrictToHorizontalAxis]
          : undefined
      }
    >
      <SortableContext
        items={sortableIds}
        strategy={verticalListSortingStrategy}
      >
        <Virtuoso
          ref={listRef}
          data={data}
          itemContent={itemContent}
          rangeChanged={handleRangeChanged}
          onScroll={(e) => {
            const scrollTop = e?.currentTarget?.scrollTop;
            if(scrollTop !== undefined) scrollOffsetRef.current = scrollTop;
          }}
          className={className}
          overscan={overscan}
        />
      </SortableContext>
    </DndContext>
  );
}

export const VirtualizedList = memo(
  forwardRef(VirtualizedListComponent)
) as <T, C = any>(
  props: VirtualizedListProps<T, C> & { ref?: React.Ref<VirtualizedListRef> }
) => React.ReactElement;

export type { VirtualizedListProps, VirtualizedListRef, ItemComponentProps, SeparatorComponentProps } from './types';
