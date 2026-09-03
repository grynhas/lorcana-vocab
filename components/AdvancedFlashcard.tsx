"use client";

import { useState } from "react";
import type { AdvancedCardEntry } from "@/lib/types";

type AdvancedFlashcardProps = {
  entry: AdvancedCardEntry;
  onAnswer: (known: boolean) => void;
};

export function AdvancedFlashcard({ entry, onAnswer }: AdvancedFlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 p-6 shadow-sm">
      {!flipped ? (
        <div className="text-center">
          {!imageFailed ? (
            <img
              src={entry.imageUrl}
              alt={entry.name}
              className="mx-auto h-64 w-auto rounded-lg object-contain"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="mx-auto flex h-64 w-44 items-center justify-center rounded-lg bg-slate-100 p-2 text-center text-sm text-slate-500">
              {entry.name}
            </div>
          )}
          <p className="mt-2 text-sm text-slate-500">{entry.name}</p>
          <button
            type="button"
            className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white"
            onClick={() => setFlipped(true)}
          >
            Virar card
          </button>
        </div>
      ) : (
        <div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Inglês</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{entry.textEn}</p>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Português</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{entry.textPt}</p>
          </div>
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
