"use client";

import { createPortal } from "react-dom";
import { useIsClient } from "@patch-kit/utils";
import { usePopoverStore } from "./usePopover";
import Popover from "./";

export const PopoverRenderer = () => {
  const popovers = usePopoverStore((state) => state.popovers);
  const isClient = useIsClient();

  if (!isClient) return null;

  return createPortal(
    <>
      {popovers.map((popover) => (
        <Popover key={popover.id} popover={popover} />
      ))}
    </>,
    document.body
  );
};
