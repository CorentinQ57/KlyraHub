/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
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
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-poppins)'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			klyra: {
  				DEFAULT: '#467FF7',
  				foreground: '#FFFFFF',
  				'50': '#E6EDFD',
  				'100': '#B8CBFC',
  				'200': '#7FA3F9',
  				'500': '#467FF7',
  				'600': '#3A6FE0', // Version hover
  				'700': 'rgba(70, 127, 247, 0.7)',
  				'800': 'rgba(70, 127, 247, 0.8)',
  				'900': 'rgba(70, 127, 247, 0.9)'
  			},
  			'klyra-text': {
  				dark: '#1A2B3C',
  				medium: '#4A5568',
  				light: '#718096'
  			},
  			'klyra-bg': '#F7FAFC',
        'klyra-white': '#FFFFFF',
        'klyra-gradient': {
          'blue-pink': 'linear-gradient(90deg, #B8CBFC 0%, #F7A6C1 100%)',
          'blue-yellow': 'linear-gradient(90deg, #B8CBFC 0%, #FFE9A3 100%)',
          'blue-green': 'linear-gradient(90deg, #B8CBFC 0%, #A6F0C6 100%)'
        },
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			small: '0.25rem', // 4px - Petit
  			medium: '0.5rem',  // 8px - Moyen
  			large: '1rem',     // 16px - Grand
  			full: '9999px'     // Pour éléments circulaires
  		},
  		spacing: {
  			xs: '0.25rem',  // 4px
  			sm: '0.5rem',   // 8px
  			md: '1rem',     // 16px
  			lg: '1.5rem',   // 24px
  			xl: '2rem',     // 32px
  			'2xl': '3rem'   // 48px
  		},
  		letterSpacing: {
  			tighter: '-0.07em', // Pour H1
  			tight: '-0.05em',   // Pour H2
  			snug: '-0.03em',    // Pour H3
  			normal: '-0.02em',  // Pour H4
        badge: '0.05em'     // Pour badges
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
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
  					height: 0
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
      fontSize: {
        'xs': '0.75rem',    // Pour badges
        'sm': '0.875rem',   // Petit texte
        'base': '1rem',     // Texte courant
        'lg': '1.25rem',    // H4
        'xl': '1.5rem',     // H3
        '2xl': '2rem',      // H2
        '3xl': '2.5rem'     // H1
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'btn-hover': '0 4px 12px rgba(70, 127, 247, 0.25)'
      }
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 