import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-3xl font-bold">Lorcana Vocab</h1>
      <p className="mt-2 text-slate-500">
        Aprenda o vocabulário de inglês usado nas cartas de Disney Lorcana.
      </p>
      <Link
        href="/session"
        className="mt-8 inline-block rounded-md bg-slate-900 px-6 py-3 text-white"
      >
        Começar sessão
      </Link>
      <Link href="/progress" className="mt-4 block text-sm text-slate-500 underline">
        Ver progresso
      </Link>
    </div>
  );
}
