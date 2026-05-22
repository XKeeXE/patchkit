"use client";

import type { ReactNode } from "react";
import { create } from "zustand";

export interface PopoverConfig {
  id: string;
  anchor: DOMRect;
  content: ReactNode;
  options?: Omit<PopoverOptions, "id">
}

export type PopoverOptions = {
  id?: string
  parentId?: string;
  placement?: "top" | "left" | "bottom" | "right";
  gap?: number;
  safeZone?: {
    trigger?: HTMLElement | null;
    container?: HTMLElement | null;
  };
  toggable?: boolean;
  autoCloseDelay?: number;
  closeOnOutsideClick?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

interface PopoverStore {
  popovers: PopoverConfig[];
  showPopover: (
    anchor: DOMRect,
    content: ReactNode,
    options?: PopoverOptions,
  ) => void;
  closePopover: (id?: string) => void;
  closeAllPopovers: () => void;
}

export const POPOVER_DEFAULTS: PopoverOptions = {
  closeOnOutsideClick: true,
  placement: "bottom",
  gap: 4,
};

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `popover-${Math.random().toString(36).slice(2, 10)}`;
};

export const usePopoverStore = create<PopoverStore>((set, get) => ({
  popovers: [],
  showPopover: (anchor, content, options) => {
    let isNew = false;
    const id = options?.id ?? createId();
    const resolved: PopoverConfig = {
      id,
      anchor,
      content,
      options: {
        ...POPOVER_DEFAULTS,
        ...options,
      },
    };

    set((state) => {
      const existingIndex = state.popovers.findIndex((p) => p.id === id);
      if (existingIndex !== -1) {
        const updated = [...state.popovers];
        updated[existingIndex] = resolved;
        return { popovers: updated };
      }
      isNew = true;
      return { popovers: [...state.popovers, resolved] };
    });

    if (isNew) {
      resolved.options?.onOpen?.();
    } else {
      if (resolved.options?.toggable) get().closePopover(id);
    }
  },

  closePopover: (id) => {
    const { popovers } = get();
    const target = id
      ? popovers.find((p) => p.id === id)
      : popovers[popovers.length - 1];

    if (!target) return;

    const children = popovers.filter((p) => p.options?.parentId === target.id);
    children.forEach((child) => get().closePopover(child.id));

    target.options?.onClose?.();
    set((state) => ({
      popovers: state.popovers.filter((p) => p.id !== target.id),
    }));
  },

  closeAllPopovers: () => {
    const { popovers } = get();
    popovers.forEach((p) => p.options?.onClose?.());
    set({ popovers: [] });
  },
}));

export const usePopover = () => {
  const { showPopover, closePopover, closeAllPopovers } = usePopoverStore();
  return { showPopover, closePopover, closeAllPopovers };
};
