import type { Preview } from "@storybook/react";
import { ModalRenderer } from "@patch-kit/modal";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div id="story-root">
        <Story />
        <ModalRenderer root="#story-root" />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default preview;
