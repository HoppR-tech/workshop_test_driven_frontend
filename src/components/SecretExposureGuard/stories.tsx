import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { SecretExposureGuard } from "./SecretExposureGuard";

class SecretExposureGuardDriverBrowserEvents {
  public addEventListener(event: string, listener: EventListener) {
    window.addEventListener(event, listener);
  }

  public removeEventListener(event: string, listener: EventListener) {
    window.removeEventListener(event, listener);
  }

}

function useSecretExposureGuard() {
  const guardRef = React.useRef(new SecretExposureGuard(new SecretExposureGuardDriverBrowserEvents()));
  const guard = guardRef.current;

  const mode = React.useSyncExternalStore(guard.subscribe, guard.getSnapshot, guard.getSnapshot)

  React.useEffect(() => {
    guard.start();

    return () => {
      guard.stop();
    };
  }, []);

  return mode;
}

function SecretExposureGuardImpl() {
  const mode = useSecretExposureGuard();

  return <>{mode}</>
}

const meta = {
  title: "Components/SecretExposureGuard",
  component: SecretExposureGuardImpl,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SecretExposureGuardImpl>;

export default meta;
type Story = StoryObj<typeof SecretExposureGuardImpl>;

export const Default: Story = {
  args: {},
};
