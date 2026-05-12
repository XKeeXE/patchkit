export interface ItemComponentProps<T, C = any> {
  item: T;
  index: number;
  isDragging?: boolean;
  context?: C;
}

export interface SeparatorComponentProps {
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

export interface VirtualizedListProps<T, C> {
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

export interface SortableItemProps<T, C = any> extends Pick<VirtualizedListProps<T, C>, 'ItemComponent' | 'context' | 'onClick' | 'itemClassName' | 'gap' | 'SeparatorComponent'> {
  id: string | number;
  index: number;
  item: T;
  disabled?: boolean;
  totalItems: number;
  showSeparatorAtEnds: boolean;
}