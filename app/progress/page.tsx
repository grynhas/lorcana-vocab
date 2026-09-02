"use client";

import { useEffect, useState } from "react";
import vocabularyData from "@/data/vocabulary.json";
import type { ProgressMap, VocabularyEntry } from "@/lib/types";
import { getLevel, loadProgress } from "@/lib/progress";

const vocabulary = vocabularyData as VocabularyEntry[];

function bucketFor(level: number): "novo" | "aprendendo" | "dominado" {
  if (level === 0) return "novo";
  if (level < 3) return "aprendendo";
  return "dominado";
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const buckets = { novo: 0, aprendendo: 0, dominado: 0 };
  for (const entry of vocabulary) {
    buckets[bucketFor(getLevel(progress, entry.term))] += 1;
  }
  const total = vocabulary.length;

  function bar(label: string, count: number, colorClass: string) {
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
      {bar("Novo", buckets.novo, "bg-red-400")}
      {bar("Aprendendo", buckets.aprendendo, "bg-amber-400")}
      {bar("Dominado", buckets.dominado, "bg-green-500")}
      <p className="mt-4 text-sm text-slate-500">{total} termos no total.</p>
    </div>
  );
}
