"use client";

import { useState } from "react";
import Link from "next/link";
import vocabularyData from "@/data/vocabulary.json";
import cardsData from "@/data/cards.json";
import type { CardSummary, VocabularyEntry } from "@/lib/types";
import { loadProgress, markKnown, markUnknown, saveProgress } from "@/lib/progress";
import { buildSession } from "@/lib/session";
import { Flashcard } from "@/components/Flashcard";

const vocabulary = vocabularyData as VocabularyEntry[];
const cardById = new Map<number, CardSummary>(
  (cardsData as CardSummary[]).map((card) => [card.id, card])
);

export default function SessionPage() {
  const [session] = useState(() =>
    buildSession(vocabulary, loadProgress(), (entry) => entry.term)
  );
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({ known: 0, unknown: 0 });

  if (session.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Nenhum termo disponível ainda. Rode `npm run generate-data` primeiro.</p>
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
    const progress = loadProgress();
    const updated = known ? markKnown(progress, current.term) : markUnknown(progress, current.term);
    saveProgress(updated);
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
      <Flashcard
        key={current.term}
        entry={current}
        card={current.examples[0] ? cardById.get(current.examples[0].cardId) : undefined}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
