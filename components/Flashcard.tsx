"use client";

import { useEffect, useState } from "react";
import type { CardSummary, VocabularyEntry } from "@/lib/types";

type FlashcardProps = {
  entry: VocabularyEntry;
  card?: CardSummary;
  onAnswer: (known: boolean) => void;
};

function highlightTerm(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export function Flashcard({ entry, card, onAnswer }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const example = entry.examples[0];
  const categoryLabel = entry.category === "keyword" ? "Palavra-chave" : "Vocabulário";

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
      {!flipped ? (
        <>
          <span className="eyebrow">{categoryLabel}</span>
          {entry.category === "keyword" || !example ? (
            <div className="word">{entry.term}</div>
          ) : (
            <div className="quote" style={{ marginTop: "var(--sp-4)" }}>
              {highlightTerm(example.textSnippet, entry.term)}
            </div>
          )}
          <button type="button" className="btn btn-primary" onClick={() => setFlipped(true)}>
            Virar card
          </button>
          <p className="hint">
            <kbd>espaço</kbd> virar
          </p>
        </>
      ) : (
        <>
          <span className="eyebrow">{categoryLabel}</span>
          <div className="word">{entry.term}</div>
          <div className="translation">{entry.translation}</div>
          {card && !imageFailed ? (
            <div className="cardimg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.imageUrl} alt={card.name} onError={() => setImageFailed(true)} />
            </div>
          ) : card ? (
            <div className="cardimg">{card.name}</div>
          ) : null}
          {example && (
            <div className="quote">{highlightTerm(example.textSnippet, entry.term)}</div>
          )}
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
