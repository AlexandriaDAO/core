/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "./src/**/*.{js,jsx}", "./src/**/*.html"],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        "roboto-condensed": ["Roboto Condensed", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          default: "1rem",
          sm: "2rem",
          lg: "1rem",
        },
        screens: {
          xs: "100%",
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          xxl: "1585px",
        },
      },
      fontSize: {
        tabsheading: "20px",
        xxltabsheading: "32px",
        xltabsheading: "30px",
        lgtabsheading: "28px",
        mdtabsheading: "25px",
        smtabsheading: "22px",
        swapheading: "22px",
        xxlswapheading: "40px",
        xlswapheading: "35px",
        lgswapheading: "30px",
        mdswapheading: "26px",
        smswapheading: "24px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        constructive: {
          DEFAULT: "hsl(var(--constructive))",
          foreground: "hsl(var(--constructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        multycolor: "#FF9900",
        multygray: "#808080",
        lightgray: "#CCCCCC",
        radiocolor: "#353535",
        swapinput: "#32524D",
        swaptext: "#5C5C5C",
        swapvalue: "#31524E",
        darkgray: "#525252",
      },
      backgroundColor: {
        balancebox: "#353535",
        sendbtnbg: "#FF3737",
        mintbtnbg: "#92FF71",
        receive: "#92FF71",
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
        borderbox: "44px",
        bordertb: "20px",
      },
      height: {
        circleheight: "32px",
        inputbox: "66px",
        // xxlinputbox : '60px',
        // xlinputbox : '55px',
        // lglinputbox : '50px',
        // mdlinputbox : '45px',
        // smlinputbox : '40px',
      },
      width: {
        circlewidth: "32px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        //  'account-box-bg': "url('/images/gradient-bg.png')",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"],
      pointerEvents: ["disabled"],
    },
  },
  plugins: [require("tailwindcss-animate")],
};
