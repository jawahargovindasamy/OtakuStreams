import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Resolves the anime title based on the selected language preference ("EN" or "JP").
 * 
 * @param {Object|String} item - Anime object or string title
 * @param {String} language - Selected language code ("EN" or "JP")
 * @returns {String} Resolved title string
 */
export function getAnimeTitle(item, language = "EN") {
  if (!item) return "Anime Title";
  if (typeof item === "string") return item;

  // Handle AniList nested object title: { english, romaji, native }
  if (typeof item.title === "object" && item.title !== null) {
    if (language === "JP") {
      return (
        item.title.native ||
        item.title.romaji ||
        item.jname ||
        item.japaneseTitle ||
        item.japanese_title ||
        item.title.english ||
        item.name ||
        "Anime Title"
      );
    }
    return (
      item.title.english ||
      item.title.romaji ||
      item.name ||
      item.title.native ||
      "Anime Title"
    );
  }

  // Handle flat object properties: name, jname, japaneseTitle, japanese_title, animeTitle, title
  const englishTitle = item.name || item.title || item.englishTitle || item.animeTitle;
  const japaneseTitle =
    item.jname ||
    item.japaneseTitle ||
    item.japanese_title ||
    item.japanese ||
    item.nativeTitle ||
    englishTitle;

  if (language === "JP") {
    return japaneseTitle || englishTitle || "Anime Title";
  }

  return englishTitle || japaneseTitle || "Anime Title";
}

/**
 * Checks whether an anime item or preload object matches a target ID.
 * 
 * @param {Object} info - Anime object or preloaded state
 * @param {String|Number} targetId - Target anime ID to compare against
 * @returns {Boolean} True if any associated ID matches targetId
 */
export function isMatchingAnimeInfo(info, targetId) {
  if (!info || !targetId) return false;
  const targetStr = targetId.toString();

  const possibleIds = [
    info?.id,
    info?.anime?.info?.id,
    info?.anime?.info?.malId,
    info?.Media?.id,
    info?.info?.id,
    info?.malId,
  ];

  return possibleIds.some((val) => val !== undefined && val !== null && val.toString() === targetStr);
}
