import axios from "axios";
import { createContext, useContext, useEffect, useState, useRef } from "react";

/* -------------------- Constants -------------------- */
const ANILIST_API = "https://graphql.anilist.co";
const studioCache = new Map();

/* -------------------- Retry Helper -------------------- */
const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    const shouldRetry =
      !error.response || error.response.status >= 500 || error.response.status === 429;

    if (retries > 0 && shouldRetry) {
      await new Promise((res) => setTimeout(res, delay));
      return fetchWithRetry(fn, retries - 1, Math.min(delay * 2, 8000));
    }
    throw error;
  }
};

const anilistQuery = async (query, variables = {}) => {
  const res = await fetchWithRetry(() => axios.post(ANILIST_API, { query, variables }, { timeout: 15000 }));
  return res.data;
};

/* -------------------- Data Mapping -------------------- */
const mapAniListToAnime = (media) => {
  if (!media) return null;
  return {
    id: media.id.toString(),
    malId: media.idMal || null,
    name: media.title?.english || media.title?.romaji || media.title?.native,
    jname: media.title?.romaji || media.title?.native,
    poster: media.coverImage?.extraLarge || media.coverImage?.large,
    banner: media.bannerImage || null,
    type: media.format ? media.format.toUpperCase() : "TV",
    otherInfo: [
      media.format ? media.format.toUpperCase() : "TV",
      media.episodes ? `${media.episodes} eps` : "? eps",
      (media.startDate?.year || media.seasonYear) ? (media.startDate?.year || media.seasonYear).toString() : "?"
    ],
    episodes: {
      sub: media.episodes || "?",
      dub: null,
    },
    rating: media.averageScore ? (media.averageScore / 10).toFixed(1) : null,
    year: media.startDate?.year || media.seasonYear || null,
    description: media.description?.replace(/<[^>]*>?/gm, ''), // Basic HTML tag strip
    rank: media.popularity, // using popularity as rank equivalent or standard
  };
};

const mapJikanToAnime = (anime) => {
  if (!anime) return null;
  return {
    id: `mal-${anime.mal_id}`, // Prefix with mal- to distinguish from AniList IDs
    malId: anime.mal_id,
    name: anime.title_english || anime.title,
    jname: anime.title_japanese || anime.title,
    poster: anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url,
    type: anime.type ? anime.type.toUpperCase() : "TV",
    otherInfo: [
      anime.type ? anime.type.toUpperCase() : "TV",
      anime.episodes ? `${anime.episodes} eps` : "? eps",
      anime.year ? anime.year.toString() : "?"
    ],
    episodes: {
      sub: anime.episodes || "?",
      dub: null,
    },
    rating: anime.score ? anime.score.toFixed(1) : null,
    year: anime.year || null,
    description: anime.synopsis?.replace(/<[^>]*>?/gm, ''),
  };
};

