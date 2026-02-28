import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl bg-white/10 p-8 backdrop-blur text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Kolla din e-post</h1>
          <p className="text-slate-400 mb-6">
            En inloggningslänk har skickats till din e-postadress.
            Klicka på länken i mailet för att logga in.
          </p>

          <div className="bg-slate-800/50 rounded-lg p-4 text-left text-sm text-slate-400 mb-6">
            <p className="mb-2">Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Länken är giltig i 24 timmar</li>
              <li>Kolla skräpposten om du inte hittar mailet</li>
              <li>Du kan stänga denna flik efter att du klickat på länken</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/auth/kommun"
              className="block w-full rounded-lg bg-white/10 px-4 py-3 font-medium text-white transition hover:bg-white/20"
            >
              Försök igen
            </Link>
            <Link
              href="/"
              className="block text-slate-400 hover:text-white text-sm"
            >
              Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
