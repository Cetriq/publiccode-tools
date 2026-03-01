import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Debug endpoint to check auth configuration - REMOVE IN PRODUCTION
export async function GET() {
  const envStatus = {
    GITHUB_ID: !!process.env.GITHUB_ID,
    GITHUB_SECRET: !!process.env.GITHUB_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
  };

  return NextResponse.json({
    message: 'Auth debug info',
    envStatus,
    nodeEnv: process.env.NODE_ENV,
  });
}
