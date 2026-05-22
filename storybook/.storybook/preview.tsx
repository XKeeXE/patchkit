import type { Preview } from "@storybook/react";
import { ModalRenderer } from "@patch-kit/modal";
import { PopoverRenderer } from "@patch-kit/popover";
import "./tailwind.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div id="story-root">
        <Story />
        <ModalRenderer root="#story-root" />
        <PopoverRenderer />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default preview;
