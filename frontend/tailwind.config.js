/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy & nesting - Treat UI as physical layers of fine paper
        surface: '#fcf9f2',           // Base canvas (primary)
        'surface-low': '#f6f3ec',     // Secondary context
        'surface-container': '#f1eee7', // Interactive/Elevated
        'surface-container-low': '#f6f3ec',
        'surface-container-highest': '#e5e2db',
        'surface-highest': '#e5e2db',
        'surface-lowest': '#ffffff',  // The "Glass" rule - overlays at 80% opacity
        
        // Signature accents
        primary: '#061b0e',           // Primary CTA - high-contrast authority
        'on-primary': '#ffffff',      // Text on primary background
        'on-surface': '#1c1c18',      // Body text on surface
        secondary: '#6b5d3e',         // Secondary accent
        'on-secondary': '#ffffff',
        'tertiary-fixed': '#ffdea5',  // Gold highlights - sparingly for rewards/badges
        'primary-fixed': '#d0e9d4',
        'on-primary-fixed': '#0b2013',
        'outline-variant': '#c3c8c1'  // Ghost border at 20% opacity for form inputs
      },
      boxShadow: {
        // Ambient shadows - multi-layered for floating elements
        soft: '0 10px 40px -10px rgba(28, 28, 24, 0.08)' // Natural light filtered through window (4-8% opacity)
      },
      borderRadius: {
        md: '0.75rem',  // Buttons and small components
        lg: '1rem'      // Cards and larger components
      }
    }
  },
  plugins: []
};
