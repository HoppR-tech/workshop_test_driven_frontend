'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'

import { PromoBanner } from './promo_banner'

const meta = {
  title: 'Components/PromoBanner',
  component: PromoBanner,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    message: 'Join the workshop and level up your product announcements!',
    ctaText: 'Reserve your seat',
  },
} satisfies Meta<typeof PromoBanner>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
