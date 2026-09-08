"use client";

import { useState } from "react";
import Link from "next/link";
import vocabularyData from "@/data/vocabulary.json";
import cardsData from "@/data/cards.json";
import type { CardSummary, VocabularyEntry } from "@/lib/types";
import { loadProgress, markKnown, markUnknown, saveProgress } from "@/lib/progress";
import { buildSession } from "@/lib/session";
import { Flashcard } from "@/components/Flashcard";
import { TopBar } from "@/components/TopBar";

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
  const [history, setHistory] = useState<boolean[]>([]);

  if (session.length === 0) {
    return (
      <>
        <TopBar backHref="/" backLabel="Voltar ao início" />
        <div className="page-shell">
          <div className="page-content" style={{ textAlign: "center" }}>
            <p className="muted">Nenhum termo disponível ainda. Rode `npm run generate-data` primeiro.</p>
            <Link href="/" className="link-back" style={{ marginTop: "var(--sp-4)", justifyContent: "center" }}>
              Voltar ao início
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (index >= session.length) {
    return (
      <>
        <TopBar backHref="/" backLabel="Voltar ao início" />
        <div className="page-shell">
          <div className="page-content" style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "var(--step-2)", fontWeight: 600 }}>Sessão concluída!</h2>
            <p className="muted" style={{ marginTop: "var(--sp-4)" }}>
              Acertos: {results.known} · Erros: {results.unknown}
            </p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: "var(--sp-6)", display: "inline-flex" }}>
              Voltar ao início
            </Link>
          </div>
        </div>
      </>
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
    setHistory((prev) => [...prev, known]);
    setIndex((prev) => prev + 1);
  }

  return (
    <>
      <TopBar backHref="/" backLabel="Sair" eyebrow="Sessão · vocabulário" />
      <div className="page-shell">
        <div className="page-content">
          <div className="progress-head">
            <div className="seg">
              {session.map((_, i) => (
                <i
                  key={i}
                  className={
                    i < history.length
                      ? history[i]
                        ? "done"
                        : "miss"
                      : i === index
                        ? "now"
                        : ""
                  }
                />
              ))}
            </div>
            <span className="count">
              {index + 1} / {session.length}
            </span>
          </div>
          <Flashcard
            key={current.term}
            entry={current}
            card={current.examples[0] ? cardById.get(current.examples[0].cardId) : undefined}
            onAnswer={handleAnswer}
          />
        </div>
      </div>
    </>
  );
}
