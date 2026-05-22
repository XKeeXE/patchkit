import type { Meta, StoryObj } from "@storybook/react";
import { usePopover } from "@patch-kit/popover";
import {
  Panel,
  MenuItem,
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

const Content = ({ items }: { items: (string | null)[] }) => (
  <Panel className="py-1 min-w-40">
    {items.map((item, i) =>
      item === null ? (
        <div key={i} className="h-px bg-zinc-200 my-1" />
      ) : (
        <MenuItem key={`${item}-${i}`} label={item} />
      ),
    )}
  </Panel>
);

const Trigger = (args: StoryArgs) => {
  const { showPopover } = usePopover();
  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        showPopover(
          new DOMRect(e.clientX, e.clientY, 0, 0),
          <Content items={args.contextItems} />,
          {
            id: "context-menu",
            ...pickOptions(args),
          },
        );
      }}
      className="w-[50vw] h-[50vh] border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-zinc-400 text-sm select-none"
    >
      Right-click anywhere
    </div>
  );
};

export const ContextMenu: StoryObj<StoryArgs> = {
  argTypes: {
    contextItems: SHOW,
  },
  render: (args) => <Trigger {...args} />,
};
