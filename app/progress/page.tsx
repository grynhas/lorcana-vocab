"use client";

import { useEffect, useState } from "react";
import vocabularyData from "@/data/vocabulary.json";
import advancedData from "@/data/advanced.json";
import type { AdvancedCardEntry, ProgressMap, VocabularyEntry } from "@/lib/types";
import { ADVANCED_STORAGE_KEY, getLevel, loadProgress } from "@/lib/progress";
import { TopBar } from "@/components/TopBar";

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

function Meter({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="meter">
      <div className="top">
        <b>{label}</b>
        <span>{count}</span>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
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

  return (
    <>
      <TopBar backHref="/" backLabel="Voltar ao início" eyebrow="Progresso" />
      <div className="page-shell">
        <div className="page-content">
          <div className="secttl" style={{ marginTop: 0 }}>
            <h3>Vocabulário</h3>
          </div>
          <Meter label="Novo" count={vocabBuckets.novo} total={vocabulary.length} color="var(--state-new)" />
          <Meter label="Aprendendo" count={vocabBuckets.aprendendo} total={vocabulary.length} color="var(--state-learning)" />
          <Meter label="Dominado" count={vocabBuckets.dominado} total={vocabulary.length} color="var(--state-mastered)" />
          <p className="faint" style={{ fontSize: "var(--step--1)", margin: 0 }}>
            {vocabulary.length} termos no total.
          </p>

          <div className="secttl">
            <h3>Avançado</h3>
          </div>
          <Meter label="Novo" count={advancedBuckets.novo} total={advancedCards.length} color="var(--state-new)" />
          <Meter label="Aprendendo" count={advancedBuckets.aprendendo} total={advancedCards.length} color="var(--state-learning)" />
          <Meter label="Dominado" count={advancedBuckets.dominado} total={advancedCards.length} color="var(--state-mastered)" />
          <p className="faint" style={{ fontSize: "var(--step--1)", margin: 0 }}>
            {advancedCards.length} cartas no total.
          </p>
        </div>
      </div>
    </>
  );
}
