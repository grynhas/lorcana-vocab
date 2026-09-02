"use client";

import { useState } from "react";
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
      <mark key={index} className="rounded bg-yellow-200 px-1">
        {part}
      </mark>
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

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 p-6 shadow-sm">
      {!flipped ? (
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">{categoryLabel}</p>
          {entry.category === "keyword" || !example ? (
            <h2 className="mt-4 text-3xl font-semibold">{entry.term}</h2>
          ) : (
            <p className="mt-4 text-lg leading-relaxed">
              {highlightTerm(example.textSnippet, entry.term)}
            </p>
          )}
          <button
            type="button"
            className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white"
            onClick={() => setFlipped(true)}
          >
            Virar card
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-semibold">{entry.translation}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{categoryLabel}</p>
          {card && !imageFailed ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="mx-auto mt-4 h-64 w-auto rounded-lg object-contain"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="mx-auto mt-4 flex h-64 w-44 items-center justify-center rounded-lg bg-slate-100 p-2 text-center text-sm text-slate-500">
              {card ? card.name : "Sem carta de exemplo"}
            </div>
          )}
          {card && (
            <p className="mt-2 text-sm text-slate-500">{card.name}</p>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              className="rounded-md bg-red-100 px-4 py-2 text-red-700"
              onClick={() => {
                onAnswer(false);
                setFlipped(false);
              }}
            >
              Não sabia
            </button>
            <button
              type="button"
              className="rounded-md bg-green-100 px-4 py-2 text-green-700"
              onClick={() => {
                onAnswer(true);
                setFlipped(false);
              }}
            >
              Eu sabia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
