"use client";

import { useEffect, useState } from "react";
import type { AdvancedCardEntry } from "@/lib/types";

type AdvancedFlashcardProps = {
  entry: AdvancedCardEntry;
  onAnswer: (known: boolean) => void;
};

export function AdvancedFlashcard({ entry, onAnswer }: AdvancedFlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  function answer(known: boolean) {
    onAnswer(known);
    setFlipped(false);
  }

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea")) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (!flipped) setFlipped(true);
      } else if (flipped && event.key === "1") {
        answer(false);
      } else if (flipped && event.key === "2") {
        answer(true);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  return (
    <div className="fcard">
      <span className="eyebrow">Modo avançado</span>
      {!imageFailed ? (
        <div className="cardimg cardimg-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entry.imageUrl} alt={entry.name} onError={() => setImageFailed(true)} />
        </div>
      ) : (
        <div className="cardimg cardimg-lg">{entry.name}</div>
      )}
      <p className="muted" style={{ fontSize: "var(--step--1)", margin: "var(--sp-2) 0 0" }}>
        {entry.name}
      </p>

      {!flipped ? (
        <>
          <div className="textblock">
            <span className="eyebrow">Inglês</span>
            <p>{entry.textEn}</p>
          </div>
          <button type="button" className="btn btn-primary" style={{ marginTop: "var(--sp-5)" }} onClick={() => setFlipped(true)}>
            Virar card
          </button>
          <p className="hint">
            <kbd>espaço</kbd> virar
          </p>
        </>
      ) : (
        <>
          <div className="textblock pt">
            <span className="eyebrow">Português</span>
            <p>{entry.textPt}</p>
          </div>
          <div className="grade">
            <button type="button" className="btn btn-dont" onClick={() => answer(false)}>
              ✕ Não sabia
            </button>
            <button type="button" className="btn btn-know" onClick={() => answer(true)}>
              ✓ Eu sabia
            </button>
          </div>
          <p className="hint">
            <kbd>1</kbd> não sabia · <kbd>2</kbd> eu sabia
          </p>
        </>
      )}
    </div>
  );
}
