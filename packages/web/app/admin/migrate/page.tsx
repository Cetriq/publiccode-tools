'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function MigratePage() {
  const { data: session, status } = useSession();
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runMigration() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/migrate-registered-by', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return <div className="p-8 text-white">Laddar...</div>;
  }

  if (!session) {
    return <div className="p-8 text-white">Du måste vara inloggad.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8 pt-24">
      <h1 className="text-2xl font-bold text-white mb-4">Admin: Kör migrering</h1>
      <p className="text-slate-400 mb-4">
        Denna migrering lägger till <code>registeredByLower</code>-fält för alla repos.
      </p>
      <button
        onClick={runMigration}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Kör migrering...' : 'Kör migrering'}
      </button>
      {result && (
        <pre className="mt-4 bg-slate-800 p-4 rounded text-green-400 overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
