/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "surface-container-high": "#e0e9f5",
                "outline-variant": "#c2c6d6",
                "surface-container-low": "#ecf4ff",
                "surface-container": "#e6effa",
                "background": "#f7f9ff",
                "primary": "#0051ae",
                "on-surface-variant": "#424753",
                "surface": "#f7f9ff",
                "primary-fixed": "#d8e2ff",
                "surface-container-highest": "#dae3ef",
                "on-surface": "#141c25",
                "outline": "#727785",
                "error": "#ba1a1a",
                "error-container": "#ffdad6",
                "surface-container-lowest": "#ffffff",
                "on-primary-fixed": "#001a41",
                "surface-variant": "#dae3ef",
                "primary-container": "#0969da",
                "tertiary": "#006226",
                "tertiary-container": "#007e33",
                "surface-dim": "#d2dbe6",
            },
            fontFamily: {
                body: ["Inter", "sans-serif"],
            },
            borderRadius: {
                xl: "0.5rem",
                "2xl": "0.75rem",
                "3xl": "1rem",
            },
        },
    },
    plugins: [],
};