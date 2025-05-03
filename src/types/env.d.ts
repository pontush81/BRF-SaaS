/**
 * Typdeklarationsfil för miljövariabler
 * 
 * Utökar standard ProcessEnv för att inkludera 'staging' som valid NODE_ENV-värde
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test' | 'staging';
    }
  }
}

export {}; 