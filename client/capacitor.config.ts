import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.typeflow.app',
  appName: 'TypeFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    // Allow WebView to handle keyboard input from Bluetooth devices
    allowMixedContent: true,
  },
  plugins: {
    Keyboard: {
      resize: 'none',
      style: 'dark',
    },
  },
};

export default config;
