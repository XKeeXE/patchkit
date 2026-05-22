"use client";

import { useEffect, useRef, useState } from "react";
import { POPOVER_DEFAULTS, PopoverConfig, PopoverOptions, usePopoverStore } from "./usePopover";

interface PopoverProps {
  popover: PopoverConfig;
}

const VIEWPORT_PADDING = 10;

const Popover = ({ popover }: PopoverProps) => {
  const closePopover = usePopoverStore((state) => state.closePopover);
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [adjustedPosition, setAdjustedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const options = { ...POPOVER_DEFAULTS, ...popover.options };
  const { placement, gap, closeOnOutsideClick } = options as Required<PopoverOptions>;
  const { autoCloseDelay } = options;
  const { trigger, container } = options.safeZone ?? {};
  const anchor = popover.anchor;

  // Positioning — runs after mount when the popover size is known.
  useEffect(() => {
    const element = popoverRef.current;
    if (!element) return;

    const { width: pw, height: ph } = element.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Compute ideal position for each placement relative to the trigger rect
    const positions = {
      bottom: {
        x: anchor.left + anchor.width / 2 - pw / 2,
        y: anchor.bottom + gap,
      },
      top: {
        x: anchor.left + anchor.width / 2 - pw / 2,
        y: anchor.top - ph - gap,
      },
      left: {
        x: anchor.left - pw - gap,
        y: anchor.top + anchor.height / 2 - ph / 2,
      },
      right: {
        x: anchor.right + gap,
        y: anchor.top + anchor.height / 2 - ph / 2,
      },
    };

    // Smart flip if the preferred placement clips the viewport
    let resolved: "top" | "left" | "bottom" | "right" = placement;
    if (
      placement === "bottom" &&
      positions.bottom.y + ph > vh - VIEWPORT_PADDING
    )
      resolved = "top";
    else if (placement === "top" && positions.top.y < VIEWPORT_PADDING)
      resolved = "bottom";
    else if (
      placement === "right" &&
      positions.right.x + pw > vw - VIEWPORT_PADDING
    )
      resolved = "left";
    else if (placement === "left" && positions.left.x < VIEWPORT_PADDING)
      resolved = "right";

    let { x, y } = positions[resolved];

    // Final clamp — never clip any viewport edge
    x = Math.max(VIEWPORT_PADDING, Math.min(x, vw - pw - VIEWPORT_PADDING));
    y = Math.max(VIEWPORT_PADDING, Math.min(y, vh - ph - VIEWPORT_PADDING));

    setAdjustedPosition({ x, y });
  }, [anchor, placement, gap]);

  // Safe zone mouse tracking
  useEffect(() => {
    if (autoCloseDelay === undefined) return;

    const el = popoverRef.current;
    if (!el) return;

    const clearTimer = () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };

    const startTimer = () => {
      clearTimer();
      autoCloseTimerRef.current = setTimeout(() => {
        closePopover(popover.id);
      }, autoCloseDelay);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const related = e.relatedTarget as Node | null;

      const inTrigger = trigger?.contains(related) ?? false;
      const inContainer = container?.contains(related) ?? false;

      if (inTrigger || inContainer) return;

      startTimer();
    };

    const handleMouseEnter = () => clearTimer();

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave as EventListener);

    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      clearTimer();
    };
  }, [autoCloseDelay, popover.id, trigger, container, closePopover]);

  // Container leave — close all if cursor leaves the container entirely
  useEffect(() => {
    if (!container) return;

    const handleContainerLeave = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (related?.closest("[data-popover]")) return;

      setTimeout(() => closePopover(popover.id), 100);
    };

    container.addEventListener(
      "mouseleave",
      handleContainerLeave as EventListener,
    );
    return () =>
      container.removeEventListener(
        "mouseleave",
        handleContainerLeave as EventListener,
      );
  }, [container, popover.id, closePopover]);

  // Outside click
  useEffect(() => {
    if (!closeOnOutsideClick) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      const allPopovers = document.querySelectorAll("[data-popover]");
      const insideAny = Array.from(allPopovers).some((el) =>
        el.contains(target),
      );
      if (insideAny) return;

      const insideTrigger = trigger?.contains(target) ?? false;
      const insideContainer = container?.contains(target) ?? false;
      if (insideTrigger || insideContainer) return;

      closePopover(popover.id);
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [
    popover.id,
    closeOnOutsideClick,
    trigger,
    container,
    closePopover,
  ]);

  return (
    <div
      ref={popoverRef}
      data-popover={popover.id}
      style={{
        position: "fixed",
        top: adjustedPosition?.y ?? 0,
        left: adjustedPosition?.x ?? 0,
        visibility: adjustedPosition ? "visible" : "hidden",
        zIndex: 999,
      }}
    >
      {popover.content}
    </div>
  );
};

export default Popover;
export { usePopover } from "./usePopover";
export { PopoverRenderer } from "./PopoverRenderer";
export type { PopoverOptions } from "./usePopover";
