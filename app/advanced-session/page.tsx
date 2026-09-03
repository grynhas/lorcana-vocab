"use client";

import { useState } from "react";
import Link from "next/link";
import advancedData from "@/data/advanced.json";
import type { AdvancedCardEntry } from "@/lib/types";
import {
  ADVANCED_STORAGE_KEY,
  loadProgress,
  markKnown,
  markUnknown,
  saveProgress,
} from "@/lib/progress";
import { buildSession } from "@/lib/session";
import { AdvancedFlashcard } from "@/components/AdvancedFlashcard";

const advancedCards = advancedData as AdvancedCardEntry[];
const getKey = (entry: AdvancedCardEntry) => String(entry.cardId);

export default function AdvancedSessionPage() {
  const [session] = useState(() =>
    buildSession(advancedCards, loadProgress(ADVANCED_STORAGE_KEY), getKey)
  );
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({ known: 0, unknown: 0 });

  if (session.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>
          Nenhuma carta disponível ainda. Rode `npm run generate-advanced-source`,
          traduza e rode `npm run merge-advanced-data` primeiro.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  if (index >= session.length) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h2 className="text-2xl font-semibold">Sessão concluída!</h2>
        <p className="mt-4">
          Acertos: {results.known} · Erros: {results.unknown}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          Voltar ao início
        </Link>
      </div>
    );
  }

  const current = session[index];

  function handleAnswer(known: boolean) {
    const progress = loadProgress(ADVANCED_STORAGE_KEY);
    const key = getKey(current);
    const updated = known ? markKnown(progress, key) : markUnknown(progress, key);
    saveProgress(updated, ADVANCED_STORAGE_KEY);
    setResults((prev) => ({
      known: prev.known + (known ? 1 : 0),
      unknown: prev.unknown + (known ? 0 : 1),
    }));
    setIndex((prev) => prev + 1);
  }

  return (
    <div className="p-8">
      <p className="mb-4 text-center text-sm text-slate-500">
        {index + 1} / {session.length}
      </p>
      <AdvancedFlashcard key={current.cardId} entry={current} onAnswer={handleAnswer} />
    </div>
  );
}
