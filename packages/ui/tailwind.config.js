const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./stories/**/*.{ts,tsx}",
    "../../packages/ui/components/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: 'true',
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			heartspace: 'var(--heartspace)',
  			mainspace: 'var(--mainspace)',
  			'george-porter': 'var(--george-porter)',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary)',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'var(--card-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			tick: 'var(--tick)',
  			cross: 'var(--cross)',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			futura: ['Futura', 'sans-serif']
  		}
  	},
  	borderRadius: {
  		lg: 'var(--radius)',
  		md: 'calc(var(--radius) - 2px)',
  		sm: 'calc(var(--radius) - 4px)'
  	},
  	fontFamily: {
  		sans: 'var(--font-sans)'
  	},
  	keyframes: {
  		'accordion-down': {
  			from: {
  				height: '0'
  			},
  			to: {
  				height: 'var(--radix-accordion-content-height)'
  			}
  		},
  		'accordion-up': {
  			from: {
  				height: 'var(--radix-accordion-content-height)'
  			},
  			to: {
  				height: '0'
  			}
  		},
  		'caret-blink': {
  			'0%,70%,100%': {
  				opacity: '1'
  			},
  			'20%,50%': {
  				opacity: '0'
  			}
  		},
  		shine: {
  			from: {
  				backgroundPosition: '200% 0'
  			},
  			to: {
  				backgroundPosition: '-200% 0'
  			}
  		},
  		marquee: {
  			from: {
  				transform: 'translateX(0)'
  			},
  			to: {
  				transform: 'translateX(calc(-100% - var(--gap)))'
  			}
  		},
  		'marquee-vertical': {
  			from: {
  				transform: 'translateY(0)'
  			},
  			to: {
  				transform: 'translateY(calc(-100% - var(--gap)))'
  			}
  		}
  	},
  	animation: {
  		'accordion-down': 'accordion-down 0.2s ease-out',
  		'accordion-up': 'accordion-up 0.2s ease-out',
  		'caret-blink': 'caret-blink 1.25s ease-out infinite',
  		shine: 'shine 8s ease-in-out infinite',
  		marquee: 'marquee var(--duration) linear infinite',
  		'marquee-vertical': 'marquee-vertical var(--duration) linear infinite'
  	}
  },
  // eslint-disable-next-line no-undef
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("tailwindcss/nesting"),
    require('tailwind-scrollbar'),
    addVariablesForColors,
  ],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}