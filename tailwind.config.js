/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx', './src/**/*.jsx', './src/**/*.html'],
  darkMode: true,
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          default: '1rem',
          sm: '2rem',
          lg: '1rem',
        },
        screens: {
          xs: '100%',
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          xxl: '1585px'
        },
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
        smswapheading: '24px',
      },
      colors: {
        multycolor: '#FF9900',
        multygray: '#808080',
        lightgray: '#CCCCCC',
        radiocolor: '#353535',
        swapinput: '#32524D',
        swaptext: '#5C5C5C',
        swapvalue: '#31524E',
        darkgray: '#525252',
      },
      backgroundColor: {
        balancebox: '#353535',
        sendbtnbg: '#FF3737',
        receive: '#92FF71',
      },
      borderRadius: {
        borderbox: '44px',
        bordertb: '20px',
      },
      backgroundImage: {
        // 'icp-pattern': `url('./images/apple.png')`,
      },
     height: {
      circleheight: '32px',
      inputbox : '66px',
      // xxlinputbox : '60px',
      // xlinputbox : '55px',
      // lglinputbox : '50px',
      // mdlinputbox : '45px',
      // smlinputbox : '40px',
     },
     width: {
      circlewidth: '32px'
     },
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
