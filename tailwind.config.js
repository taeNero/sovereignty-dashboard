/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kael: '#22c55e',
        siryandorin: '#eab308',
        anansi: '#3b82f6',
        aurixen: '#a855f7',
        angel: '#f8fafc',
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
}
