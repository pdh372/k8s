/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				k8s: {
					DEFAULT: '#326CE5',
					light: '#5B8DEF',
					dark: '#254AA5',
				},
			},
			fontFamily: {
				mono: [
					'ui-monospace',
					'SFMono-Regular',
					'Menlo',
					'Monaco',
					'Consolas',
					'monospace',
				],
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(6px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'pulse-ring': {
					'0%': { transform: 'scale(0.9)', opacity: '0.7' },
					'100%': { transform: 'scale(1.6)', opacity: '0' },
				},
			},
			animation: {
				'fade-in': 'fade-in 0.3s ease-out',
				'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
			},
		},
	},
	plugins: [],
};
