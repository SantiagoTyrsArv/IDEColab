/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'editor-bg': '#1e1e2e',
        'editor-text': '#cdd6f4',
        'editor-accent': '#89b4fa',
        'metrics-good': '#a6e3a1',
        'metrics-warn': '#f9e2af',
        'metrics-bad': '#f38ba8',
      },
    },
  },
  plugins: [],
}
