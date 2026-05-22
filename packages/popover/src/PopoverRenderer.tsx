"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePopoverStore } from "./usePopover";
import Popover from "./";

export const PopoverRenderer = () => {
  const popovers = usePopoverStore((state) => state.popovers);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

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
