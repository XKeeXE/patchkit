"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ModalItem } from "./ModalItem";
import { useModal, useModalStore } from "./useModal";

interface ModalRendererProps {
  root?: HTMLElement | string;
}

export const ModalRenderer = ({ root }: ModalRendererProps) => {
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
    const appRoot =
      typeof root === "string"
        ? (document.querySelector(root) as HTMLElement | null)
        : root ?? (document.body.firstElementChild as HTMLElement | null);

    if (!appRoot) return;

    if (hasModals) {
      appRoot.setAttribute("inert", "");
      return () => appRoot.removeAttribute("inert");
    }
  }, [hasModals, root]);

  // Escape Key implementation
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        if (topModal.options?.closeOnOutsideClick) {
          closeModal();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modals, closeModal]);

  if (!isClient) return null;

  return createPortal(
    <>
      {modals.map((modal, index) => (
        <ModalItem
          key={modal.id}
          modal={modal}
          index={index}
          isTopModal={index === modals.length - 1}
          onClose={closeModal}
        />
      ))}
    </>,
    document.body
  );
};
