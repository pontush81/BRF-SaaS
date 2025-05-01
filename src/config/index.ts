// Environment configuration
interface Config {
  apiUrl: string;
  appUrl: string;
  env: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

const env = process.env.NODE_ENV || 'development';

const config: Config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test',
};

export default config; 