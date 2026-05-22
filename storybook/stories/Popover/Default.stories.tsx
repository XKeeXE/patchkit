import React, { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { usePopover } from "@patch-kit/popover";
import {
  Panel,
  StoryArgs,
  sharedArgs,
  sharedArgTypes,
  SHOW,
  pickOptions,
} from "./.shared";

const meta: Meta<StoryArgs> = {
  title: "POPOVER",
  args: sharedArgs,
  argTypes: sharedArgTypes,
};

export default meta;

const Content = ({ message }: { message: string }) => {
  const { closePopover } = usePopover();
  return (
    <Panel className="flex flex-col gap-2.5 min-w-50 p-4">
      <p className="m-0">{message}</p>
      <button
        onClick={() => closePopover()}
        className="self-end px-3.5 py-1 rounded-md bg-zinc-900 text-white cursor-pointer text-[13px] border-none hover:bg-zinc-700 transition-colors"
      >
        Dismiss
      </button>
    </Panel>
  );
};

const Trigger = (args: StoryArgs) => {
  const { showPopover } = usePopover();
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      onClick={() => {
        showPopover(
          ref.current!.getBoundingClientRect(),
          <Content message={args.message} />,
          {
            id: "default-popover",
            safeZone: {
              trigger: ref.current,
            },
            ...pickOptions(args),
          },
        );
      }}
      className="px-6 py-2.5 rounded-lg border border-gray-300 cursor-pointer text-[15px] bg-white hover:bg-gray-50 transition-colors"
    >
      Open Popover
    </button>
  );
};

export const Default: StoryObj<StoryArgs> = {
  argTypes: {
    message: SHOW,
  },
  render: (args) => <Trigger {...args} />,
};
