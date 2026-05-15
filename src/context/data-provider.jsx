import axios from "axios";
import { createContext, useContext, useEffect, useState, useRef } from "react";

/* -------------------- Constants -------------------- */
const ANILIST_API = "https://graphql.anilist.co";

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
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: TRENDING_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } status popularity }
            }
            popular: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            topAiring: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], status: RELEASING, sort: SCORE_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            favorite: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: FAVOURITES_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            latestCompleted: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], status: FINISHED, sort: END_DATE_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            topUpcoming: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], status: NOT_YET_RELEASED, sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
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
          genres: resData.GenreCollection.filter(g => g),
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
            topToday: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: TRENDING_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity } }
            topWeek: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity } }
            topMonth: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: SCORE_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity } }
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
                 media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: [TITLE_ROMAJI]) {
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
                     media(idMal_in: $idMals) {
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
                  media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], search: $search, sort: [TITLE_ROMAJI]) {
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
              nextAiringEpisode { episode }
              duration
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
                nodes { mediaRecommendation { id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity } }
              }
              relations {
                edges { relationType node { id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity } }
              }
            }
          }
        `;
        const result = await anilistQuery(query, isMal ? { idMal: cleanId } : { id: cleanId });
        const node = result.data.Media;

        let finalEpCount = "?";
        try {
          const anifyData = await fetchAnifyInfo(id);
          if (anifyData && anifyData.episodes && anifyData.episodes.data && anifyData.episodes.data.length > 0) {
            const provider = anifyData.episodes.data.find(p => p.providerId === 'gogoanime') || anifyData.episodes.data[0];
            if (provider && provider.episodes) {
              finalEpCount = provider.episodes.length;
            }
          }
        } catch (e) {
          console.warn("Anify episode count fetch failed for info");
        }

        if (finalEpCount === "?" || finalEpCount === 0) {
          finalEpCount = node.nextAiringEpisode ? node.nextAiringEpisode.episode - 1 : (node.episodes || "?");
        }

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
          .map(mapAniListToAnime);

        const mappedRelations = node.relations.edges
          .map(r => r.node)
          .filter(Boolean)
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
                duration: node.duration ? `${node.duration}m` : "?m",
              }
            },
            moreInfo: {
              japanese: node.title.native,
              synonyms: node.synonyms?.[0] || "",
              aired: node.seasonYear ? `${node.season} ${node.seasonYear}` : "?",
              premiered: node.seasonYear ? `${node.season} ${node.seasonYear}` : "?",
              duration: node.duration ? `${node.duration}m` : "?",
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
    const key = `search-v3-${keyword}-page-${page}`;
    return fetchWithCache(key, async () => {
      try {
        // 1. Fetch search results directly from Jikan
        const jikanRes = await fetchWithRetry(() => axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(keyword)}&page=${page}&limit=24&order_by=popularity&sort=desc`), 1);
        const hasNextPage = jikanRes.data.pagination.has_next_page;
        const totalPages = jikanRes.data.pagination.last_visible_page;
        const mappedAnimes = jikanRes.data.data.map(mapJikanToAnime);

        // 2. Fetch popular items for sidebar from Jikan
        const popularRes = await fetchWithRetry(() => axios.get(`https://api.jikan.moe/v4/anime?order_by=popularity&sort=desc&limit=10`), 1);
        const popularAnimes = popularRes.data.data.map(mapJikanToAnime);

        return {
          animes: mappedAnimes,
          mostPopularAnimes: popularAnimes,
          searchQuery: keyword,
          currentPage: page,
          hasNextPage,
          totalPages
        };
      } catch (error) {
        try {
          // Fallback to AniList
          const query = `
            query($q: String, $page: Int) {
              Page(page: $page, perPage: 24) {
                pageInfo { hasNextPage lastPage }
                media(search: $q, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: POPULARITY_DESC) {
                  id idMal title { english romaji native } coverImage { extraLarge large } format episodes averageScore seasonYear startDate { year } popularity
                }
              }
              popular: Page(page: 1, perPage: 10) {
                media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { extraLarge large } format episodes averageScore seasonYear startDate { year } popularity }
              }
            }
          `;
          const result = await anilistQuery(query, { q: keyword, page });
          const searchData = result.data.Page;
          const popularData = result.data.popular;

          return {
            animes: searchData.media.map(mapAniListToAnime),
            mostPopularAnimes: popularData.media.map(mapAniListToAnime),
            searchQuery: keyword,
            currentPage: page,
            hasNextPage: searchData.pageInfo.hasNextPage,
            totalPages: searchData.pageInfo.lastPage
          };
        } catch (aniError) {
          console.error("AniList fallback search failed:", aniError);
          return { animes: [], mostPopularAnimes: [], searchQuery: keyword, currentPage: page, hasNextPage: false, totalPages: 0 };
        }
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
          variables.genre_in = genres.map(g => g.charAt(0).toUpperCase() + g.slice(1).replace('-', ' ')); // e.g. sci-fi -> Sci fi
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
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], search: $search, format: $format, status: $status, genre_in: $genre_in, sort: $sort) {
                id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity
              }
            }
            popular: Page(page: 1, perPage: 10) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity }
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
          totalPages: searchData.pageInfo.lastPage
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
        const jikanRes = await fetchWithRetry(() => axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=5`), 1);
        return {
          data: {
            suggestions: jikanRes.data.data.map(anime => ({
              id: `mal-${anime.mal_id}`,
              name: anime.title_english || anime.title,
              jname: anime.title_japanese || anime.title,
              poster: anime.images?.webp?.small_image_url || anime.images?.jpg?.small_image_url,
              moreInfo: [
                anime.type || "TV",
                anime.score ? `★ ${anime.score}` : null
              ].filter(Boolean)
            }))
          }
        };
      } catch (error) {
        try {
          const query = `
            query($q: String) {
              Page(page: 1, perPage: 5) {
                media(search: $q, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: POPULARITY_DESC) {
                  id title { english romaji native } coverImage { large } format averageScore
                }
              }
            }
          `;
          const result = await anilistQuery(query, { q });
          return {
            data: {
              suggestions: result.data.Page.media.map(media => ({
                id: media.id.toString(),
                name: media.title.english || media.title.romaji,
                jname: media.title.romaji,
                poster: media.coverImage.large,
                moreInfo: [
                  media.format || "TV",
                  media.averageScore ? `★ ${media.averageScore / 10}` : null
                ].filter(Boolean)
              }))
            }
          };
        } catch (aniError) {
          console.error("AniList fallback suggestions failed:", aniError);
          return { data: { suggestions: [] } };
        }
      }
    }, FIVE_HOURS);
  };

  const fetchAnifyInfo = async (id) => {
    try {
      const res = await axios.get(`https://api.anify.tv/info/${id}`, { timeout: 5000 });
      return res.data;
    } catch (err) {
      return null;
    }
  };

  /* -------------------- EPISODES (ANIFY + DUMMY FALLBACK) -------------------- */
  const fetchepisodeinfo = async (id) => {
    return fetchWithCache(`episodes-${id}`, async () => {
      try {
        // First try to fetch AniList details to get total episodes & malId for Anify
        const query = `query($id: Int) { Media(id: $id, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT]) { idMal episodes nextAiringEpisode { episode } } }`;
        const anilistRes = await anilistQuery(query, { id: parseInt(id) });
        const media = anilistRes.data.Media;

        let allEpisodes = [];

        // Use Anify to fetch episode list if possible
        if (media && media.idMal) {
          const anifyData = await fetchAnifyInfo(media.idMal);
          if (anifyData && anifyData.episodes && anifyData.episodes.data && anifyData.episodes.data.length > 0) {
            // Find a provider with episodes, preferably gogoanime or default
            const provider = anifyData.episodes.data.find(p => p.providerId === 'gogoanime') || anifyData.episodes.data[0];
            if (provider && provider.episodes) {
              allEpisodes = provider.episodes.map(ep => ({
                episodeId: ep.id || ep.number.toString(),
                number: ep.number,
                title: ep.title || `Episode ${ep.number}`,
                isFiller: ep.isFiller || false
              }));
            }
          }
        }

        // Fallback: Generate dummy episodes if Anify failed
        if (allEpisodes.length === 0 && media) {
          const count = media.nextAiringEpisode ? media.nextAiringEpisode.episode - 1 : (media.episodes || 12);
          for (let i = 1; i <= count; i++) {
            allEpisodes.push({
              episodeId: i.toString(),
              number: i,
              title: `Episode ${i}`,
              isFiller: false
            });
          }
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
                id airingAt episode media { id idMal title { english romaji native } coverImage { large } format episodes popularity }
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

        // Exclude unwanted media formats
        allSchedules = allSchedules.filter(item => {
          const format = item.media?.format;
          return format !== 'TV_SHORT' && format !== 'MANGA' && format !== 'NOVEL' && format !== 'ONE_SHOT' && format !== 'MUSIC';
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
    const key = `category-${category}-page-${page}`;
    return fetchWithCache(key, async () => {
      try {
        const jikanMap = {
          "most-popular": "order_by=members&sort=desc",
          "top-airing": "status=airing&order_by=score&sort=desc",
          "most-favorite": "order_by=favorites&sort=desc",
          "top-upcoming": "status=upcoming&order_by=popularity&sort=desc",
          "completed": "status=complete&order_by=score&sort=desc",
          "tv": "type=tv&order_by=popularity&sort=desc",
          "movie": "type=movie&order_by=popularity&sort=desc",
          "ova": "type=ova&order_by=popularity&sort=desc",
          "special": "type=special&order_by=popularity&sort=desc",
          "ona": "type=ona&order_by=popularity&sort=desc",
          "recently-updated": "order_by=start_date&sort=desc"
        };

        const queryParams = jikanMap[category] || "order_by=popularity&sort=desc";

        let mappedAnimes = [];
        let hasNextPage = false;
        let totalPages = 1;

        try {
          const jikanRes = await fetchWithRetry(() => axios.get(`https://api.jikan.moe/v4/anime?${queryParams}&page=${page}&limit=24`), 1);
          const malIds = jikanRes.data.data.map(a => a.mal_id);
          hasNextPage = jikanRes.data.pagination.has_next_page;
          totalPages = jikanRes.data.pagination.last_visible_page;

          if (malIds.length > 0) {
            const query = `
                  query($idMals: [Int]) {
                      Page(page: 1, perPage: 24) {
                          media(idMal_in: $idMals) {
                              id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity averageScore
                          }
                      }
                  }
              `;
            const aniRes = await anilistQuery(query, { idMals: malIds });
            const aniMap = {};
            aniRes.data.Page.media.forEach(m => { if (m.idMal) aniMap[m.idMal] = m; });
            mappedAnimes = malIds.map(malId => aniMap[malId]).filter(Boolean).map(mapAniListToAnime);
          }
        } catch (error) {
          // Map category to AniList logic
          let variables = { page, perPage: 24 };
          const aniCategoryMap = {
            "most-popular": { sort: ["POPULARITY_DESC"] },
            "top-airing": { status: "RELEASING", sort: ["SCORE_DESC"] },
            "most-favorite": { sort: ["FAVOURITES_DESC"] },
            "top-upcoming": { status: "NOT_YET_RELEASED", sort: ["POPULARITY_DESC"] },
            "completed": { status: "FINISHED", sort: ["SCORE_DESC"] },
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
                media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: $sort, status: $status, format: $format) {
                  id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity averageScore
                }
              }
            }
          `;

          const aniRes = await anilistQuery(query, variables);
          mappedAnimes = aniRes.data.Page.media.map(mapAniListToAnime);
          hasNextPage = aniRes.data.Page.pageInfo.hasNextPage;
          totalPages = aniRes.data.Page.pageInfo.lastPage;
        }

        // 2. Fetch sidebar and extra data from AniList
        const sidebarQuery = `
          query {
            topToday: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: TRENDING_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity } }
            topWeek: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity } }
            topMonth: Page(page: 1, perPage: 10) { media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], sort: SCORE_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity } }
            GenreCollection
          }
        `;
        const sidebarRes = await anilistQuery(sidebarQuery);
        const { topToday, topWeek, topMonth, GenreCollection } = sidebarRes.data;

        return {
          animes: mappedAnimes,
          top10Animes: {
            today: topToday.media.map(mapAniListToAnime),
            week: topWeek.media.map(mapAniListToAnime),
            month: topMonth.media.map(mapAniListToAnime)
          },
          genres: GenreCollection.filter(g => g),
          category: category.replace(/-/g, ' ').toUpperCase(),
          currentPage: page,
          hasNextPage,
          totalPages
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
          "action": 1, "adventure": 2, "cars": 3, "comedy": 4, "avant-garde": 5, "demons": 6, "mystery": 7, "drama": 8, "ecchi": 9,
          "fantasy": 10, "game": 11, "hentai": 12, "historical": 13, "horror": 14, "kids": 15, "magic": 16, "martial-arts": 17,
          "mecha": 18, "music": 19, "parody": 20, "samurai": 21, "romance": 22, "school": 23, "sci-fi": 24, "shoujo": 25,
          "girls-love": 26, "shounen": 27, "boys-love": 28, "space": 29, "sports": 30, "super-power": 31, "vampire": 32,
          "harem": 35, "slice-of-life": 36, "slice of life": 36, "supernatural": 37, "military": 38, "police": 39, "psychological": 40,
          "suspense": 41, "seinen": 42, "josei": 43, "workplace": 48
        };

        const cleanName = name.toLowerCase().replace(/-/g, ' ');
        const genreId = genreMap[cleanName] || genreMap[name.toLowerCase()];

        let mappedAnimes = [];
        let hasNextPage = false;
        let totalPages = 1;

        try {
          // 1. Get List from Jikan (consistent with A-Z list)
          if (genreId) {
            let url = `https://api.jikan.moe/v4/anime?genres=${genreId}&page=${page}&limit=24`;
            if (type) url += `&type=${type.toLowerCase()}`;

            const jikanRes = await fetchWithRetry(() => axios.get(url), 1);
            const malIds = jikanRes.data.data.map(a => a.mal_id);
            hasNextPage = jikanRes.data.pagination.has_next_page;
            totalPages = jikanRes.data.pagination.last_visible_page;

            if (malIds.length > 0) {
              const aniQuery = `
                query($idMals: [Int]) {
                  Page(page: 1, perPage: 24) {
                    media(idMal_in: $idMals, type: ANIME) {
                      id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } averageScore popularity
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
          }
        } catch (error) {
          // Fallback to AniList query logic
          const formattedGenre = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          const query = `
            query ($genre: String, $page: Int, $format: MediaFormat) {
              Page(page: $page, perPage: 24) {
                pageInfo { hasNextPage lastPage }
                media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_in: [$genre], sort: POPULARITY_DESC, format: $format) { id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity averageScore }
              }
            }
          `;
          const result = await anilistQuery(query, { 
            genre: formattedGenre, 
            page,
            format: type ? type.toUpperCase() : undefined
          });
          mappedAnimes = result.data.Page.media.map(mapAniListToAnime);
          hasNextPage = result.data.Page.pageInfo.hasNextPage;
          totalPages = result.data.Page.pageInfo.lastPage;
        }

        if (!mappedAnimes.length && !genreId) {
          // Extra fallback for cases where genreId is not found in map but might exist in AniList
          const formattedGenre = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          const query = `
            query ($genre: String, $page: Int) {
              Page(page: $page, perPage: 24) {
                pageInfo { hasNextPage lastPage }
                media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_in: [$genre], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { large } format episodes seasonYear startDate { year } popularity }
              }
            }
          `;
          const result = await anilistQuery(query, { genre: formattedGenre, page });
          mappedAnimes = result.data.Page.media.map(mapAniListToAnime);
          hasNextPage = result.data.Page.pageInfo.hasNextPage;
          totalPages = result.data.Page.pageInfo.lastPage;
        }

        // 2. Always get Sidebar info from AniList
        const sidebarQuery = `
          query {
            topAiring: Page(page: 1, perPage: 10) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], status: RELEASING, sort: SCORE_DESC) { id idMal title { english romaji native } coverImage { large } format episodes popularity }
            }
            GenreCollection
          }
        `;
        const sidebarRes = await anilistQuery(sidebarQuery);
        const { topAiring, GenreCollection } = sidebarRes.data;

        return {
          animes: mappedAnimes,
          topAiringAnimes: topAiring.media.map(mapAniListToAnime),
          genreName: name.toUpperCase(),
          currentPage: page,
          hasNextPage,
          totalPages,
          genres: GenreCollection.filter(g => g)
        };
      } catch (error) {
        console.error("Genre fetch failed:", error);
        return null;
      }
    }, FIVE_HOURS);
  };

  const fetchproducers = async (name, page = 1) => {
    return fetchsearch(name, page);
  };

  const fetchepisodeserver = async (id) => {
    // No longer supported. Handled directly in Watch.jsx with Megaplay.
    return { sub: [], dub: [] };
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
