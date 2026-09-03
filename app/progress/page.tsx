"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import vocabularyData from "@/data/vocabulary.json";
import advancedData from "@/data/advanced.json";
import type { AdvancedCardEntry, ProgressMap, VocabularyEntry } from "@/lib/types";
import { ADVANCED_STORAGE_KEY, getLevel, loadProgress } from "@/lib/progress";

const vocabulary = vocabularyData as VocabularyEntry[];
const advancedCards = advancedData as AdvancedCardEntry[];

function bucketFor(level: number): "novo" | "aprendendo" | "dominado" {
  if (level === 0) return "novo";
  if (level < 3) return "aprendendo";
  return "dominado";
}

function countBuckets<T>(items: T[], progress: ProgressMap, getKey: (item: T) => string) {
  const buckets = { novo: 0, aprendendo: 0, dominado: 0 };
  for (const item of items) {
    buckets[bucketFor(getLevel(progress, getKey(item)))] += 1;
  }
  return buckets;
}

export default function ProgressPage() {
  const [vocabProgress, setVocabProgress] = useState<ProgressMap>({});
  const [advancedProgress, setAdvancedProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setVocabProgress(loadProgress());
    setAdvancedProgress(loadProgress(ADVANCED_STORAGE_KEY));
  }, []);

  const vocabBuckets = countBuckets(vocabulary, vocabProgress, (entry) => entry.term);
  const advancedBuckets = countBuckets(
    advancedCards,
    advancedProgress,
    (entry) => String(entry.cardId)
  );

  function bar(label: string, count: number, total: number, colorClass: string) {
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return (
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-sm">
          <span>{label}</span>
          <span>{count}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h2 className="mb-6 text-2xl font-semibold">Progresso</h2>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Vocabulário
      </h3>
      {bar("Novo", vocabBuckets.novo, vocabulary.length, "bg-red-400")}
      {bar("Aprendendo", vocabBuckets.aprendendo, vocabulary.length, "bg-amber-400")}
      {bar("Dominado", vocabBuckets.dominado, vocabulary.length, "bg-green-500")}
      <p className="mb-6 text-sm text-slate-500">{vocabulary.length} termos no total.</p>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Avançado
      </h3>
      {bar("Novo", advancedBuckets.novo, advancedCards.length, "bg-red-400")}
      {bar("Aprendendo", advancedBuckets.aprendendo, advancedCards.length, "bg-amber-400")}
      {bar("Dominado", advancedBuckets.dominado, advancedCards.length, "bg-green-500")}
      <p className="text-sm text-slate-500">{advancedCards.length} cartas no total.</p>

      <Link href="/" className="mt-6 inline-block text-sm underline">
        Voltar ao início
      </Link>
    </div>
  );
}
