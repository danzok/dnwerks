/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
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
  				sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  				mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  			},
  			fontSize: {
  				// Vercel Typography System
  				xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
  				sm: ['0.8125rem', { lineHeight: '1.25rem' }], // 13px
  				base: ['0.875rem', { lineHeight: '1.5rem' }], // 14px
  				lg: ['0.9375rem', { lineHeight: '1.5rem' }], // 15px
  				xl: ['1rem', { lineHeight: '1.5rem' }], // 16px
  				'2xl': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  				'3xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
  				'4xl': ['2rem', { lineHeight: '2.5rem' }], // 32px
  				// Vercel specific sizes
  				'vercel-h1': ['1.5rem', { lineHeight: '1.8rem', fontWeight: '600', letterSpacing: '-0.025em' }], // 24px
  				'vercel-h2': ['1.125rem', { lineHeight: '1.35rem', fontWeight: '600', letterSpacing: '-0.025em' }], // 18px
  				'vercel-h3': ['0.875rem', { lineHeight: '1.225rem', fontWeight: '500', letterSpacing: '-0.025em' }], // 14px
  				'vercel-body': ['0.875rem', { lineHeight: '1.3125rem', fontWeight: '400' }], // 14px
  				'vercel-small': ['0.8125rem', { lineHeight: '1.1375rem', fontWeight: '400' }], // 13px
  				'vercel-label': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }], // 12px
  				'vercel-metric': ['2rem', { lineHeight: '2.4rem', fontWeight: '600', fontFamily: 'mono' }], // 32px
  				'vercel-metric-sm': ['1.5rem', { lineHeight: '1.8rem', fontWeight: '600', fontFamily: 'mono' }], // 24px
  			},
  			fontWeight: {
  				normal: '400',
  				medium: '500',
  				semibold: '600',
  				bold: '700',
  				// Vercel specific weights
  				'vercel-regular': '400',
  				'vercel-medium': '500',
  				'vercel-semibold': '600',
  			},
  			letterSpacing: {
  				tighter: '-0.025em',
  				tight: '-0.025em',
  				normal: '0',
  				wide: '0.05em',
  				'vercel-tight': '-0.025em',
  			},
  		colors: {
  			// Shadcn UI Colors (updated for Vercel)
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
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			// Vercel Design System Colors
  			vercel: {
  				// Light Mode
  				'bg-page': '#FAFAFA',
  				'bg-card': '#FFFFFF',
  				'bg-hover': '#F5F5F5',
  				'border': '#EAEAEA',
  				'text-primary': '#000000',
  				'text-secondary': '#666666',
  				'text-muted': '#999999',
  				'accent': '#0070F3',
  				'success': '#0070F3',
  				'warning': '#F5A623',
  				'error': '#EE0000',
  				// Status Colors - Light
  				'success-bg': '#E6F7FF',
  				'success-text': '#0070F3',
  				'success-border': '#BAE7FF',
  				'error-bg': '#FFEEEE',
  				'error-text': '#EE0000',
  				'error-border': '#FFCCCC',
  				'warning-bg': '#FFF7E6',
  				'warning-text': '#F5A623',
  				'warning-border': '#FFE7BA',
  				'disabled-bg': '#F5F5F5',
  				'disabled-text': '#999999',
  				'disabled-border': '#EAEAEA',
  				// Dark Mode (using CSS custom properties for theme switching)
  				'bg-page-dark': 'var(--vercel-bg-page-dark)',
  				'bg-card-dark': 'var(--vercel-bg-card-dark)',
  				'bg-hover-dark': 'var(--vercel-bg-hover-dark)',
  				'border-dark': 'var(--vercel-border-dark)',
  				'text-primary-dark': 'var(--vercel-text-primary-dark)',
  				'text-secondary-dark': 'var(--vercel-text-secondary-dark)',
  				'text-muted-dark': 'var(--vercel-text-muted-dark)',
  				// Status Colors - Dark
  				'success-bg-dark': 'var(--vercel-success-bg-dark)',
  				'success-text-dark': 'var(--vercel-success-text-dark)',
  				'success-border-dark': 'var(--vercel-success-border-dark)',
  				'error-bg-dark': 'var(--vercel-error-bg-dark)',
  				'error-text-dark': 'var(--vercel-error-text-dark)',
  				'error-border-dark': 'var(--vercel-error-border-dark)',
  				'warning-bg-dark': 'var(--vercel-warning-bg-dark)',
  				'warning-text-dark': 'var(--vercel-warning-text-dark)',
  				'warning-border-dark': 'var(--vercel-warning-border-dark)',
  				'disabled-bg-dark': 'var(--vercel-disabled-bg-dark)',
  				'disabled-text-dark': 'var(--vercel-disabled-text-dark)',
  				'disabled-border-dark': 'var(--vercel-disabled-border-dark)',
  			}
  		},
  		borderRadius: {
  			// Vercel Design System - Consistent rounded corners
  			none: '0',
  			sm: '0.25rem', // 4px
  			md: '0.5rem', // 8px
  			lg: '0.75rem', // 12px (Vercel standard)
  			xl: '1rem', // 16px
  			'2xl': '1.25rem', // 20px
  			'3xl': '1.5rem', // 24px
  			// Shadcn compatibility
  			'shadcn-lg': 'var(--radius)',
  			'shadcn-md': 'calc(var(--radius) - 2px)',
  			'shadcn-sm': 'calc(var(--radius) - 4px)',
  			// Vercel specific
  			'vercel': '0.75rem', // 12px - standard Vercel rounded
  			'vercel-sm': '0.5rem', // 8px
  			'vercel-lg': '1rem', // 16px
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
  			},
  			// Vercel animations
  			'vercel-fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' }
  			},
  			'vercel-slide-up': {
  				'0%': { transform: 'translateY(10px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			'vercel-scale-in': {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			// Vercel transitions
  			'vercel-fade-in': 'vercel-fade-in 0.15s ease-out',
  			'vercel-slide-up': 'vercel-slide-up 0.2s ease-out',
  			'vercel-scale-in': 'vercel-scale-in 0.15s ease-out',
  			'vercel-transition': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}