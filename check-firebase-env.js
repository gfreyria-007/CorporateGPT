#!/usr/bin/env node

/**
 * Firebase Environment Setup Helper
 * 
 * This script helps you configure the Firebase environment variables
 * needed for authentication to work properly.
 */

import fs from 'fs';
import path from 'path';

console.log('🔥 Firebase Environment Setup Helper');
console.log('====================================\n');

const envPath = new URL('./.env', import.meta.url).pathname;
const envExamplePath = new URL('./.env.example', import.meta.url).pathname;

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file from .env.example and configure your Firebase settings.');
  process.exit(1);
}

// Read current .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

// Check for required Firebase variables
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

console.log('📋 Checking Firebase Configuration:\n');

let hasMissingVars = false;
requiredVars.forEach(varName => {
  const found = envLines.some(line => line.startsWith(varName + '='));
  if (found) {
    const line = envLines.find(line => line.startsWith(varName + '='));
    const value = line.split('=')[1];
    const isPlaceholder = value.includes('YOUR_') || value === '';
    
    if (isPlaceholder) {
      console.log(`❌ ${varName}: Not configured (still using placeholder)`);
      hasMissingVars = true;
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  } else {
    console.log(`❌ ${varName}: Missing`);
    hasMissingVars = true;
  }
});

console.log('\n🔧 How to get Firebase configuration:');
console.log('====================================');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project');
console.log('3. In the left menu, go to "Project settings"');
console.log('4. Under "Your apps", click the web icon (</>) to add a web app');
console.log('5. Register the app and copy the configuration object');
console.log('6. Update your .env file with the values\n');

if (hasMissingVars) {
  console.log('🚨 Issues found:');
  console.log('---------------');
  console.log('Firebase authentication will not work until these variables are properly configured.');
  console.log('\n💡 Next steps:');
  console.log('1. Get Firebase config from console.firebase.google.com');
  console.log('2. Update .env file with actual values');
  console.log('3. Restart the development server');
  console.log('4. Test authentication again');
} else {
  console.log('✅ All Firebase variables appear to be configured!');
  console.log('You should be able to authenticate now.');
}

console.log('\n🔍 Testing Firebase initialization...\n');

// Try to initialize Firebase and check for errors
try {
  // This will test if we can access the environment variables
  const testConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  if (!testConfig.apiKey || testConfig.apiKey.startsWith('YOUR_')) {
    console.log('❌ Firebase API Key not properly configured');
    process.exit(1);
  }

  console.log('✅ Firebase configuration looks valid');
  console.log('🚀 Try running the app and testing authentication now!');

} catch (error) {
  console.error('❌ Error testing Firebase configuration:', error.message);
  process.exit(1);
}