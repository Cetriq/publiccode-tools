import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/rbac';
import { isPlatformAdmin, getPermissions } from '@/types/rbac';

// GET /api/users/me - Get current user's profile and permissions
export async function GET(): Promise<NextResponse> {
  try {
    const { session, user } = await requireAuth();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
        permissions: getPermissions(user.roles),
        isAdmin: isPlatformAdmin(user.roles),
        createdAt: user.createdAt?.toDate?.()?.toISOString() || null,
        lastLogin: user.lastLogin?.toDate?.()?.toISOString() || null,
      },
      // Also include session info from GitHub
      github: {
        login: session.user.login,
        image: session.user.image,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
