import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Aura with darker light-mode shades where its defaults miss the WCAG AA 4.5:1 text contrast:
 * white on primary 500 (2.5:1), white on red 500 buttons (3.8:1), green 600 toast titles (3.2:1).
 */
export const PokedexPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '{primary.700}',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}',
        },
      },
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            danger: {
              background: '{red.600}',
              hoverBackground: '{red.700}',
              activeBackground: '{red.800}',
              borderColor: '{red.600}',
              hoverBorderColor: '{red.700}',
              activeBorderColor: '{red.800}',
            },
          },
        },
      },
    },
    toast: {
      colorScheme: {
        light: {
          success: {
            color: '{green.700}',
          },
        },
      },
    },
  },
});
