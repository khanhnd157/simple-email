import type { Config } from 'tailwindcss';
import desktopConfig from '../desktop/tailwind.config';

export default {
  ...desktopConfig,
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../desktop/src/**/*.{ts,tsx}',
  ],
} satisfies Config;
