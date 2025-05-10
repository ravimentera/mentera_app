import { mockData } from "./mockData";

interface PatientContext {
  id: string;
  name?: string;
  // other patient properties
}

// Updated default response for a more generic fallback during a demo
const DEFAULT_MOCK_RESPONSE_MARKDOWN =
  "Bot: I seem to be having a little trouble with that request. Could you please try rephrasing or asking again in a moment?";
const MIN_KEYWORD_MATCH_SCORE = 2; // Minimum score to consider a match (tune this value)

// Simple list of common stop words to ignore during keyword matching
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "was",
  "are",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "should",
  "can",
  "could",
  "may",
  "might",
  "must",
  "i",
  "me",
  "my",
  "myself",
  "you",
  "your",
  "yourself",
  "he",
  "him",
  "his",
  "she",
  "her",
  "herself",
  "it",
  "its",
  "itself",
  "we",
  "us",
  "our",
  "ourselves",
  "they",
  "them",
  "their",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "is",
  "are",
  "was",
  "were",
  "in",
  "on",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "out",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "just",
  "don",
  "should've",
  "now",
  "d",
  "ll",
  "m",
  "o",
  "re",
  "ve",
  "y",
  "ain",
  "aren",
  "couldn",
  "didn",
  "doesn",
  "hadn",
  "hasn",
  "haven",
  "isn",
  "ma",
  "mightn",
  "mustn",
  "needn",
  "shan",
  "shouldn",
  "wasn",
  "weren",
  "won",
  "wouldn",
  "get",
  "give",
  "me",
  "some",
  "can",
  "i",
  "want",
  "to",
  "consider",
  "doing", // "patient" REMOVED from this list
]);

/**
 * Tokenizes a string into significant keywords.
 * Converts to lowercase, splits by non-alphanumeric characters, and filters stop words.
 * @param text The string to tokenize.
 * @returns An array of significant keywords.
 */
function tokenizeQuery(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(/[^a-z0-9-]+/) // Split by non-alphanumeric characters (keeping hyphens in words like pt-1004)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

/**
 * Calculates a simple match score based on common keywords.
 * @param userQueryTokens Tokens from the user's message.
 * @param mockQueryTokens Tokens from the mockData query.
 * @returns A numerical score.
 */
function calculateMatchScore(userQueryTokens: string[], mockQueryTokens: string[]): number {
  let score = 0;
  const userSet = new Set(userQueryTokens);
  for (const token of mockQueryTokens) {
    if (userSet.has(token)) {
      score += 1; // Each matching significant keyword adds 1 to the score
      if (token.startsWith("pt-")) score += 2; // Give more weight to patient IDs
      if (token === "history") score += 1; // Slightly boost "history" if it's a key term
    }
  }
  return score;
}

export function generateMockAiResponse(
  userMessage: string,
  patientContext?: PatientContext,
): string {
  const userQueryTokens = tokenizeQuery(userMessage);

  let bestScore = 0;
  let bestMatchMarkdown: string | null = null;
  let bestMatchQueryForLog: string | null = null;

  console.log(`[MockLogic] User query tokens: "[${userQueryTokens.join('", "')}]"`);
  if (patientContext) {
    console.log(
      `[MockLogic] Patient context: ID = ${patientContext.id}, Name = ${patientContext.name}`,
    );
  }

  for (const mockEntry of mockData) {
    const mockQueryTokens = tokenizeQuery(mockEntry.query);
    let currentScore = calculateMatchScore(userQueryTokens, mockQueryTokens);

    // Context boost: if patient ID from context is in user query AND mock query includes "patient" or the ID
    if (patientContext?.id) {
      const patientIdToken = patientContext.id.toLowerCase();
      if (
        userQueryTokens.includes(patientIdToken) &&
        (mockQueryTokens.includes(patientIdToken) || mockQueryTokens.includes("patient"))
      ) {
        currentScore += 3; // Boost score significantly if patient ID matches context and mock query is relevant
        console.log(
          `[MockLogic] Score for "${mockEntry.query.substring(0, 30)}..." boosted by patient context (${patientIdToken}). New score: ${currentScore}`,
        );
      }
    }

    console.log(
      `[MockLogic] Comparing with mock query: "${mockEntry.query.substring(0, 30)}..." (Tokens: [${mockQueryTokens.join('", "')}]) - Score: ${currentScore}`,
    );

    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestMatchMarkdown = mockEntry.markdown;
      bestMatchQueryForLog = mockEntry.query;
    }
  }

  if (bestMatchMarkdown && bestScore >= MIN_KEYWORD_MATCH_SCORE) {
    console.log(
      `[MockLogic] Best match found for query: "${bestMatchQueryForLog}" with score ${bestScore}. Returning its markdown.`,
    );
    return bestMatchMarkdown;
  }

  console.log(
    `[MockLogic] No sufficiently strong match found (best score: ${bestScore}). User tokens: [${userQueryTokens.join(", ")}]. Returning default response.`,
  );
  return DEFAULT_MOCK_RESPONSE_MARKDOWN;
}
