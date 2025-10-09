/**
 * Database URL configuration that switches between development and production
 * based on NODE_ENV environment variable
 */

export function getDatabaseUrl(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    const prodUrl = process.env.DATABASE_URL_PROD;
    if (!prodUrl) {
      throw new Error('DATABASE_URL_PROD is required in production environment');
    }
    console.log('🗄️  Using production database');
    return prodUrl;
  } else {
    const devUrl = process.env.DATABASE_URL;
    if (!devUrl) {
      throw new Error('DATABASE_URL is required in development environment');
    }
    console.log('🗄️  Using development database');
    return devUrl;
  }
}

export function isDatabaseProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Ensures DATABASE_URL is set correctly for Prisma in all environments
export const configureDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    const prodUrl = process.env.DATABASE_URL_PROD;
    if (prodUrl) {
      process.env.DATABASE_URL = prodUrl;
      console.log('✅ Production database configured');
      return true;
    } else {
      console.error('⚠️ DATABASE_URL_PROD not set in production');
      return false;
    }
  } else if (process.env.NODE_ENV === 'test') {
    const testUrl = process.env.DATABASE_URL_TEST;
    if (testUrl) {
      process.env.DATABASE_URL = testUrl;
      console.log('✅ Test database configured');
      return true;
    } else {
      console.warn('⚠️ DATABASE_URL_TEST not set, using default DATABASE_URL');
    }
  }
  // For development, use DATABASE_URL as is
  return true;
};

// Execute immediately
configureDatabaseUrl();