import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Button } from "@mui/material";
import React from "react";

import { Eye, EyeOff } from "@/components/Icons/generated";
import { Text } from "@/components/Text";

import { useSecretExposureGuard } from "./hooks";

function SecretExposureGuardImpl() {
  const { mode, remainingTime, hide, show } = useSecretExposureGuard({
    gracePeriod: 1000,
    inactivityDuration: 10000,
    maxAvailability: 120_000,
    onLock: () => console.log("lock"),
  });

  const isCodeVisible = mode === "visible" || mode === "idle";
  const displayedCode = isCodeVisible ? "4 5 6 7" : "• • • •";
  const ActionIcon = isCodeVisible ? EyeOff : Eye;
  const actionLabel = isCodeVisible ? "Masquer le code" : "Afficher le code";
  const handleToggleVisibility = () => {
    if (isCodeVisible) {
      hide();
      return;
    }

    show();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: 2,
        backgroundColor: "common.white",
        flexFlow: "column",
      }}
    >
      <p>
        The remaining time is {Math.floor(remainingTime / 1000)} seconds
      </p>
      <Box
        sx={{
          width: 290,
          height: 118,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid",
          borderColor: "grey.200",
          borderRadius: "16px",
          backgroundColor: "common.white",
          boxSizing: "border-box",
        }}
      >
        <Text
          variant='title3'
          sx={{
            color: "primary.500",
            letterSpacing: "0.28em",
            fontWeight: 500,
          }}
        >
          {displayedCode}
        </Text>
      </Box>

      <Button
        onClick={handleToggleVisibility}
        startIcon={<ActionIcon />}
        variant='primary'
        sx={{
          padding: 0,
          minWidth: "auto",
          textTransform: "none",
          color: "primary.500",
          fontSize: 24,
          fontWeight: 600,
          lineHeight: 1.2,
          "&:hover": {
            backgroundColor: "transparent",
          },
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
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
