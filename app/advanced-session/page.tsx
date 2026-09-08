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
import { useImagePreload } from "@/lib/useImagePreload";
import { AdvancedFlashcard } from "@/components/AdvancedFlashcard";
import { TopBar } from "@/components/TopBar";

const advancedCards = advancedData as AdvancedCardEntry[];
const getKey = (entry: AdvancedCardEntry) => String(entry.cardId);

export default function AdvancedSessionPage() {
  const [session] = useState(() =>
    buildSession(advancedCards, loadProgress(ADVANCED_STORAGE_KEY), getKey)
  );
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({ known: 0, unknown: 0 });
  const [history, setHistory] = useState<boolean[]>([]);

  useImagePreload(session[index + 1]?.imageUrl);

  if (session.length === 0) {
    return (
      <>
        <TopBar backHref="/" backLabel="Voltar ao início" />
        <div className="page-shell">
          <div className="page-content" style={{ textAlign: "center" }}>
            <p className="muted">
              Nenhuma carta disponível ainda. Rode `npm run generate-advanced-source`,
              traduza e rode `npm run merge-advanced-data` primeiro.
            </p>
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
    const progress = loadProgress(ADVANCED_STORAGE_KEY);
    const key = getKey(current);
    const updated = known ? markKnown(progress, key) : markUnknown(progress, key);
    saveProgress(updated, ADVANCED_STORAGE_KEY);
    setResults((prev) => ({
      known: prev.known + (known ? 1 : 0),
      unknown: prev.unknown + (known ? 0 : 1),
    }));
    setHistory((prev) => [...prev, known]);
    setIndex((prev) => prev + 1);
  }

  return (
    <>
      <TopBar backHref="/" backLabel="Sair" eyebrow="Sessão · avançado" />
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
          <AdvancedFlashcard key={current.cardId} entry={current} onAnswer={handleAnswer} />
        </div>
      </div>
    </>
  );
}
