#!/usr/bin/env npx tsx
/**
 * Firebase Setup Script
 *
 * This script helps set up the initial Firebase configuration:
 * 1. Generates a secure API token
 * 2. Creates the token hash for Firestore
 * 3. Adds the initial token to Firestore
 *
 * Prerequisites:
 * - Firebase project created
 * - Firestore enabled
 * - Service account credentials in .env.local
 *
 * Usage:
 *   npx tsx scripts/setup-firebase.ts
 */

import { createHash, randomBytes } from 'crypto';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  console.log('🔧 Firebase Setup Script\n');

  // Check environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase credentials in .env.local');
    console.error('   Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }

  console.log(`📦 Project: ${projectId}`);
  console.log(`📧 Service Account: ${clientEmail}\n`);

  // Initialize Firebase Admin
  const app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

  const db = getFirestore(app);

  // Generate API token
  const apiToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(apiToken).digest('hex');

  console.log('🔑 Generated API Token:\n');
  console.log('━'.repeat(70));
  console.log(`   ${apiToken}`);
  console.log('━'.repeat(70));
  console.log('\n⚠️  SAVE THIS TOKEN! It will not be shown again.\n');
  console.log('   Use this as PUBLICCODE_REGISTRY_API_KEY in GitHub Secrets.\n');

  // Add token to Firestore
  try {
    const tokenDoc = {
      token: tokenHash,
      name: 'GitHub Action Production',
      enabled: true,
      createdAt: FieldValue.serverTimestamp(),
    };

    await db.collection('registry_tokens').add(tokenDoc);
    console.log('✅ Token added to Firestore (registry_tokens collection)\n');

    // Create repositories collection with a placeholder (will be deleted)
    const repoDoc = {
      _placeholder: true,
      createdAt: FieldValue.serverTimestamp(),
    };
    const placeholderRef = await db.collection('repositories').add(repoDoc);
    await placeholderRef.delete();
    console.log('✅ Repositories collection initialized\n');

    console.log('🎉 Setup complete!\n');
    console.log('Next steps:');
    console.log('1. Copy the API token above');
    console.log('2. Add it as PUBLICCODE_REGISTRY_API_KEY in your GitHub repo secrets');
    console.log('3. Deploy the web app to Vercel');
    console.log('4. Test the registration with your GitHub Action\n');

  } catch (error) {
    console.error('❌ Failed to add token to Firestore:', error);
    console.error('\nMake sure:');
    console.error('- Firestore is enabled in Firebase Console');
    console.error('- Service account has Firestore access');
    process.exit(1);
  }

  process.exit(0);
}

main();
