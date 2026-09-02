export type LorcanaKeywordAbility = {
  type: "keyword";
  keyword: string;
  keywordValueNumber?: number;
  fullText: string;
  reminderText?: string;
};

export type LorcanaEffectAbility = {
  type: "triggered" | "static" | "activated";
  name?: string;
  effect: string;
  fullText: string;
};

export type LorcanaAbility = LorcanaKeywordAbility | LorcanaEffectAbility;

export type LorcanaCard = {
  id: number;
  name: string;
  fullName: string;
  type: string;
  cost?: number;
  images: { full: string; thumbnail?: string };
  abilities?: LorcanaAbility[];
};

const ALL_CARDS_URL = "https://lorcanajson.org/files/current/en/allCards.json";

export async function fetchAllCards(): Promise<LorcanaCard[]> {
  const response = await fetch(ALL_CARDS_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to download LorcanaJSON data set: ${response.status} ${response.statusText}`
    );
  }
  const data = (await response.json()) as { cards: LorcanaCard[] };
  return data.cards;
}
