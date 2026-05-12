import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableItemProps } from "./types";

const SortableItemComponent = <T, C>({
  id,
  index,
  item,
  totalItems,
  disabled = false,
  itemClassName = "",
  gap = 0,
  ItemComponent,
  context,
  SeparatorComponent,
  showSeparatorAtEnds,
  onClick,
}: SortableItemProps<T, C>) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const isFirst = index === 0;
  const isLast  = index === totalItems - 1;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? "default" : isDragging ? "grabbing" : "pointer",
    ...(!SeparatorComponent ? { paddingTop: gap / 2, paddingBottom: gap / 2 } : undefined),
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && onClick && !transform) {
      onClick(item, index);
    }
  };

  const showHead = SeparatorComponent && showSeparatorAtEnds && isFirst;
  const showLast = SeparatorComponent && !isDragging && (!isLast || showSeparatorAtEnds);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={`outline-none focus:outline-none ${itemClassName}`}
      data-item-index={index}
      {...attributes}
      {...(disabled ? {} : listeners)}
    >
      {showHead && <SeparatorComponent index={0} isFirst={true} isLast={false}/>}
      <ItemComponent 
        item={item} 
        index={index} 
        isDragging={isDragging} 
        context={context} 
      />
      {showLast && <SeparatorComponent index={index + 1} isFirst={false} isLast={true}/>}
    </div>
  );
};

export const SortableItem = memo(SortableItemComponent) as typeof SortableItemComponent;