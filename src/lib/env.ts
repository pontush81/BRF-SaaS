/**
 * Miljöhantering för Handbok.org
 * Hanterar detektering av miljö och miljöspecifika konfigurationer
 */

/**
 * Miljötyper som applikationen kan köras i
 */
export enum Environment {
  DEVELOPMENT = 'development',
  TEST = 'test',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

// Definiera NodeEnv typ för att inkludera 'staging'
type NodeEnv = 'development' | 'test' | 'staging' | 'production' | undefined;

/**
 * Databasmiljöer som applikationen kan arbeta mot
 */
export enum DatabaseEnvironment {
  DEV = 'dev',
  TEST = 'test',
  STAGING = 'staging',
  PROD = 'prod',
}

/**
 * Returnerar aktuell miljö baserat på NODE_ENV
 */
export const getEnvironment = (): Environment => {
  // Cast till vår egen NodeEnv typ för att undvika typfel
  const env = process.env.NODE_ENV as NodeEnv;

  switch (env) {
    case 'development':
      return Environment.DEVELOPMENT;
    case 'test':
      return Environment.TEST;
    case 'staging':
      return Environment.STAGING;
    case 'production':
      return Environment.PRODUCTION;
    default:
      // Fallback till development om ingen miljö är specificerad
      return Environment.DEVELOPMENT;
  }
};

/**
 * Returnerar aktuell databasmiljö baserat på DATABASE_ENV
 * Detta gör det möjligt att ha separata databaser för olika miljöer
 */
export const getDatabaseEnvironment = (): DatabaseEnvironment => {
  // Kontrollera för Vercel-specifika miljövariabler först
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_ENV_PREVIEW_DATABASE_ENV) {
    return process.env.VERCEL_ENV_PREVIEW_DATABASE_ENV as unknown as DatabaseEnvironment;
  }
  
  if (process.env.VERCEL_ENV === 'development' && process.env.VERCEL_ENV_DEVELOPMENT_DATABASE_ENV) {
    return process.env.VERCEL_ENV_DEVELOPMENT_DATABASE_ENV as unknown as DatabaseEnvironment;
  }
  
  // Fallback till standard DATABASE_ENV
  const dbEnv = process.env.DATABASE_ENV || process.env.NODE_ENV;

  switch (dbEnv) {
    case 'dev':
    case 'development':
      return DatabaseEnvironment.DEV;
    case 'test':
      return DatabaseEnvironment.TEST;
    case 'staging':
      return DatabaseEnvironment.STAGING;
    case 'prod':
    case 'production':
      return DatabaseEnvironment.PROD;
    default:
      // Fallback till dev om ingen miljö är specificerad
      return DatabaseEnvironment.DEV;
  }
};

/**
 * Returnerar databasschema baserat på databasmiljö
 */
export const getDatabaseSchema = (): string => {
  const dbEnv = getDatabaseEnvironment();
  
  switch (dbEnv) {
    case DatabaseEnvironment.DEV:
      return 'dev';
    case DatabaseEnvironment.TEST:
      return 'test';
    case DatabaseEnvironment.STAGING:
      return 'staging';
    case DatabaseEnvironment.PROD:
      return 'public';
    default:
      return 'public';
  }
};

/**
 * Kontrollerar om applikationen körs i development-miljö
 */
export const isDevelopment = (): boolean => {
  return getEnvironment() === Environment.DEVELOPMENT;
};

/**
 * Kontrollerar om applikationen körs i test-miljö
 */
export const isTest = (): boolean => {
  return getEnvironment() === Environment.TEST;
};

/**
 * Kontrollerar om applikationen körs i staging-miljö
 */
export const isStaging = (): boolean => {
  return getEnvironment() === Environment.STAGING;
};

/**
 * Kontrollerar om applikationen körs i produktionsmiljö
 */
export const isProduction = (): boolean => {
  return getEnvironment() === Environment.PRODUCTION;
};

/**
 * Kontrollerar om applikationen arbetar mot produktionsdatabasen
 * Detta är viktigt för att undvika att felaktigt ändra i produktionsdata
 */
export const isProductionDatabase = (): boolean => {
  return getDatabaseEnvironment() === DatabaseEnvironment.PROD;
};

/**
 * Returnerar app URL baserat på miljö
 */
export const getAppUrl = (): string => {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

/**
 * Returnerar app domän baserat på miljö
 */
export const getAppDomain = (): string => {
  return process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';
};

/**
 * Loggar miljöinformation vid applikationsstart (används i app.tsx/page.tsx)
 * OBS: Denna info visas endast i serverkonsollen och inte i klientens konsol
 */
export const logEnvironmentInfo = (): void => {
  if (isProduction()) return; // Logga inte miljövariabler i produktion

  console.log('=== Miljöinformation ===');
  console.log(`Applikationsmiljö: ${getEnvironment()}`);
  console.log(`Databasmiljö: ${getDatabaseEnvironment()}`);
  console.log(`Databasschema: ${getDatabaseSchema()}`);
  console.log(`App URL: ${getAppUrl()}`);
  console.log(`App Domän: ${getAppDomain()}`);
  console.log(`Använder produktionsdatabas: ${isProductionDatabase()}`);
  console.log('=========================');
}; 