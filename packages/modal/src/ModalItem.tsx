"use client";

import { useEffect, useRef } from "react";
import { ModalConfig } from "./useModal";

interface ModalItemProps {
  modal: ModalConfig;
  index: number;
  isTopModal: boolean;
  isDisabled: boolean;
  className?: string;
  onClose: (id?: string) => void;
}

export const ModalItem = ({
  modal,
  index,
  isTopModal,
  isDisabled,
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
      style={{
        zIndex: overlayZIndex,
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={modal.options?.ariaLabel}
      aria-describedby={modal.options?.ariaDescribedBy}
      {...(isDisabled ? { inert: "" } : {})}
    >
      <div
        modal-backdrop=""
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
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
