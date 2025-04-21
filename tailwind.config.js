/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px',
  		},
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-poppins)',
  			],
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			klyra: {
  				'50': '#E6EDFD',
  				'100': '#B8CBFC',
  				'200': '#7FA3F9',
  				'500': '#467FF7',
  				'600': '#3A6FE0',
  				'700': 'rgba(70, 127, 247, 0.7)',
  				'800': 'rgba(70, 127, 247, 0.8)',
  				'900': 'rgba(70, 127, 247, 0.9)',
  				DEFAULT: '#467FF7',
  				foreground: '#FFFFFF',
  			},
  			'klyra-text': {
  				dark: '#1A2B3C',
  				medium: '#4A5568',
  				light: '#718096',
  			},
  			'klyra-bg': '#F7FAFC',
  			'klyra-white': '#FFFFFF',
  			'klyra-gradient': {
  				'blue-pink': 'linear-gradient(90deg, #B8CBFC 0%, #F7A6C1 100%)',
  				'blue-yellow': 'linear-gradient(90deg, #B8CBFC 0%, #FFE9A3 100%)',
  				'blue-green': 'linear-gradient(90deg, #B8CBFC 0%, #A6F0C6 100%)',
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))',
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))',
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))',
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))',
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))',
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			small: '0.25rem',
  			medium: '0.5rem',
  			large: '1rem',
  			full: '9999px',
  		},
  		spacing: {
  			xs: '0.25rem',
  			sm: '0.5rem',
  			md: '1rem',
  			lg: '1.5rem',
  			xl: '2rem',
  			'2xl': '3rem',
  		},
  		letterSpacing: {
  			tighter: '-0.07em',
  			tight: '-0.05em',
  			snug: '-0.03em',
  			normal: '-0.02em',
  			badge: '0.05em',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0',
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)',
  				},
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)',
  				},
  				to: {
  					height: '0',
  				},
  			},
  			aurora: {
  				'0%': {
  					backgroundPosition: '0% 50%, 50% 50%',
  					backgroundSize: '200% 200%, 200% 200%',
  				},
  				'25%': {
  					backgroundPosition: '50% 25%, 100% 50%',
  					backgroundSize: '200% 200%, 200% 200%',
  				},
  				'50%': {
  					backgroundPosition: '100% 50%, 50% 0%',
  					backgroundSize: '200% 200%, 200% 200%',
  				},
  				'75%': {
  					backgroundPosition: '50% 75%, 0% 50%',
  					backgroundSize: '200% 200%, 200% 200%',
  				},
  				'100%': {
  					backgroundPosition: '0% 50%, 50% 50%',
  					backgroundSize: '200% 200%, 200% 200%',
  				},
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			aurora: 'aurora 10s ease infinite',
  		},
  		fontSize: {
  			xs: '0.75rem',
  			sm: '0.875rem',
  			base: '1rem',
  			lg: '1.25rem',
  			xl: '1.5rem',
  			'2xl': '2rem',
  			'3xl': '2.5rem',
  		},
  		fontWeight: {
  			light: '300',
  			normal: '400',
  			medium: '500',
  			semibold: '600',
  			bold: '700',
  		},
  		boxShadow: {
  			card: '0 2px 8px rgba(0, 0, 0, 0.05)',
  			'btn-hover': '0 4px 12px rgba(70, 127, 247, 0.25)',
  			'btn-cta': '0 10px 12px -2px rgba(47, 84, 163, 0.25)',
  			'btn-cta-sm': '0 5px 8px -2px rgba(47, 84, 163, 0.2)',
  			'btn-cta-inner': 'inset 0 -12px 8px -10px rgba(255, 255, 255, 0.5)',
  		},
  		backgroundImage: {
  			'btn-primary': 'linear-gradient(to bottom, #5A9AFF, #467FF7, #3A6FE0)',
  		},
  	},
  },
  plugins: [require('tailwindcss-animate')],
}; 