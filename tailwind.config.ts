import type { Config } from "tailwindcss";

/**
 * Maps the CSS variables in src/app/globals.css to class names.
 * `colors` replaces Tailwind's palette, so only these tokens exist.
 */
const config = {
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      ink: "var(--ink)",
      fg: "var(--fg)",
      muted: "var(--muted)",
      divider: "var(--divider)",
      tile: "var(--tile)",
      "tile-fg": "var(--tile-fg)",
      chip: "var(--chip)",
      "chip-fg": "var(--chip-fg)",
      "card-border": "var(--card-border)",
      "placeholder-border": "var(--placeholder-border)",
      "placeholder-fg": "var(--placeholder-fg)",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        rise: "rise var(--rise-duration) ease-out both",
        marquee: "marquee var(--marquee-duration) linear infinite",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(var(--rise-distance))" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
} satisfies Config;

export default config;
