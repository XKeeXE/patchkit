"use client";

import type { ReactNode } from "react";
import { create } from "zustand";

// --- Types & Store (These were correct) ---
export type ModalContent = ReactNode;

export interface ModalOptions {
  id?: string;
  closeOnOutsideClick?: boolean;
  onClose?: () => void;
  animationDuration?: number;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export interface ModalInstance {
  id: string;
  content: ModalContent;
  closeOnOutsideClick: boolean;
  animationDuration: number;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  isClosing?: boolean;
  onClose?: () => void;
}

interface ModalStore {
  modals: ModalInstance[];
  showModal: (content: ModalContent, options?: ModalOptions) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
}

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `modal-${Math.random().toString(36).slice(2, 10)}`;
};

const DEFAULT_ANIMATION_MS = 200;

export const useModalStore = create<ModalStore>((set, get) => ({
  modals: [],
  showModal: (content, options) => {
    const id = options?.id ?? createId();
    const closeOnOutsideClick = options?.closeOnOutsideClick ?? true;
    const onClose = options?.onClose ?? (() => void 0);
    const animationDuration =
      options?.animationDuration ?? DEFAULT_ANIMATION_MS;
    const ariaLabel = options?.ariaLabel;
    const ariaDescribedBy = options?.ariaDescribedBy;

    set((state) => {
      const existingIndex = state.modals.findIndex((m) => m.id === id);
      const nextModal: ModalInstance = {
        id,
        content,
        onClose,
        closeOnOutsideClick,
        animationDuration,
        ariaLabel,
        ariaDescribedBy,
      };

      if (existingIndex !== -1) {
        const updated = [...state.modals];
        updated[existingIndex] = nextModal;
        return { modals: updated };
      }

      return { modals: [...state.modals, nextModal] };
    });

    return id;
  },
  closeModal: (id) => {
    const currentModals = get().modals;
    const target = id
      ? currentModals.find((modal) => modal.id === id)
      : currentModals[currentModals.length - 1];

    if (!target || target.isClosing) return;

    if (target.animationDuration <= 0) {
      target.onClose?.();
      set((state) => ({
        modals: state.modals.filter((modal) => modal.id !== target.id),
      }));
      return;
    }

    target.onClose?.();

    set((state) => ({
      modals: state.modals.map((modal) =>
        modal.id === target.id ? { ...modal, isClosing: true } : modal
      ),
    }));

    window.setTimeout(() => {
      set((state) => ({
        modals: state.modals.filter(
          (modal) => !(modal.id === target.id && modal.isClosing)
        ),
      }));
    }, target.animationDuration);
  },
  closeAllModals: () => {
    const currentModals = get().modals;
    currentModals.forEach((modal) => {
      get().closeModal(modal.id);
    });
  },
}));

export const useModal = () => {
  const { showModal, closeModal, closeAllModals } = useModalStore();
  return { showModal, closeModal, closeAllModals };
};
