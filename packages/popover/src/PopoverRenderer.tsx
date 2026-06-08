"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useIsClient, windowHistory, ROUTE_EVENT } from "@patch-kit/utils";
import { usePopoverStore } from "./usePopover";
import Popover from "./";

export const PopoverRenderer = () => {
  const popovers = usePopoverStore((state) => state.popovers);
  const closeAllPopovers = usePopoverStore((state) => state.closeAllPopovers);
  const isClient = useIsClient();

  useEffect(() => {
    windowHistory();
    const handler = () => closeAllPopovers();
    window.addEventListener("popstate", handler);
    window.addEventListener(ROUTE_EVENT, handler);
    return () => {
      window.removeEventListener("popstate", handler);
      window.removeEventListener(ROUTE_EVENT, handler);
    };
  }, [closeAllPopovers]);

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
