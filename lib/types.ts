export type TermCategory = "keyword" | "geral";

export type VocabularyExample = {
  cardId: number;
  textSnippet: string;
};

export type VocabularyEntry = {
  term: string;
  category: TermCategory;
  translation: string;
  frequency: number;
  examples: VocabularyExample[];
};

export type CardSummary = {
  id: number;
  name: string;
  type: string;
  cost: number;
  imageUrl: string;
};

export type ProgressEntry = {
  level: number; // 0 to 3 (correct answers in a row since the last miss)
  lastSeenAt: string; // ISO timestamp
};

export type ProgressMap = Record<string, ProgressEntry>;

export type AdvancedCardEntry = {
  cardId: number;
  name: string;
  imageUrl: string;
  textEn: string;
  textPt: string;
};