/* -------------------- Context -------------------- */
const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [homedata, setHomedata] = useState(null);

  const cacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());
  const CACHE_TTL = 1000 * 60 * 10;
  const FIVE_HOURS = 1000 * 60 * 60 * 5;
  const ONE_DAY = 1000 * 60 * 60 * 24;

  const fetchWithCache = async (key, fn, ttl = CACHE_TTL) => {
    const now = Date.now();
    let cached = cacheRef.current.get(key);

    if (!cached) {
      try {
        const sessionData = sessionStorage.getItem(`otaku_cache_${key}`);
        if (sessionData) {
          cached = JSON.parse(sessionData);
          cacheRef.current.set(key, cached);
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }

    if (cached && now - cached.timestamp >= ttl) {
      cacheRef.current.delete(key);
      try { sessionStorage.removeItem(`otaku_cache_${key}`); } catch (e) { }
    }
    if (cached && now - cached.timestamp < ttl) {
      return cached.data;
    }
    if (inFlightRef.current.has(key)) {
      return inFlightRef.current.get(key);
    }

    const promise = (async () => {
      try {
        const result = await fn();
        if (result !== null) {
          const cacheObj = { data: result, timestamp: Date.now() };
          cacheRef.current.set(key, cacheObj);
          try {
            sessionStorage.setItem(`otaku_cache_${key}`, JSON.stringify(cacheObj));
          } catch (e) {
            console.warn("Session storage quota exceeded for cache");
          }
        }
        return result;
      } finally {
        inFlightRef.current.delete(key);
      }
    })();

    inFlightRef.current.set(key, promise);
    return promise;
  };

  /* -------------------- HOME -------------------- */
  const fetchHomedata = async () => {
    try {
      const data = await fetchWithCache("home", async () => {
        const query = `
          query {
            trending: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: TRENDING_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } status popularity }
            }
            popular: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            topAiring: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], status: RELEASING, genre_not_in: ["Hentai"], sort: SCORE_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            favorite: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: FAVOURITES_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            latestCompleted: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], status: FINISHED, genre_not_in: ["Hentai"], sort: END_DATE_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            topUpcoming: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], status: NOT_YET_RELEASED, genre_not_in: ["Hentai"], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            GenreCollection
          }
        `;
        const result = await anilistQuery(query);
        const resData = result.data;

        return {
          trendingAnimes: resData.trending.media.map(mapAniListToAnime).slice(0, 10),
          topAiringAnimes: resData.topAiring.media.map(mapAniListToAnime),
          mostPopularAnimes: resData.popular.media.map(mapAniListToAnime),
          mostFavoriteAnimes: resData.favorite.media.map(mapAniListToAnime),
          latestCompletedAnimes: resData.latestCompleted.media.map(mapAniListToAnime),
          latestEpisodeAnimes: resData.topAiring.media.map(mapAniListToAnime), // Proxy
          topUpcomingAnimes: resData.topUpcoming.media.map(mapAniListToAnime),
          spotlightAnimes: resData.trending.media.map(mapAniListToAnime).slice(0, 10),
          genres: resData.GenreCollection.filter(g => g && g !== "Hentai"),
          top10Animes: {
            today: resData.trending.media.map(mapAniListToAnime).slice(0, 10),
            week: resData.popular.media.map(mapAniListToAnime).slice(0, 10),
            month: resData.favorite.media.map(mapAniListToAnime).slice(0, 10) // Mapped to SCORE_DESC conceptually but using favs here
          }
        };
      }, FIVE_HOURS);

      setHomedata({ data });
      return { data };
    } catch (error) {
      console.error("Home fetch failed:", error);
      return null;
    }
  };

  /* -------------------- A–Z LIST / CATEGORIES -------------------- */
  const fetchazlistdata = async (azlist, page = 1) => {
    const key = `az-list-${azlist}-page-${page}`;
    return fetchWithCache(key, async () => {
      try {
        const sideQuery = `
          query {
            topToday: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: TRENDING_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity } }
            topWeek: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity } }
            topMonth: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: SCORE_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity } }
          }
        `;
        const sideResult = await anilistQuery(sideQuery);
        const { topToday, topWeek, topMonth } = sideResult.data;

        let mappedAnimes = [];
        let hasNextPage = false;
        let totalPages = 1;

        if (azlist === "all" || azlist === "other" || azlist === "0-9") {
          const query = `
             query ($page: Int) {
               Page(page: $page, perPage: 24) {
                 pageInfo { hasNextPage lastPage }
                 media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: [TITLE_ROMAJI]) {
                   id idMal title { english romaji native } coverImage { extraLarge large } format episodes seasonYear startDate { year } averageScore popularity
                 }
               }
             }
           `;
          const res = await anilistQuery(query, { page });
          mappedAnimes = res.data.Page.media.map(mapAniListToAnime);
          hasNextPage = res.data.Page.pageInfo.hasNextPage;
          totalPages = res.data.Page.pageInfo.lastPage;

          if (azlist === "0-9") {
            mappedAnimes = mappedAnimes.filter(a => /^[0-9]/.test(a.name) || /^[0-9]/.test(a.jname));
          } else if (azlist === "other") {
            mappedAnimes = mappedAnimes.filter(a => /^[^a-zA-Z0-9]/.test(a.name) || /^[^a-zA-Z0-9]/.test(a.jname));
          }

        } else {
          try {
            const jikanRes = await fetchWithRetry(() => axios.get(`https://api.jikan.moe/v4/anime?letter=${azlist}&page=${page}&limit=24`), 1);
            const malIds = jikanRes.data.data.map(a => a.mal_id);
            hasNextPage = jikanRes.data.pagination.has_next_page;
            totalPages = jikanRes.data.pagination.last_visible_page;

            if (malIds.length > 0) {
              const aniQuery = `
                 query($idMals: [Int]) {
                   Page(page: 1, perPage: 24) {
                     media(idMal_in: $idMals, genre_not_in: ["Hentai"]) {
                       id idMal title { english romaji native } coverImage { extraLarge large } format episodes seasonYear startDate { year } averageScore popularity
                     }
                   }
                 }
               `;
              const aniRes = await anilistQuery(aniQuery, { idMals: malIds });
              const aniMap = {};
              aniRes.data.Page.media.forEach(m => { if (m.idMal) aniMap[m.idMal] = m; });
              const sortedMedia = malIds.map(malId => aniMap[malId]).filter(Boolean);
              mappedAnimes = sortedMedia.map(mapAniListToAnime);
            }
          } catch (error) {
            const query = `
               query ($page: Int, $search: String) {
                 Page(page: $page, perPage: 24) {
                   pageInfo { hasNextPage lastPage }
                   media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], search: $search, sort: [TITLE_ROMAJI]) {
                     id idMal title { english romaji native } coverImage { extraLarge large } format episodes seasonYear startDate { year } averageScore popularity
                   }
                 }
               }
             `;
            const res = await anilistQuery(query, { page, search: azlist });
            mappedAnimes = res.data.Page.media.map(mapAniListToAnime);
            hasNextPage = res.data.Page.pageInfo.hasNextPage;
            totalPages = res.data.Page.pageInfo.lastPage;
          }
        }

        return {
          animes: mappedAnimes,
          top10Animes: {
            today: topToday.media.map(mapAniListToAnime),
            week: topWeek.media.map(mapAniListToAnime),
            month: topMonth.media.map(mapAniListToAnime)
          },
          currentPage: page,
          hasNextPage,
          totalPages
        };
      } catch (error) {
        console.error("A-Z list fetch failed:", error);
        return null;
      }
    }, FIVE_HOURS);
  };

  /* -------------------- ANIME INFO -------------------- */
  const fetchanimeinfo = async (id) => {
    return fetchWithCache(`anime-${id}`, async () => {
      try {
        const isMal = id.toString().startsWith('mal-');
        const cleanId = isMal ? parseInt(id.replace('mal-', '')) : parseInt(id);

        const query = `
          query ($id: Int, $idMal: Int) {
            Media(id: $id, idMal: $idMal, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT]) {
              id
              idMal
              title { english romaji native }
              synonyms
              coverImage { extraLarge large }
              bannerImage
              description
              episodes
              nextAiringEpisode {
                episode
              }
              streamingEpisodes {
                title
              }
              status
              averageScore
              genres
              season
              seasonYear
              startDate { year }
              format
              popularity
              studios(isMain: true) { nodes { name } }
              characters(sort: [ROLE, FAVOURITES_DESC], page: 1, perPage: 12) {
                edges {
                  role
                  node { id name { full } image { large } }
                  voiceActors(language: JAPANESE) { id name { full } image { large } languageV2 }
                }
              }
              recommendations(sort: RATING_DESC, page: 1, perPage: 15) {
                nodes { mediaRecommendation { id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity genres } }
              }
              relations {
                edges { relationType node { id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity genres } }
              }
            }
          }
        `;
        const result = await anilistQuery(query, isMal ? { idMal: cleanId } : { id: cleanId });
        const node = result.data.Media;

        if (node && node.genres && node.genres.includes("Hentai")) {
          return null;
        }

        const finalEpCount = node.nextAiringEpisode ? node.nextAiringEpisode.episode - 1 : (node.episodes || "?");

        const characters = node.characters.edges.map(c => ({
          character: {
            id: c.node.id.toString(),
            name: c.node.name.full,
            poster: c.node.image.large,
            role: c.role
          },
          voiceActor: c.voiceActors?.[0] ? {
            name: c.voiceActors[0].name.full,
            poster: c.voiceActors[0].image.large,
            language: c.voiceActors[0].languageV2
          } : null
        }));

        const mappedRecommendations = node.recommendations.nodes
          .map(r => r.mediaRecommendation)
          .filter(Boolean)
          .filter(media => !media.genres?.includes("Hentai"))
          .map(mapAniListToAnime);

        const mappedRelations = node.relations.edges
          .map(r => r.node)
          .filter(Boolean)
          .filter(media => !media.genres?.includes("Hentai"))
          .map(mapAniListToAnime);

        return {
          anime: {
            info: {
              id: node.id.toString(),
              malId: node.idMal,
              name: node.title.english || node.title.romaji,
              jname: node.title.romaji,
              poster: node.coverImage?.extraLarge || node.coverImage?.large,
              description: node.description?.replace(/<[^>]*>?/gm, ''),
              charactersVoiceActors: characters,
              stats: {
                rating: node.averageScore ? (node.averageScore / 10).toString() : "?",
                quality: "HD",
                episodes: {
                  sub: finalEpCount,
                  dub: null
                },
                type: node.format ? node.format.toUpperCase() : "TV",
                duration: node.duration ? `${node.duration}m` : (node.format?.toUpperCase() === "MOVIE" ? "1h" : "24m"),
              }
            },
            moreInfo: {
              japanese: node.title.native,
              synonyms: node.synonyms?.[0] || "",
              aired: node.seasonYear ? `${node.season} ${node.seasonYear}` : "?",
              premiered: node.seasonYear ? `${node.season} ${node.seasonYear}` : "?",
              duration: node.duration ? `${node.duration}m` : (node.format?.toUpperCase() === "MOVIE" ? "1h" : "24m"),
              status: node.status,
              malscore: node.averageScore ? node.averageScore / 10 : "?",
              genres: node.genres,
              studios: node.studios?.nodes?.map(s => s.name).join(", "),
              producers: []
            }
          },
          recommendedAnimes: mappedRecommendations,
          relatedAnimes: mappedRelations
        };
      } catch (error) {
        console.error("Anime info fetch failed:", error);
        return null;
      }
    }, FIVE_HOURS);
  };

  /* -------------------- SEARCH -------------------- */
  const fetchsearch = async (keyword, page = 1) => {
    const key = `search-v4-${keyword}-page-${page}`;
    return fetchWithCache(key, async () => {
      try {
        const query = `
          query($q: String, $page: Int) {
            Page(page: $page, perPage: 24) {
              pageInfo {
                hasNextPage
                lastPage
              }
              media(search: $q, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: POPULARITY_DESC) {
                id
                idMal
                title {
                  english
                  romaji
                  native
                }
                coverImage {
                  large
                }
                format
                episodes
                averageScore
                seasonYear
                startDate {
                  year
                }
                popularity
              }
            }
            popular: Page(page: 1, perPage: 10) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: POPULARITY_DESC) {
                id
                idMal
                title {
                  english
                  romaji
                  native
                }
                coverImage {
                  large
                }
                format
                episodes
                averageScore
                seasonYear
                startDate {
                  year
                }
                popularity
              }
            }
          }
        `;
        const result = await anilistQuery(query, { q: keyword, page });
        const searchData = result?.data?.Page;
        const popularData = result?.data?.popular;

        if (!searchData) {
          throw new Error("No search results found");
        }

        return {
          animes: searchData.media.map(mapAniListToAnime),
          mostPopularAnimes: popularData?.media?.map(mapAniListToAnime) || [],
          searchQuery: keyword,
          currentPage: page,
          hasNextPage: searchData.pageInfo.hasNextPage,
          totalPages: searchData.pageInfo.lastPage || 1
        };
      } catch (error) {
        console.error("AniList search failed:", error);
        return {
          animes: [],
          mostPopularAnimes: [],
          searchQuery: keyword,
          currentPage: page,
          hasNextPage: false,
          totalPages: 0
        };
      }
    }, FIVE_HOURS);
  };

  const fetchadvancedsearch = async ({ q, page = 1, type, status, rated, score, season, sort, start_date, end_date, genres }) => {
    const key = `advanced-search-${JSON.stringify({ q, page, type, status, rated, score, season, sort, start_date, end_date, genres })}`;

    return fetchWithCache(key, async () => {
      try {
        let variables = { page, perPage: 24 };
        if (q) variables.search = q;
        if (type) variables.format = type.toUpperCase();
        if (status) {
          const statusMap = { "finished-airing": "FINISHED", "currently-airing": "RELEASING", "not-yet-aired": "NOT_YET_RELEASED" };
          variables.status = statusMap[status] || status.toUpperCase();
        }
        if (genres && genres.length > 0) {
          const genreMap = {
            "action": "Action",
            "adventure": "Adventure",
            "comedy": "Comedy",
            "drama": "Drama",
            "ecchi": "Ecchi",
            "fantasy": "Fantasy",
            "hentai": "Hentai",
            "horror": "Horror",
            "mahou-shoujo": "Mahou Shoujo",
            "mecha": "Mecha",
            "music": "Music",
            "mystery": "Mystery",
            "psychological": "Psychological",
            "romance": "Romance",
            "sci-fi": "Sci-Fi",
            "slice-of-life": "Slice of Life",
            "sports": "Sports",
            "supernatural": "Supernatural",
            "thriller": "Thriller",
            "martial-arts": "Martial Arts",
            "martial arts": "Martial Arts",
            "slice of life": "Slice of Life",
            "super-power": "Super Power",
            "super power": "Super Power"
          };
          variables.genre_in = genres.map(g => genreMap[g.toLowerCase()] || g);
        }
        if (sort) {
          const sortMap = { "name_az": "TITLE_ROMAJI", "recently-added": "START_DATE_DESC", "released-date": "START_DATE_DESC", "most-watched": "POPULARITY_DESC" };
          variables.sort = [sortMap[sort] || "POPULARITY_DESC"];
        } else {
          variables.sort = ["POPULARITY_DESC"];
        }

        const query = `
          query ($page: Int, $perPage: Int, $search: String, $format: MediaFormat, $status: MediaStatus, $genre_in: [String], $sort: [MediaSort]) {
            Page(page: $page, perPage: $perPage) {
              pageInfo { hasNextPage lastPage }
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], search: $search, format: $format, status: $status, genre_in: $genre_in, sort: $sort) {
                id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity
              }
            }
            popular: Page(page: 1, perPage: 10) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity }
            }
          }
        `;

        const result = await anilistQuery(query, variables);
        const searchData = result.data.Page;
        const popularData = result.data.popular;

        return {
          animes: searchData.media.map(mapAniListToAnime),
          mostPopularAnimes: popularData.media.map(mapAniListToAnime),
          searchQuery: q,
          currentPage: page,
          hasNextPage: searchData.pageInfo.hasNextPage,
          totalPages: searchData.pageInfo.lastPage || 1
        };
      } catch (error) {
        console.error("Advanced search failed:", error);
        return null;
      }
    }, FIVE_HOURS);
  };

  const fetchsearchsuggestions = async (q) => {
    if (!q) return null;
    const key = `search-suggestions-${q.toLowerCase()}`;
    return fetchWithCache(key, async () => {
      try {
        const query = `
          query($q: String) {
            Page(page: 1, perPage: 5) {
              media(search: $q, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: POPULARITY_DESC) {
                id
                title {
                  english
                  romaji
                  native
                }
                coverImage {
                  large
                }
                format
                averageScore
              }
            }
          }
        `;
        const result = await anilistQuery(query, { q });
        const mediaPage = result?.data?.Page;
        if (!mediaPage) {
          return { data: { suggestions: [] } };
        }

        return {
          data: {
            suggestions: mediaPage.media.map(media => ({
              id: media.id.toString(),
              name: media.title.english || media.title.romaji || media.title.native,
              jname: media.title.romaji || media.title.native,
              poster: media.coverImage?.large,
              moreInfo: [
                media.format || "TV",
                media.averageScore ? `★ ${(media.averageScore / 10).toFixed(1)}` : null
              ].filter(Boolean)
            }))
          }
        };
      } catch (error) {
        console.error("AniList suggestions failed:", error);
        return { data: { suggestions: [] } };
      }
    }, FIVE_HOURS);
  };

  /* -------------------- EPISODES (JIKAN + DUMMY FALLBACK) -------------------- */
  const fetchepisodeinfo = async (id) => {
    return fetchWithCache(`episodes-${id}`, async () => {
      try {
        // First try to fetch AniList details to get total episodes & malId for Jikan
        const query = `query($id: Int) { Media(id: $id, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT]) { idMal status episodes nextAiringEpisode { episode } streamingEpisodes { title } } }`;
        const anilistRes = await anilistQuery(query, { id: parseInt(id) });
        const media = anilistRes.data.Media;

        let allEpisodes = [];

        // Use Jikan to fetch episode list if possible
        if (allEpisodes.length === 0 && media && media.idMal) {
          try {
            let page = 1;
            let hasNextPage = true;
            let jikanEpisodes = [];

            // Fetch up to 15 pages (1500 episodes) to handle very long series like One Piece
            while (hasNextPage && page <= 15) {
              const jikanEpRes = await fetchWithRetry(() => axios.get(`https://api.jikan.moe/v4/anime/${media.idMal}/episodes?page=${page}`), 1);
              if (jikanEpRes.data && jikanEpRes.data.data) {
                jikanEpisodes = [...jikanEpisodes, ...jikanEpRes.data.data];
                hasNextPage = jikanEpRes.data.pagination.has_next_page;
                page++;

                // Add a small delay if there are more pages to respect Jikan rate limits
                if (hasNextPage && page <= 15) {
                  await new Promise(resolve => setTimeout(resolve, 300));
                }
              } else {
                hasNextPage = false;
              }
            }

            if (jikanEpisodes.length > 0) {
              allEpisodes = jikanEpisodes.map(ep => ({
                episodeId: ep.mal_id.toString(),
                number: ep.mal_id,
                title: ep.title || `Episode ${ep.mal_id}`,
                isFiller: ep.filler || false
              }));
            }
          } catch (e) {
            console.warn("Jikan episode fetch failed:", e.message);
          }
        }

        // Fallback: Generate dummy episodes if Jikan failed or is behind AniList
        if (media) {
          const status = media.status;
          const nextAiring = media.nextAiringEpisode;

          let aniListCount = 0;
          if (status === "NOT_YET_RELEASED") {
            aniListCount = 0;
          } else if (status === "RELEASING" && nextAiring) {
            // Currently releasing with an upcoming next episode: count is exactly the last aired episode
            aniListCount = nextAiring.episode - 1;
          } else {
            // Finished releasing, or releasing but no next airing schedule found:
            // total episodes, airing count, or streaming episodes count (whichever is valid)
            const airingCount = nextAiring ? nextAiring.episode - 1 : 0;
            const totalCount = media.episodes || 0;
            const streamingCount = media.streamingEpisodes?.length || 0;
            aniListCount = Math.max(airingCount, totalCount, streamingCount);
          }

          const currentCount = allEpisodes.length;

          if (currentCount < aniListCount) {
            // If we have some episodes but are missing the latest ones
            const lastNumber = currentCount > 0 ? allEpisodes[allEpisodes.length - 1].number : 0;
            for (let i = lastNumber + 1; i <= aniListCount; i++) {
              allEpisodes.push({
                episodeId: i.toString(),
                number: i,
                title: `Episode ${i}`,
                isFiller: false
              });
            }
          }
        }

        // Final Fallback: If still empty, ensure at least one episode
        if (allEpisodes.length === 0 && media) {
          allEpisodes.push({
            episodeId: "1",
            number: 1,
            title: "Episode 1",
            isFiller: false
          });
        }

        return {
          data: {
            episodes: allEpisodes,
            totalEpisodes: allEpisodes.length
          }
        };
      } catch (error) {
        console.error("Episode fetch failed:", error);
        return { data: { episodes: [], totalEpisodes: 0 } };
      }
    });
  };

  /* -------------------- SCHEDULES -------------------- */
  const fetchestimatedschedules = async (dateStr) => {
    // Determine target date, get start and end timestamps for that day
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const startOfDay = Math.floor(targetDate.getTime() / 1000);
    const endOfDay = startOfDay + 86400;

    return fetchWithCache(`anilist-schedule-${startOfDay}`, async () => {
      try {
        const query = `
          query ($start: Int, $end: Int, $page: Int) {
            Page(page: $page, perPage: 50) {
              pageInfo { hasNextPage }
              airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
                id airingAt episode media { id idMal title { english romaji native } coverImage { large } format episodes popularity genres }
              }
            }
          }
        `;

        let allSchedules = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
          const result = await anilistQuery(query, { start: startOfDay, end: endOfDay, page });
          allSchedules = [...allSchedules, ...result.data.Page.airingSchedules];
          hasNextPage = result.data.Page.pageInfo.hasNextPage;
          page++;
        }

        // Exclude unwanted media formats and Hentai genre
        allSchedules = allSchedules.filter(item => {
          const format = item.media?.format;
          const genres = item.media?.genres || [];
          return format !== 'TV_SHORT' && format !== 'MANGA' && format !== 'NOVEL' && format !== 'ONE_SHOT' && format !== 'MUSIC' && !genres.includes("Hentai");
        });

        const scheduledAnimes = allSchedules.map(item => {
          const media = item.media;
          const epDate = new Date(item.airingAt * 1000);
          return {
            id: media.id.toString(),
            name: media.title.english || media.title.romaji,
            jname: media.title.romaji,
            poster: media.coverImage.large,
            type: media.format || "TV",
            otherInfo: [
              media.format || "TV",
              media.episodes ? `${media.episodes} eps` : "? eps",
              "?"
            ],
            episodes: {
              sub: item.episode || "?",
              dub: null,
            },
            time: epDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            episode: item.episode
          };
        });

        return { scheduledAnimes };
      } catch (error) {
        console.error("Schedule fetch failed:", error);
        return { scheduledAnimes: [] };
      }
    }, ONE_DAY);
  };

  const fetchnextepisodeschedule = async (id) => {
    try {
      const query = `query($id: Int) { Media(id: $id, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT]) { nextAiringEpisode { airingAt episode } } }`;
      const result = await anilistQuery(query, { id: parseInt(id) });
      const nextEp = result.data.Media.nextAiringEpisode;
      if (nextEp) {
        return { airingTimestamp: nextEp.airingAt * 1000, episode: nextEp.episode };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const fetchcategories = async (category, page = 1) => {
    const key = `category-v4-${category}-page-${page}`;
    return fetchWithCache(key, async () => {
      try {
        let variables = { page, perPage: 24 };
        const aniCategoryMap = {
          "most-popular": { sort: ["POPULARITY_DESC"] },
          "top-airing": { status: "RELEASING", sort: ["SCORE_DESC"] },
          "most-favorite": { sort: ["FAVOURITES_DESC"] },
          "top-upcoming": { status: "NOT_YET_RELEASED", sort: ["POPULARITY_DESC"] },
          "completed": { status: "FINISHED", sort: ["END_DATE_DESC"] },
          "tv": { format: "TV", sort: ["POPULARITY_DESC"] },
          "movie": { format: "MOVIE", sort: ["POPULARITY_DESC"] },
          "ova": { format: "OVA", sort: ["POPULARITY_DESC"] },
          "special": { format: "SPECIAL", sort: ["POPULARITY_DESC"] },
          "ona": { format: "ONA", sort: ["POPULARITY_DESC"] },
          "recently-updated": { sort: ["UPDATED_AT_DESC"] }
        };

        const config = aniCategoryMap[category] || { sort: ["POPULARITY_DESC"] };
        variables = { ...variables, ...config };

        const query = `
          query($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $format: MediaFormat) {
            Page(page: $page, perPage: $perPage) {
              pageInfo { hasNextPage lastPage }
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: $sort, status: $status, format: $format) {
                id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity averageScore
              }
            }
            topToday: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: TRENDING_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity averageScore seasonYear startDate { year } } }
            topWeek: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity averageScore seasonYear startDate { year } } }
            topMonth: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: SCORE_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity averageScore seasonYear startDate { year } } }
            GenreCollection
          }
        `;

        const result = await anilistQuery(query, variables);
        const searchData = result.data.Page;
        const { topToday, topWeek, topMonth, GenreCollection } = result.data;

        return {
          animes: searchData.media.map(mapAniListToAnime),
          top10Animes: {
            today: topToday.media.map(mapAniListToAnime),
            week: topWeek.media.map(mapAniListToAnime),
            month: topMonth.media.map(mapAniListToAnime)
          },
          genres: GenreCollection.filter(g => g && g !== "Hentai"),
          category: category.replace(/-/g, ' ').toUpperCase(),
          currentPage: page,
          hasNextPage: searchData.pageInfo.hasNextPage,
          totalPages: searchData.pageInfo.lastPage || 1
        };
      } catch (error) {
        console.error("Category fetch failed:", error);
        return null;
      }
    }, FIVE_HOURS);
  };

  const fetchgenres = async (name, page = 1, type = null) => {
    const key = `genre-${name}-page-${page}-type-${type}`;
    return fetchWithCache(key, async () => {
      try {
        const genreMap = {
          "action": "Action",
          "adventure": "Adventure",
          "comedy": "Comedy",
          "drama": "Drama",
          "ecchi": "Ecchi",
          "fantasy": "Fantasy",
          "hentai": "Hentai",
          "horror": "Horror",
          "mahou-shoujo": "Mahou Shoujo",
          "mecha": "Mecha",
          "music": "Music",
          "mystery": "Mystery",
          "psychological": "Psychological",
          "romance": "Romance",
          "sci-fi": "Sci-Fi",
          "slice-of-life": "Slice of Life",
          "sports": "Sports",
          "supernatural": "Supernatural",
          "thriller": "Thriller"
        };

        const cleanName = name.toLowerCase();
        if (cleanName === "hentai") {
          return {
            animes: [],
            topAiringAnimes: [],
            genreName: "Hentai",
            currentPage: 1,
            hasNextPage: false,
            totalPages: 0,
            genres: []
          };
        }
        const formattedGenre = genreMap[cleanName] || name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        const query = `
          query ($genre: String, $page: Int, $format: MediaFormat) {
            Page(page: $page, perPage: 24) {
              pageInfo {
                hasNextPage
                lastPage
              }
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_in: [$genre], genre_not_in: ["Hentai"], sort: POPULARITY_DESC, format: $format) {
                id
                idMal
                title {
                  english
                  romaji
                  native
                }
                coverImage {
                  large
                }
                format
                episodes
                seasonYear
                startDate {
                  year
                }
                popularity
                averageScore
              }
            }
            topAiring: Page(page: 1, perPage: 10) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], status: RELEASING, genre_not_in: ["Hentai"], sort: SCORE_DESC) {
                id
                idMal
                title {
                  english
                  romaji
                  native
                }
                coverImage {
                  large
                }
                format
                episodes
                popularity
              }
            }
            GenreCollection
          }
        `;

        const result = await anilistQuery(query, {
          genre: formattedGenre,
          page,
          format: type ? type.toUpperCase() : undefined
        });

        const mediaPage = result?.data?.Page;
        const topAiring = result?.data?.topAiring;
        const GenreCollection = result?.data?.GenreCollection;

        if (!mediaPage) {
          throw new Error("No media found for genre");
        }

        return {
          animes: mediaPage.media.map(mapAniListToAnime),
          topAiringAnimes: topAiring?.media?.map(mapAniListToAnime) || [],
          genreName: formattedGenre,
          currentPage: page,
          hasNextPage: mediaPage.pageInfo.hasNextPage,
          totalPages: mediaPage.pageInfo.lastPage || 1,
          genres: GenreCollection ? GenreCollection.filter(g => g && g !== "Hentai") : []
        };
      } catch (error) {
        console.error("Genre fetch failed:", error);
        return null;
      }
    }, FIVE_HOURS);
  };

  const fetchproducers = async (name, page = 1) => {
    const key = `producer-${name}-page-${page}`;
    return fetchWithCache(key, async () => {
      try {
        const cleanName = name.replace(/-/g, ' ');

        // 1. Get Studio ID by name (check cache first)
        let studio = studioCache.get(name);
        if (!studio) {
          const studioResult = await anilistQuery(`
            query ($search: String) {
              Studio(search: $search) {
                id
                name
              }
            }
          `, { search: cleanName });

          studio = studioResult?.data?.Studio;
          if (studio) {
            studioCache.set(name, studio);
          }
        }

        if (!studio) {
          throw new Error("Studio not found");
        }

        // 2. Fetch anime list for the studio and sidebar top 10
        const query = `
          query ($studioId: Int, $page: Int) {
            Studio(id: $studioId) {
              id
              name
              media(page: $page, perPage: 24, genre_not_in: ["Hentai"], sort: POPULARITY_DESC) {
                pageInfo {
                  hasNextPage
                  lastPage
                }
                nodes {
                  id
                  idMal
                  title {
                    english
                    romaji
                    native
                  }
                  coverImage {
                    large
                  }
                  format
                  episodes
                  seasonYear
                  startDate {
                    year
                  }
                  popularity
                  averageScore
                }
              }
            }
            topToday: Page(page: 1, perPage: 10) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: TRENDING_DESC) {
                id
                idMal
                title {
                  english
                  romaji
                  native
                }
                coverImage {
                  large
                }
                format
                episodes
                seasonYear
                startDate {
                  year
                }
                popularity
                averageScore
              }
            }
            topWeek: Page(page: 1, perPage: 10) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: POPULARITY_DESC) {
                id
                idMal
                title {
                  english
                  romaji
                  native
                }
                coverImage {
                  large
                }
                format
                episodes
                seasonYear
                startDate {
                  year
                }
                popularity
                averageScore
              }
            }
            topMonth: Page(page: 1, perPage: 10) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: SCORE_DESC) {
                id
                idMal
                title {
                  english
                  romaji
                  native
                }
                coverImage {
                  large
                }
                format
                episodes
                seasonYear
                startDate {
                  year
                }
                popularity
                averageScore
              }
            }
          }
        `;

        const result = await anilistQuery(query, { studioId: studio.id, page });
        const studioMedia = result?.data?.Studio?.media;
        const topToday = result?.data?.topToday;
        const topWeek = result?.data?.topWeek;
        const topMonth = result?.data?.topMonth;

        if (!studioMedia) {
          throw new Error("No media found for studio");
        }

        return {
          animes: studioMedia.nodes.map(mapAniListToAnime),
          producerName: studio.name,
          top10Animes: {
            today: topToday?.media?.map(mapAniListToAnime) || [],
            week: topWeek?.media?.map(mapAniListToAnime) || [],
            month: topMonth?.media?.map(mapAniListToAnime) || []
          },
          currentPage: page,
          hasNextPage: studioMedia.pageInfo.hasNextPage,
          totalPages: studioMedia.pageInfo.lastPage || 1
        };
      } catch (error) {
        console.warn("Producer fetch failed from AniList, falling back to Jikan search:", error.message);
        // Fallback to simple Jikan/AniList search
        return fetchsearch(name, page);
      }
    }, FIVE_HOURS);
  };

  const fetchepisodeserver = async (id) => {
    // No longer supported. Handled directly in Watch.jsx with Megaplay.
    return { sub: [], dub: [] };
  };

  const fetchmediarelations = async (id) => {
    const cleanId = parseInt(id);
    if (isNaN(cleanId)) return null;

    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          format
          startDate {
            year
          }
          seasonYear
          relations {
            edges {
              relationType
              node {
                id
                idMal
                type
                format
                title {
                  romaji
                  english
                  native
                }
                startDate {
                  year
                }
                seasonYear
              }
            }
          }
        }
      }
    `;
    const result = await anilistQuery(query, { id: cleanId });
    return result?.data?.Media;
  };

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    const cached = cacheRef.current.get("home");
    if (cached && Date.now() - cached.timestamp < FIVE_HOURS) {
      setHomedata({ data: cached.data });
    } else {
      fetchHomedata();
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        homedata,
        fetchHomedata,
        fetchazlistdata,
        fetchanimeinfo,
        fetchsearch,
        fetchadvancedsearch,
        fetchsearchsuggestions,
        fetchepisodeinfo,
        fetchestimatedschedules,
        fetchnextepisodeschedule,
        fetchcategories,
        fetchgenres,
        fetchproducers,
        fetchepisodeserver,
        fetchmediarelations,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
