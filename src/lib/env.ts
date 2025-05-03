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

// Standard NODE_ENV värden
type NodeEnv = 'development' | 'test' | 'production' | undefined;

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
 * Returnerar aktuell miljö baserat på NODE_ENV och DEPLOYMENT_ENV
 */
export const getEnvironment = (): Environment => {
  // Prioritera DEPLOYMENT_ENV om det finns (t.ex. för staging)
  const deploymentEnv = process.env.DEPLOYMENT_ENV;
  if (deploymentEnv === 'staging') {
    return Environment.STAGING;
  }

  // Fallback till standard NODE_ENV
  const env = process.env.NODE_ENV as NodeEnv;

  switch (env) {
    case 'development':
      return Environment.DEVELOPMENT;
    case 'test':
      return Environment.TEST;
    case 'production':
      // För produktion, verifiera att vi inte är i staging
      return deploymentEnv === 'staging' ? Environment.STAGING : Environment.PRODUCTION;
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
  // Prioritera DEPLOYMENT_ENV om det är "staging"
  if (process.env.DEPLOYMENT_ENV === 'staging') {
    return DatabaseEnvironment.STAGING;
  }
  
  // Kontrollera för Vercel-specifika miljövariabler
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
      // För produktion, verifiera att vi inte är i staging
      return process.env.DEPLOYMENT_ENV === 'staging' 
        ? DatabaseEnvironment.STAGING 
        : DatabaseEnvironment.PROD;
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