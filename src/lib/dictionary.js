import { WORDS } from "./content.js";

const CACHE_PREFIX = "daybook-dictionary:";

function fallback(word) {
  return { word: word.word, meaning: word.meaning, phonetic: "", audio: "", example: "" };
}

// DictionaryAPI.dev is free and does not need an API key. The local word list
// remains the source of the daily rotation and the offline fallback.
export async function getDictionaryEntry(word) {
  const cacheKey = `${CACHE_PREFIX}${word.word.toLowerCase()}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.word)}`);
    if (!response.ok) throw new Error("Dictionary entry unavailable");
    const [entry] = await response.json();
    const phoneticEntry = entry.phonetics?.find((item) => item.audio) || entry.phonetics?.[0];
    const definition = entry.meanings?.flatMap((meaning) => meaning.definitions || []).find(Boolean);
    const result = {
      word: entry.word || word.word,
      meaning: definition?.definition || word.meaning,
      phonetic: phoneticEntry?.text || entry.phonetic || "",
      audio: phoneticEntry?.audio || "",
      example: definition?.example || "",
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch {
    return fallback(word);
  }
}

export function findFallbackWord(name) {
  return WORDS.find((word) => word.word.toLowerCase() === name?.toLowerCase());
}
