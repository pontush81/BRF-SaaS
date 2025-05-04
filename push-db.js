// Script to push the database schema using .env.local
const { execSync } = require('child_process');
const fs = require('fs');

// Read .env.local file
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};

// Parse environment variables
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      envVars[key.trim()] = value.slice(1, -1);
    } else {
      envVars[key.trim()] = value;
    }
  }
});

// Set the DATABASE_URL and DIRECT_URL environment variables
process.env.DATABASE_URL = envVars.DATABASE_URL;
process.env.DIRECT_URL = envVars.DIRECT_URL;
process.env.NODE_ENV = 'development';

// Run Prisma db push with the set environment variables
try {
  console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Using DIRECT_URL:', process.env.DIRECT_URL);
  console.log('Pushing database schema...');
  execSync('npx prisma db push --schema=./prisma/schema.prisma', { stdio: 'inherit' });
  console.log('Database schema pushed successfully!');
} catch (error) {
  console.error('Error pushing database schema:', error.message);
  process.exit(1);
} 