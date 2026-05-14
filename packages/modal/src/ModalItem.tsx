"use client";

import { useEffect, useRef } from "react";
import { ModalConfig } from "./useModal";

interface ModalItemProps {
  modal: ModalConfig;
  index: number;
  isTopModal: boolean;
  className?: string;
  onClose: (id?: string) => void;
}

export const ModalItem = ({
  modal,
  index,
  isTopModal,
  onClose,
}: ModalItemProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const overlayZIndex = 1100 + index * 2;
  const dialogZIndex = overlayZIndex + 1;

  useEffect(() => {
    if (isTopModal) {
      contentRef.current?.focus();
    }
  }, [isTopModal]);

  return (
    <div
      data-id={modal.id}
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: overlayZIndex }}
      role="dialog"
      aria-modal="true"
      aria-label={modal.options?.ariaLabel}
      aria-describedby={modal.options?.ariaDescribedBy}
    >
      <div
        modal-backdrop=""
        className="absolute inset-0"
        onClick={() => {
          if (modal.options?.closeOnOutsideClick) {
            onClose?.(modal.id);
          }
        }}
      />

      <div
        ref={contentRef}
        tabIndex={-1}
        style={{ zIndex: dialogZIndex, position: "relative", outline: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {modal.content}
      </div>
    </div>
  );
};
