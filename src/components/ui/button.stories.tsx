'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArrowRight, Loader2 } from 'lucide-react'

import { Button } from './button'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClick: { action: 'clicked' },
    asChild: { control: 'boolean' },
    variant: {
      control: 'select',
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ]
    },
    size: {
      control: 'select',
      options: ["default", "sm", "lg", "icon", "icon-sm", "icon-lg"]
    },
  },
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        Launch
        <ArrowRight className="size-4" aria-hidden="true" />
      </>
    ),
  },
}

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading
      </>
    ),
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Remove user',
  },
}
