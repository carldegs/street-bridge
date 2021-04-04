import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
  },
  colors: {
    brandLight: '#E9EBF9',
    brandDark: {
      900: '#202442',
      800: '#25294A',
      700: '#424774',
    },
    brandRed: '#F14D60',
    brandPurple: '#7033FF',
    brandBlue: '#4E7CFF',
    brandYellow: '#FDB513',
    brandGreen: '#78CB38',
    brandCyan: '#22C0FF',
  },
  fonts: {
    body: 'IBM Plex Sans, sans-serif',
    heading: 'IBM Plex Serif',
  },
});

export default theme;
