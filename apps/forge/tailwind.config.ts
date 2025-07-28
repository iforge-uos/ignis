import type { Config } from 'tailwindcss'

const config = {
    content: ['./src/**/*.{ts,tsx}', '../../packages/ui/**/*.{ts,tsx}']
} satisfies Config

export default config