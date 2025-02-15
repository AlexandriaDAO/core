/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./src/**/*.{js,jsx}", "./src/**/*.html"],
  darkMode: ["class"],
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
  			syne: [
  				'Syne',
  				'sans-serif'
  			],
  			'roboto-condensed': [
  				'Roboto Condensed',
  				'sans-serif'
  			]
  		},
  		container: {
  			center: true,
  			padding: {
  				default: '1rem',
				xs: '2rem',
  				sm: '2rem',
  				lg: '1rem'
  			},
  			screens: {
  				xs: '100%',
  				sm: '640px',
  				md: '768px',
  				lg: '1024px',
  				xl: '1280px',
  				xxl: '1585px'
  			}
  		},
  		fontSize: {
  			tabsheading: '20px',
  			xxltabsheading: '32px',
  			xltabsheading: '30px',
  			lgtabsheading: '28px',
  			mdtabsheading: '25px',
  			smtabsheading: '22px',
  			swapheading: '22px',
  			xxlswapheading: '40px',
  			xlswapheading: '35px',
  			lgswapheading: '30px',
  			mdswapheading: '26px',
  			smswapheading: '24px'
  		},
  		colors: {
			// //  OG from Zeeshan with the blue tone.
  			// gray: {
  			// 	50: 'rgb(249, 250, 251)',
  			// 	100: 'rgb(243, 244, 246)',
  			// 	200: 'rgb(229, 231, 235)',
  			// 	300: 'rgb(209, 213, 219)',
  			// 	400: 'rgb(156, 163, 175)',
  			// 	500: 'rgb(107, 114, 128)',
  			// 	600: 'rgb(75, 85, 99)',
  			// 	700: 'rgb(55, 65, 81)',
  			// 	800: 'rgb(31, 31, 31)',
  			// 	900: 'rgb(17, 24, 39)',
  			// },
			  gray: {
				20: 'rgb(242, 242, 241)',
				30: 'rgb(254, 253, 251)',
				50: 'rgb(253, 252, 249)',
				100: 'rgb(249, 247, 242)',
				200: 'rgb(240, 237, 229)',
				300: 'rgb(224, 220, 208)',
				400: 'rgb(194, 189, 173)',
				500: 'rgb(161, 155, 136)',
				600: 'rgb(127, 121, 104)',
				700: 'rgb(96, 92, 79)',
				800: 'rgb(66, 64, 58)',
				850: 'rgb(60, 58, 53)',
				900: 'rgb(53, 52, 48)',
			  },
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
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			constructive: {
  				DEFAULT: 'hsl(var(--constructive))',
  				foreground: 'hsl(var(--constructive-foreground))'
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
  			multycolor: '#FF9900',
			brightyellow: '#F6F930',
  			multygray: '#808080',
  			lightgray: '#CCCCCC',
  			radiocolor: '#353535',
  			swapinput: '#32524D',
  			swaptext: '#5C5C5C',
  			swapvalue: '#31524E',
  			darkgray: '#525252',
  			white: '#FFFFFF',
  			black: '#000000',
  			transparent: 'transparent',
  			current: 'currentColor',
  		},
  		backgroundColor: {
			  balancebox: '#3A3630', // I think it's a winner.
  			// balancebox: '#353535',  // OG Grey
			// balancebox: 'rgb(74, 72, 63)',
  			sendbtnbg: '#FF3737',
  			mintbtnbg: '#92FF71',
  			receive: '#92FF71'
  		},
  		borderRadius: {
  			lg: '`var(--radius)`',
  			md: '`calc(var(--radius) - 2px)`',
  			sm: 'calc(var(--radius) - 4px)',
  			borderbox: '44px',
  			bordertb: '20px'
  		},
  		height: {
  			circleheight: '32px',
  			inputbox: '66px'
  		},
  		width: {
  			circlewidth: '32px'
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		backgroundImage: {},
  		screens: {
  			xs: '280px'
  		}
  	}
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      pointerEvents: ["disabled"],
    },
  },
  plugins: [
	require("tailwindcss-animate"),
	require('tailwind-scrollbar'),
  ],
};
