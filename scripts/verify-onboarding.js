#!/usr/bin/env node

// Skript för att verifiera att onboarding- och Stripe-konfigurationen är korrekt
require('dotenv').config();
const { execSync } = require('child_process');

console.log('=== BRF-SaaS Onboarding- och Stripe-konfigurationsverifiering ===\n');

// Kontrollera miljövariabler
const requiredVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PORTAL_CONFIGURATION_ID',
  'STRIPE_PRICE_ID_BASIC_MONTHLY',
  'STRIPE_PRICE_ID_BASIC_YEARLY',
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Följande miljövariabler saknas:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\nLägg till dessa i din .env.local eller .env.development fil.');
} else {
  console.log('✅ Alla nödvändiga Stripe-miljövariabler finns.');
}

// Kontrollera middleware-konfiguration
const middleware = {
  strictCheck: process.env.STRICT_SUBSCRIPTION_CHECK === 'true' 
    ? '✅ Strikt (aktiverad)'
    : '⚠️ Inte strikt (tillåter åtkomst till dashboard utan prenumeration i utvecklingsmiljön)'
};
console.log(`\nMiddleware för prenumerationskontroll: ${middleware.strictCheck}`);

// Verifiera att Stripe CLI är installerat
try {
  const stripeVersion = execSync('stripe --version').toString().trim();
  console.log(`\n✅ Stripe CLI installerat: ${stripeVersion}`);
} catch (error) {
  console.log('\n❌ Stripe CLI är inte installerat eller finns inte i PATH.');
  console.log('   Installera Stripe CLI enligt instruktionerna i README.md');
}

// Verifiera webhook-kommando
console.log('\n=== Stripe Webhook-kommando ===');
console.log('För att starta webhook-lyssnaren, kör:');
console.log('npm run stripe:webhook');
console.log('\nFör att starta både utvecklingsservern och webhook-lyssnaren samtidigt:');
console.log('npm run dev:with-stripe');

// Verifiera onboarding-flödet
console.log('\n=== Onboarding-flöde ===');
console.log('1. Användare registrerar sig på /register');
console.log('2. Användare skapar en BRF på /create-organization');
console.log('3. Systemet omdirigerar automatiskt till /subscription');
console.log('4. Användare väljer prenumerationsplan och slutför betalning');
console.log('5. Användare får tillgång till alla funktioner');

console.log('\n=== Testning ===');
console.log('För att testa med ett framgångsrikt betalkort: 4242 4242 4242 4242');
console.log('För att testa 3D Secure: 4000 0000 0000 3220');
console.log('För att testa avvisad betalning: 4000 0000 0000 9995');

console.log('\n=== Färdig ==='); 