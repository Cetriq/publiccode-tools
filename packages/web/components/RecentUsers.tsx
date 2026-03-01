import Link from 'next/link';

interface RecentUser {
  id: string;
  login: string;
  name?: string;
  avatarUrl?: string;
  verified: boolean; // true if user.verified OR has platform_admin role
}

async function getRecentUsers(): Promise<RecentUser[]> {
  try {
    const { getDb, COLLECTIONS } = await import('@/lib/firebase');
    const db = getDb();

    const snapshot = await db
      .collection(COLLECTIONS.USERS)
      .orderBy('createdAt', 'desc')
      .limit(8)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      const roles: string[] = data.roles || [];
      const isPlatformAdmin = roles.includes('platform_admin');
      return {
        id: doc.id,
        login: data.login || 'unknown',
        name: data.name,
        avatarUrl: data.avatarUrl,
        verified: data.verified === true || isPlatformAdmin,
      };
    });
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return [];
  }
}

export default async function RecentUsers() {
  const users = await getRecentUsers();

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Senast anslutna
        </h3>
        <Link
          href="/register"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Gå med &rarr;
        </Link>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3 transition hover:bg-slate-800"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.login}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-medium text-slate-400">
                {user.login.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-white">
                  {user.name || user.login}
                </span>
                {user.verified && (
                  <span className="shrink-0" title="Verifierad">
                    <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-500">@{user.login}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
