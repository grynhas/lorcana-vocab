// English function words that carry no game-specific meaning on their own.
// Deliberately keeps modal verbs (may, can, must) and trigger words
// (when, whenever, if) out of this list — those are worth learning.
export const STOPWORDS: Set<string> = new Set([
  "a", "an", "the",
  "and", "or", "but", "nor",
  "of", "to", "in", "on", "at", "for", "from", "by", "as", "with", "into", "onto",
  "is", "are", "was", "were", "be", "been", "being",
  "it", "its", "you", "your", "yours",
  "this", "that", "these", "those",
  "they", "them", "their", "theirs",
  "he", "him", "his", "she", "her", "hers",
  "we", "us", "our", "ours", "i", "me", "my", "mine",
  "who", "whom", "whose", "which", "what", "where",
  "then", "else", "so", "than", "too", "very", "just",
  "own", "same", "other", "another", "such",
  "some", "any", "all", "each", "every", "both", "few", "more", "most",
  "no", "not", "nor", "s",
]);
