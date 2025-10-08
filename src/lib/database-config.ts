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