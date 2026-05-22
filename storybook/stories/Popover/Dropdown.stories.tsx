import React, { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { usePopover } from "@patch-kit/popover";
import {
  Panel,
  MenuItem,
  StoryArgs,
  sharedArgs,
  sharedArgTypes,
  SHOW,
  DropdownItem,
  pickOptions,
} from "./.shared";

const meta: Meta<StoryArgs> = {
  title: "POPOVER",
  args: sharedArgs,
  argTypes: sharedArgTypes,
};

export default meta;

const DROPDOWN_ID = "dropdown";
const SUBMENU_ID = "submenu";

const SubContent = ({ items }: { items: string[] }) => (
  <Panel className="py-1 min-w-35">
    {items.map((item) => (
      <MenuItem key={item} label={item} />
    ))}
  </Panel>
);

const Content = ({
  items,
  submenuItems,
}: {
  items: DropdownItem[];
  submenuItems: string[];
}) => {
  const { showPopover } = usePopover();

  return (
    <Panel className="py-1 min-w-45">
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="h-px bg-zinc-200 my-1" />
        ) : (
          <MenuItem
            key={item.label}
            label={item.label}
            onMouseEnter={(e) => {
              if (item.submenu) {
                showPopover(
                  e.currentTarget.getBoundingClientRect(),
                  <SubContent items={submenuItems} />,
                  {
                    id: SUBMENU_ID,
                    parentId: DROPDOWN_ID,
                    placement: "right",
                    autoCloseDelay: 150,
                    safeZone: { trigger: e.currentTarget },
                  },
                );
              }
            }}
          />
        ),
      )}
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
          <Content
            items={args.dropdownItems}
            submenuItems={args.submenuItems}
          />,
          {
            id: DROPDOWN_ID,
            safeZone: {
              trigger: ref.current,
            },
            ...pickOptions(args),
          },
        );
      }}
      className="px-6 py-2.5 rounded-lg border border-gray-300 cursor-pointer text-[15px] bg-white hover:bg-gray-50 transition-colors"
    >
      Open Dropdown
    </button>
  );
};

export const Dropdown: StoryObj<StoryArgs> = {
  argTypes: {
    dropdownItems: SHOW,
    submenuItems: SHOW,
  },
  render: (args) => <Trigger {...args} />,
};
