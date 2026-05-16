import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.typeflow.app',
  appName: 'TypeFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
