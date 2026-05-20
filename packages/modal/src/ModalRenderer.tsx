"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "./";
import { useModal, useModalStore } from "./useModal";

interface ModalRendererProps {
  root?: HTMLElement | string;
  closeKey?: string | string[];
}

/**
 * An orchestrator that is a single state manager for all modals. 
 * This manages what modal should be the main focus while managing how the modal itself behaves.
 */
export const ModalRenderer = ({ root, closeKey = "Escape" }: ModalRendererProps) => {
  const modals = useModalStore((state) => state.modals);
  const { closeModal } = useModal();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  // Prevent scrolling the background element
  const hasModals = modals.length > 0;
  useEffect(() => {
    if (hasModals) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const computedPaddingRight = Number.parseFloat(
        window.getComputedStyle(document.body).paddingRight
      );
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        const nextPaddingRight = (computedPaddingRight || 0) + scrollbarWidth;
        document.body.style.paddingRight = `${nextPaddingRight}px`;
      } else {
        document.body.style.paddingRight = originalPaddingRight;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [hasModals]);

  // Disable interactions of the app, excluding the Modal
  useEffect(() => {
    const shouldDisable = hasModals && modals.some((m) => m.options?.disableBackground);

    const appRoot =
      typeof root === "string"
        ? (document.querySelector(root) as HTMLElement | null)
        : root ?? (document.body.firstElementChild as HTMLElement | null);

    if (!appRoot) return;

    if (shouldDisable) {
      appRoot.setAttribute("inert", "");
      return () => appRoot.removeAttribute("inert");
    }
  }, [hasModals, modals, root]);

  // Escape Key implementation
  useEffect(() => {
    const keys = Array.isArray(closeKey) ? closeKey : [closeKey];
    const onKeyDown = (event: KeyboardEvent) => {
      if (keys.includes(event.key) && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        if (topModal.options?.closeOnOutsideClick) {
          closeModal();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modals, closeModal, closeKey]);

  if (!isClient) return null;

  return createPortal(
    <>
      {modals.map((modal, index) => {
        const isDisabled = modals
          .slice(index + 1)
          .some((m) => m.options?.disableBackground);

        return (
          <Modal
            key={modal.id}
            modal={modal}
            index={index}
            isTopModal={index === modals.length - 1}
            inert={isDisabled}
            onClose={closeModal}
          />
        );
      })}
    </>,
    document.body
  );
};
