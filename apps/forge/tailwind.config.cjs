const baseConfig = require('@ignis/ui/tailwind.config');

module.exports = {
  ...baseConfig,
  plugins: [
    ...(baseConfig.plugins || []),
    ({ addUtilities }) => {
      addUtilities({
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none', // For IE and Edge
          'scrollbar-width': 'none',    // For Firefox
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none', // For Chrome, Safari, and newer Edge
        },
      });
    },
  ],
};