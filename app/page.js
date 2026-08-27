import Link from 'next/link';

// Landing page — port the LandingScreen visual from the prototype here.
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-bold">PadelGo</h1>
      <p className="text-slate-500 max-w-sm">Réservez votre terrain de padel simplement.</p>
      <div className="flex gap-3">
        <Link href="/clubs" className="px-4 py-2.5 rounded-xl bg-lime-400 font-semibold">Trouver un terrain</Link>
        <Link href="/register" className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold">Je suis un club</Link>
      </div>
    </main>
  );
}
