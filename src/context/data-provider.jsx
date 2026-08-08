import axios from "axios";
import { createContext, useContext, useState, useRef } from "react";

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
    id: media.id?.toString(),
    malId: media.idMal || null,
    title: media.title || { english: media.title?.english, romaji: media.title?.romaji, native: media.title?.native },
    name: media.title?.english || media.title?.romaji || media.title?.native,
    jname: media.title?.native || media.title?.romaji || media.title?.english,
    japaneseTitle: media.title?.native || media.title?.romaji,
    japanese_title: media.title?.native || media.title?.romaji,
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
    genres: media.genres || [],
    season: media.season || null,
    seasonYear: media.seasonYear || null,
    favourites: media.favourites || 0,
    endDate: media.endDate || null,
    nextAiringEpisode: media.nextAiringEpisode || null,
    status: media.status || null,
    averageScore: media.averageScore || null,
  };
};


/* -------------------- Context -------------------- */
const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [homedata, setHomedata] = useState(null);

  const cacheRef = useRef(new Map());
  const inFlightRef = useRef(new Map());
  const CACHE_TTL = 1000 * 60 * 10;
  const TEN_MINUTES = 1000 * 60 * 10;
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
      } catch {
        // ignore JSON parse errors
      }
    }

    if (cached && now - cached.timestamp >= ttl) {
      cacheRef.current.delete(key);
      try { sessionStorage.removeItem(`otaku_cache_${key}`); } catch { /* ignore */ }
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
          } catch {
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

  /* -------------------- NEW RELEASES -------------------- */
  const fetchNewReleases = async (seasonParam, yearParam) => {
    const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];
    const now = new Date();
    const season = seasonParam || seasons[Math.floor(now.getMonth() / 3)];
    const year = yearParam || now.getFullYear();

    const key = `anilist-new-releases-${season}-${year}`;

    return fetchWithCache(key, async () => {
      try {
        const query = `
          query NewReleases($page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int) {
            Page(page: $page, perPage: $perPage) {
              media(
                sort: POPULARITY_DESC
                type: ANIME
                isAdult: false
                season: $season
                seasonYear: $seasonYear
              ) {
                id
                idMal
                title { romaji english native }
                description(asHtml: false)
                bannerImage
                coverImage { extraLarge large color }
                averageScore
                popularity
                episodes
                duration
                format
                status
                season
                seasonYear
                genres
                studios(isMain: true) { nodes { name } }
                nextAiringEpisode { episode airingAt timeUntilAiring }
                startDate { year month day }
              }
            }
          }
        `;
        const result = await anilistQuery(query, { page: 1, perPage: 24, season, seasonYear: year });
        const media = result?.data?.Page?.media || [];
        return media.filter(Boolean).map(mapAniListToAnime);
      } catch (error) {
        console.error("New releases fetch failed:", error);
        return [];
      }
    }, CACHE_TTL);
  };

  /* -------------------- HOME -------------------- */
  const fetchHomedata = async () => {
    try {
      const data = await fetchWithCache("home", async () => {
        const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];
        const now = new Date();
        const season = seasons[Math.floor(now.getMonth() / 3)];
        const year = now.getFullYear();

        const query = `
          query ($season: MediaSeason, $seasonYear: Int) {
            heroSpotlight: Page(page: 1, perPage: 5) {
              media(sort: TRENDING_DESC, type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], isAdult: false) {
                id idMal title { romaji english native } bannerImage coverImage { extraLarge large color } description(asHtml: false) genres averageScore format episodes seasonYear studios { edges { isMain node { name } } nodes { name } } nextAiringEpisode { episode }
              }
            }
            trending: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: TRENDING_DESC) { id idMal title { english romaji native } coverImage { extraLarge large color } bannerImage description format episodes averageScore seasonYear startDate { year } status popularity }
            }
            popular: Page(page: 1, perPage: 15) {
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { extraLarge large color } bannerImage description format episodes averageScore seasonYear startDate { year } popularity }
            }
            newReleases: Page(page: 1, perPage: 24) {
              media(sort: POPULARITY_DESC, type: ANIME, isAdult: false, season: $season, seasonYear: $seasonYear) { id idMal title { romaji english native } description(asHtml: false) bannerImage coverImage { extraLarge large color } averageScore popularity episodes duration format status season seasonYear genres studios(isMain: true) { nodes { name } } nextAiringEpisode { episode airingAt timeUntilAiring } startDate { year month day } }
            }
            topRated: Page(page: 1, perPage: 20) {
              media(type: ANIME, format_in: [TV, MOVIE], genre_not_in: ["Hentai"], sort: SCORE_DESC) { id idMal title { english romaji native } coverImage { extraLarge large color } bannerImage description format episodes averageScore seasonYear startDate { year } genres status popularity }
            }
            movies: Page(page: 1, perPage: 16) {
              media(type: ANIME, format: MOVIE, genre_not_in: ["Hentai"], sort: POPULARITY_DESC) { id idMal title { english romaji native } coverImage { extraLarge large color } bannerImage description format episodes duration averageScore seasonYear startDate { year } genres status popularity }
            }
            recentlyUpdated: Page(page: 1, perPage: 30) {
              media(type: ANIME, status: RELEASING, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_not_in: ["Hentai"], sort: UPDATED_AT_DESC) { id idMal title { english romaji native } coverImage { extraLarge large color } bannerImage description format episodes averageScore seasonYear startDate { year } genres status popularity }
            }
            GenreCollection
          }
        `;
        const result = await anilistQuery(query, { season, seasonYear: year });
        const resData = result.data;

        // Helper mapper with full media fields preserved for BentoCard
        const mapAniListBento = (media) => {
          const base = mapAniListToAnime(media);
          if (!base) return null;
          return {
            ...base,
            genres: media.genres || [],
            bannerImage: media.bannerImage || null,
            averageScore: media.averageScore || null,
            format: media.format || "TV",
          };
        };

        return {
          heroSpotlight: resData.heroSpotlight.media,
          trendingAnimes: resData.trending.media.map(mapAniListToAnime).slice(0, 10),
          mostPopularAnimes: resData.popular.media.map(mapAniListToAnime),
          newReleaseAnimes: resData.newReleases.media.filter(Boolean).map(mapAniListToAnime),
          topRatedAnimes: resData.topRated.media.map(mapAniListBento),
          moviesAnimes: resData.movies.media.filter(Boolean).map(mapAniListToAnime),
          recentlyUpdatedAnimes: resData.recentlyUpdated.media.filter(Boolean).map(mapAniListToAnime),
          genres: resData.GenreCollection.filter(g => g && g !== "Hentai")
        };
      }, FIVE_HOURS);

      setHomedata({ data });
      return { data };
    } catch (error) {
      console.error("Home fetch failed:", error);
      return null;
    }
  };



  /* -------------------- ANIME INFO -------------------- */
  const fetchanimeinfo = async (id) => {
    return fetchWithCache(`anime-v4-${id}`, async () => {
      try {
        const isMal = id.toString().startsWith('mal-');
        const cleanId = isMal ? parseInt(id.replace('mal-', '')) : parseInt(id);

        const query = `
          query ($id: Int, $idMal: Int) {
            Media(id: $id, idMal: $idMal, type: ANIME) {
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
              duration
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

        const nextEpNum = node.nextAiringEpisode ? node.nextAiringEpisode.episode : 0;
        const finalEpCount = nextEpNum > 1 ? nextEpNum - 1 : (node.episodes || "?");

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
              banner: node.bannerImage || null,
              bannerImage: node.bannerImage || null,
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
                duration: node.duration || null,
              }
            },
            moreInfo: {
              japanese: node.title.native,
              bannerImage: node.bannerImage || null,
              synonyms: node.synonyms?.[0] || "",
              aired: node.seasonYear ? `${node.season} ${node.seasonYear}` : "?",
              premiered: node.seasonYear ? `${node.season} ${node.seasonYear}` : "?",
              duration: node.duration || null,
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
  const fetchsearch = async (keyword, page = 1, filters = {}) => {
    const cleanKeyword = (keyword || "").trim();
    const sortParam = typeof filters === 'string' ? filters : (filters.sort || 'relevance');
    const formatParam = typeof filters === 'object' ? filters.format : null;
    const statusParam = typeof filters === 'object' ? filters.status : null;
    const yearParam = typeof filters === 'object' ? filters.year : null;

    const key = `search-v5-${cleanKeyword.toLowerCase()}-p${page}-sort-${sortParam}-fmt-${formatParam}-st-${statusParam}-yr-${yearParam}`;

    return fetchWithCache(key, async () => {
      try {
        const SORT_MAP = {
          relevance: ["SEARCH_MATCH"],
          popularity: ["POPULARITY_DESC"],
          trending: ["TRENDING_DESC"],
          score: ["SCORE_DESC"],
          newest: ["START_DATE_DESC"]
        };
        const sortValue = SORT_MAP[sortParam] || ["SEARCH_MATCH"];

        const FORMAT_MAP = {
          tv: "TV",
          movie: "MOVIE",
          ova: "OVA",
          ona: "ONA",
          special: "SPECIAL"
        };
        const formatValue = FORMAT_MAP[formatParam] || undefined;

        const STATUS_MAP = {
          airing: "RELEASING",
          finished: "FINISHED",
          upcoming: "NOT_YET_RELEASED"
        };
        const statusValue = STATUS_MAP[statusParam] || undefined;

        const parsedYear = parseInt(yearParam, 10);
        const yearValue = (!isNaN(parsedYear) && parsedYear > 1950) ? parsedYear : undefined;

        const query = `
          query ($page: Int!, $search: String, $sort: [MediaSort], $format: MediaFormat, $status: MediaStatus, $year: Int) {
            Page(page: $page, perPage: 30) {
              pageInfo {
                currentPage
                hasNextPage
                lastPage
                total
              }
              media(
                search: $search
                type: ANIME
                isAdult: false
                genre_not_in: ["Hentai"]
                sort: $sort
                format: $format
                status: $status
                seasonYear: $year
              ) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                description(asHtml: false)
                bannerImage
                coverImage {
                  extraLarge
                  large
                  color
                }
                averageScore
                popularity
                episodes
                duration
                format
                status
                season
                seasonYear
                genres
                studios(isMain: true) {
                  nodes {
                    name
                  }
                }
                nextAiringEpisode {
                  episode
                  airingAt
                  timeUntilAiring
                }
                startDate {
                  year
                  month
                  day
                }
              }
            }
          }
        `;

        const result = await anilistQuery(query, {
          page,
          search: cleanKeyword || undefined,
          sort: sortValue,
          format: formatValue,
          status: statusValue,
          year: yearValue
        });

        const searchData = result?.data?.Page;
        if (!searchData) {
          throw new Error("No search results found");
        }

        const validMedia = (searchData.media || []).filter(Boolean);
        const mappedAnimes = validMedia.map(mapAniListToAnime);
        const airingCount = validMedia.filter(m => m.status === "RELEASING").length;

        // De-duplicate by id as per spec rule
        const uniqueAnimes = [];
        const seenIds = new Set();
        for (const anime of mappedAnimes) {
          if (anime && anime.id && !seenIds.has(anime.id)) {
            seenIds.add(anime.id);
            uniqueAnimes.push(anime);
          }
        }

        return {
          animes: uniqueAnimes,
          rawMedia: validMedia,
          searchQuery: cleanKeyword,
          currentPage: searchData.pageInfo.currentPage || page,
          hasNextPage: searchData.pageInfo.hasNextPage || false,
          totalPages: searchData.pageInfo.lastPage || 1,
          totalItems: searchData.pageInfo.total || uniqueAnimes.length,
          airingCount,
          firstColor: validMedia[0]?.coverImage?.color || null
        };
      } catch (error) {
        console.error("AniList search failed:", error);
        throw error;
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
    const key = `episodes-inflight-${id}`;
    if (inFlightRef.current.has(key)) {
      return inFlightRef.current.get(key);
    }

    const promise = (async () => {
      try {
        let media = null;

        // Resolve ID/slug formats: '21', 'one-piece-21', 'mal-21', 'one-piece'
        const isMal = id.toString().startsWith('mal-');
        const rawId = isMal ? id.toString().replace('mal-', '') : id.toString();
        const numericMatch = rawId.match(/\d+$/);
        const numericId = numericMatch ? parseInt(numericMatch[0]) : (isNaN(parseInt(rawId)) ? null : parseInt(rawId));

        const query = `
          query($id: Int, $idMal: Int, $search: String) {
            Media(id: $id, idMal: $idMal, search: $search, type: ANIME) {
              id
              idMal
              status
              episodes
              nextAiringEpisode { episode }
              streamingEpisodes { title }
            }
          }
        `;

        const variables = {};
        if (isMal && numericId) {
          variables.idMal = numericId;
        } else if (numericId) {
          variables.id = numericId;
        } else {
          variables.search = id.toString().replace(/-/g, ' ');
        }

        const anilistRes = await anilistQuery(query, variables);
        media = anilistRes?.data?.Media || null;

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

        // 1. Check next episode schedule and calculate expected latest aired episode number (nextAiringEpisode.episode - 1)
        if (media) {
          const status = media.status;
          const nextAiring = media.nextAiringEpisode;

          let targetEpisodeCount = 0;
          if (status === "NOT_YET_RELEASED") {
            targetEpisodeCount = 0;
          } else if (status === "FINISHED" && typeof media.episodes === "number" && media.episodes > 0) {
            // For finished series, media.episodes is the authoritative total episode count
            targetEpisodeCount = media.episodes;
          } else {
            const scheduleEpNumber = nextAiring ? nextAiring.episode : 0;
            const scheduleAiredCount = scheduleEpNumber > 1 ? scheduleEpNumber - 1 : 0;
            const totalCount = media.episodes || 0;
            const streamingCount = media.streamingEpisodes?.length || 0;

            targetEpisodeCount = Math.max(scheduleAiredCount, totalCount, streamingCount);
          }

          const currentEpCount = allEpisodes.length > 0 ? allEpisodes[allEpisodes.length - 1].number : 0;

          // If finished and allEpisodes has extra items past media.episodes, trim it
          if (status === "FINISHED" && typeof media.episodes === "number" && media.episodes > 0 && allEpisodes.length > media.episodes) {
            allEpisodes = allEpisodes.slice(0, media.episodes);
          } else if (currentEpCount < targetEpisodeCount) {
            // Append missing episodes up to targetEpisodeCount
            for (let i = currentEpCount + 1; i <= targetEpisodeCount; i++) {
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
      } finally {
        inFlightRef.current.delete(key);
      }
    })();

    inFlightRef.current.set(key, promise);
    return promise;
  };

  /* -------------------- SCHEDULES -------------------- */
  const fetchestimatedschedules = async (dateStr, days = 1) => {
    let targetDate;
    if (dateStr && typeof dateStr === "string" && dateStr.includes("-")) {
      const parts = dateStr.split("-").map(Number);
      targetDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    } else if (dateStr) {
      targetDate = new Date(dateStr);
      targetDate.setHours(0, 0, 0, 0);
    } else {
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }
    const startOfDay = Math.floor(targetDate.getTime() / 1000);

    return fetchWithCache(`anilist-schedule-v7-${startOfDay}-d${days}`, async () => {
      try {
        let allSchedules = [];

        if (days > 1) {
          // Batch multi-day queries into 1 single HTTP request using GraphQL aliases
          const aliasQueries = [];
          const variables = {};

          for (let i = 0; i < days; i++) {
            const dayStart = startOfDay + i * 86400;
            const dayEnd = dayStart + 86400;
            variables[`d${i}S`] = dayStart;
            variables[`d${i}E`] = dayEnd;

            aliasQueries.push(`
              day${i}: Page(page: 1, perPage: 50) {
                airingSchedules(airingAt_greater: $d${i}S, airingAt_lesser: $d${i}E, sort: TIME) {
                  id airingAt timeUntilAiring episode
                  media { id idMal title { english romaji native } bannerImage coverImage { extraLarge large color } format episodes description popularity genres status studios(isMain: true) { nodes { name } } }
                }
              }
            `);
          }

          const varDefs = Array.from({ length: days })
            .map((_, i) => `$d${i}S: Int, $d${i}E: Int`)
            .join(", ");

          const batchedQuery = `query (${varDefs}) { ${aliasQueries.join("\n")} }`;
          const result = await anilistQuery(batchedQuery, variables);

          if (result?.data) {
            for (let i = 0; i < days; i++) {
              const dayItems = result.data[`day${i}`]?.airingSchedules || [];
              allSchedules = allSchedules.concat(dayItems);
            }
          }
        } else {
          const endOfDay = startOfDay + 86400;
          const singleQuery = `
            query ($start: Int, $end: Int) {
              Page(page: 1, perPage: 60) {
                airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
                  id airingAt timeUntilAiring episode
                  media { id idMal title { english romaji native } bannerImage coverImage { extraLarge large color } format episodes description popularity genres status studios(isMain: true) { nodes { name } } }
                }
              }
            }
          `;
          const result = await anilistQuery(singleQuery, { start: startOfDay, end: endOfDay });
          allSchedules = result?.data?.Page?.airingSchedules || [];
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
            poster: media.coverImage?.large,
            coverImage: media.coverImage,
            bannerImage: media.bannerImage,
            description: media.description,
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
            episode: item.episode,
            airingAt: item.airingAt,
            timeUntilAiring: item.timeUntilAiring,
            studio: media.studios?.nodes?.[0]?.name || "",
            rawMedia: media
          };
        });

        return { scheduledAnimes, rawSchedules: allSchedules };
      } catch (error) {
        console.error("Schedule fetch failed:", error);
        return { scheduledAnimes: [], rawSchedules: [] };
      }
    }, ONE_DAY);
  };

  const fetchMoviesSection = async () => {
    const key = `anilist-movies-v1`;
    return fetchWithCache(key, async () => {
      try {
        const query = `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              media(sort: POPULARITY_DESC, type: ANIME, isAdult: false, format: MOVIE) {
                id
                idMal
                title { romaji english native }
                description(asHtml: false)
                bannerImage
                coverImage { extraLarge large color }
                averageScore
                duration
                seasonYear
                format
                status
                genres
              }
            }
          }
        `;
        const result = await anilistQuery(query, { page: 1, perPage: 16 });
        return result?.data?.Page?.media || [];
      } catch (error) {
        console.error("Movies section fetch failed:", error);
        return [];
      }
    }, FIVE_HOURS);
  };

  const fetchRecentlyUpdated = async () => {
    const key = `anilist-recently-updated-v1`;
    return fetchWithCache(key, async () => {
      try {
        const query = `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              media(sort: UPDATED_AT_DESC, type: ANIME, isAdult: false, status: RELEASING) {
                id
                idMal
                updatedAt
                title { romaji english native }
                description(asHtml: false)
                bannerImage
                coverImage { extraLarge large color }
                averageScore
                episodes
                format
                status
                genres
                nextAiringEpisode {
                  episode
                  airingAt
                  timeUntilAiring
                }
              }
            }
          }
        `;
        const result = await anilistQuery(query, { page: 1, perPage: 30 });
        return result?.data?.Page?.media || [];
      } catch (error) {
        console.error("Recently updated fetch failed:", error);
        return [];
      }
    }, TEN_MINUTES);
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
    } catch {
      return null;
    }
  };

  const fetchcategories = async (category, page = 1, filters = {}) => {
    const defaultSort = category === 'most-favorite' ? 'favourites' : category === 'top-airing' ? 'score' : 'popularity';
    const sortParam = typeof filters === 'string' ? filters : (filters.sort || defaultSort);
    const formatParam = typeof filters === 'object' ? filters.format : null;
    const statusParam = typeof filters === 'object' ? filters.status : null;
    const yearParam = typeof filters === 'object' ? filters.year : null;

    const key = `cat-${category}-p${page}-sort-${sortParam}-fmt-${formatParam}-st-${statusParam}-yr-${yearParam}`;

    return fetchWithCache(key, async () => {
      try {
        // SORT Map
        const SORT_MAP = {
          favourites: ["FAVOURITES_DESC"],
          popularity: ["POPULARITY_DESC"],
          trending: ["TRENDING_DESC"],
          score: ["SCORE_DESC", "POPULARITY_DESC"],
          newest: ["START_DATE_DESC"]
        };
        const sortValue = SORT_MAP[sortParam] || (category === 'most-favorite' ? ["FAVOURITES_DESC"] : category === 'top-airing' ? ["SCORE_DESC", "POPULARITY_DESC"] : ["POPULARITY_DESC"]);

        // Fixed Formats per category route
        const CATEGORY_FORMATS = {
          tv: "TV",
          movie: "MOVIE",
          ova: "OVA",
          ona: "ONA",
          special: "SPECIAL"
        };

        // FORMAT Map
        const FORMAT_MAP = {
          tv: "TV",
          movie: "MOVIE",
          ova: "OVA",
          ona: "ONA",
          special: "SPECIAL"
        };

        let formatValue = CATEGORY_FORMATS[category] || FORMAT_MAP[formatParam] || undefined;

        // Fixed Status per category route
        const CATEGORY_STATUSES = {
          "top-airing": "RELEASING",
          completed: "FINISHED"
        };

        // STATUS Map
        const STATUS_MAP = {
          airing: "RELEASING",
          finished: "FINISHED",
          upcoming: "NOT_YET_RELEASED"
        };

        let statusValue = CATEGORY_STATUSES[category] || STATUS_MAP[statusParam] || undefined;

        // YEAR Map (ignored for top-airing per spec)
        const parsedYear = parseInt(yearParam, 10);
        let yearValue = (category !== "top-airing" && !isNaN(parsedYear) && parsedYear > 1950) ? parsedYear : undefined;

        const query = `
          query ($page: Int!, $sort: [MediaSort], $format: MediaFormat, $status: MediaStatus, $year: Int) {
            Page(page: $page, perPage: 30) {
              pageInfo {
                currentPage
                hasNextPage
                lastPage
                total
              }
              media(
                type: ANIME
                isAdult: false
                genre_not_in: ["Hentai"]
                sort: $sort
                format: $format
                status: $status
                seasonYear: $year
              ) {
                id
                idMal
                title {
                  english
                  romaji
                  native
                }
                description(asHtml: false)
                bannerImage
                coverImage {
                  extraLarge
                  large
                  color
                }
                format
                status
                episodes
                duration
                season
                seasonYear
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                popularity
                averageScore
                favourites
                genres
                studios(isMain: true) {
                  nodes {
                    name
                  }
                }
                nextAiringEpisode {
                  episode
                  airingAt
                  timeUntilAiring
                }
              }
            }
          }
        `;

        const result = await anilistQuery(query, {
          page,
          sort: sortValue,
          format: formatValue,
          status: statusValue,
          year: yearValue
        });

        const searchData = result?.data?.Page;

        if (!searchData) {
          throw new Error("No media found for catalogue");
        }

        const mappedAnimes = searchData.media.map(mapAniListToAnime);
        const airingCount = searchData.media.filter(m => m.status === "RELEASING").length;

        return {
          animes: mappedAnimes,
          rawMedia: searchData.media,
          category: category,
          currentPage: searchData.pageInfo.currentPage || page,
          hasNextPage: searchData.pageInfo.hasNextPage || false,
          totalPages: searchData.pageInfo.lastPage || 1,
          totalItems: searchData.pageInfo.total || mappedAnimes.length,
          airingCount
        };
      } catch (error) {
        console.error("Category fetch failed:", error);
        throw error;
      }
    }, FIVE_HOURS);
  };

  const fetchgenres = async (name, page = 1, filters = {}) => {
    const sortParam = typeof filters === 'string' ? filters : (filters.sort || 'popularity');
    const formatParam = typeof filters === 'object' ? filters.format : null;
    const statusParam = typeof filters === 'object' ? filters.status : null;
    const yearParam = typeof filters === 'object' ? filters.year : null;

    const key = `genre-${name}-p${page}-sort-${sortParam}-fmt-${formatParam}-st-${statusParam}-yr-${yearParam}`;
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
            totalItems: 0,
            genres: []
          };
        }
        const formattedGenre = genreMap[cleanName] || name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // SORT Map
        const SORT_MAP = {
          popularity: ["POPULARITY_DESC"],
          trending: ["TRENDING_DESC"],
          score: ["SCORE_DESC"],
          newest: ["START_DATE_DESC"]
        };
        const sortValue = SORT_MAP[sortParam] || ["POPULARITY_DESC"];

        // FORMAT Map
        const FORMAT_MAP = {
          tv: "TV",
          movie: "MOVIE",
          ova: "OVA",
          ona: "ONA",
          special: "SPECIAL"
        };
        const formatValue = FORMAT_MAP[formatParam] || undefined;

        // STATUS Map
        const STATUS_MAP = {
          airing: "RELEASING",
          finished: "FINISHED",
          upcoming: "NOT_YET_RELEASED"
        };
        const statusValue = STATUS_MAP[statusParam] || undefined;

        // YEAR Map
        const parsedYear = parseInt(yearParam, 10);
        const yearValue = (!isNaN(parsedYear) && parsedYear > 1950) ? parsedYear : undefined;

        const query = `
          query ($genre: String, $page: Int, $format: MediaFormat, $status: MediaStatus, $year: Int, $sort: [MediaSort]) {
            Page(page: $page, perPage: 30) {
              pageInfo {
                currentPage
                hasNextPage
                lastPage
                total
              }
              media(type: ANIME, format_not_in: [TV_SHORT, MANGA, NOVEL, ONE_SHOT], genre_in: [$genre], genre_not_in: ["Hentai"], sort: $sort, format: $format, status: $status, seasonYear: $year) {
                id
                idMal
                title {
                  english
                  romaji
                  native
                }
                description(asHtml: false)
                bannerImage
                coverImage {
                  extraLarge
                  large
                  color
                }
                format
                status
                episodes
                duration
                season
                seasonYear
                startDate {
                  year
                  month
                  day
                }
                popularity
                averageScore
                genres
                studios(isMain: true) {
                  nodes {
                    name
                  }
                }
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
          sort: sortValue,
          format: formatValue,
          status: statusValue,
          year: yearValue
        });

        const mediaPage = result?.data?.Page;
        const topAiring = result?.data?.topAiring;
        const GenreCollection = result?.data?.GenreCollection;

        if (!mediaPage) {
          throw new Error("No media found for genre");
        }

        const mappedAnimes = mediaPage.media.map(mapAniListToAnime);
        const airingCount = mediaPage.media.filter(m => m.status === "RELEASING").length;

        return {
          animes: mappedAnimes,
          rawMedia: mediaPage.media,
          topAiringAnimes: topAiring?.media?.map(mapAniListToAnime) || [],
          genreName: formattedGenre,
          currentPage: mediaPage.pageInfo.currentPage || page,
          hasNextPage: mediaPage.pageInfo.hasNextPage || false,
          totalPages: mediaPage.pageInfo.lastPage || 1,
          totalItems: mediaPage.pageInfo.total || mappedAnimes.length,
          airingCount,
          genres: GenreCollection ? GenreCollection.filter(g => g && g !== "Hentai") : []
        };
      } catch (error) {
        console.error("Genre fetch failed:", error);
        throw error;
      }
    }, FIVE_HOURS);
  };

  const fetchproducers = async (name, page = 1, filters = {}) => {
    const sortParam = typeof filters === 'string' ? filters : (filters.sort || 'popularity');
    const key = `producer-${name}-p${page}-sort-${sortParam}`;

    return fetchWithCache(key, async () => {
      try {
        const cleanName = name.replace(/-/g, ' ');

        // Map UI sort to AniList sort enum
        const SORT_MAP = {
          popularity: ["POPULARITY_DESC"],
          trending: ["TRENDING_DESC"],
          score: ["SCORE_DESC"],
          newest: ["START_DATE_DESC"]
        };
        const sortValue = SORT_MAP[sortParam] || ["POPULARITY_DESC"];

        const query = `
          query ($search: String!, $page: Int!, $sort: [MediaSort]) {
            Studio(search: $search) {
              id
              name
              media(page: $page, perPage: 30, sort: $sort, isMain: true) {
                pageInfo {
                  currentPage
                  hasNextPage
                  lastPage
                  total
                }
                nodes {
                  id
                  idMal
                  title {
                    english
                    romaji
                    native
                  }
                  description(asHtml: false)
                  bannerImage
                  coverImage {
                    extraLarge
                    large
                    color
                  }
                  format
                  status
                  episodes
                  duration
                  season
                  seasonYear
                  startDate {
                    year
                    month
                    day
                  }
                  popularity
                  averageScore
                  genres
                  studios(isMain: true) {
                    nodes {
                      name
                    }
                  }
                }
              }
            }
          }
        `;

        const result = await anilistQuery(query, { search: cleanName, page, sort: sortValue });
        const studioObj = result?.data?.Studio;
        const studioMedia = studioObj?.media;

        if (!studioObj || !studioMedia) {
          // Unknown studio or no media returns empty object gracefully
          return {
            animes: [],
            rawMedia: [],
            producerName: cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            currentPage: 1,
            hasNextPage: false,
            totalPages: 0,
            totalItems: 0,
            airingCount: 0
          };
        }

        const mappedAnimes = studioMedia.nodes.map(mapAniListToAnime);
        const airingCount = studioMedia.nodes.filter(m => m.status === "RELEASING").length;

        return {
          animes: mappedAnimes,
          rawMedia: studioMedia.nodes,
          producerName: studioObj.name,
          currentPage: studioMedia.pageInfo.currentPage || page,
          hasNextPage: studioMedia.pageInfo.hasNextPage || false,
          totalPages: studioMedia.pageInfo.lastPage || 1,
          totalItems: studioMedia.pageInfo.total || mappedAnimes.length,
          airingCount
        };
      } catch (error) {
        console.error("Producer fetch failed:", error);
        throw error;
      }
    }, FIVE_HOURS);
  };

  const fetchepisodeserver = async () => {
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

  /* -------------------- LANDING & HERO TRENDING -------------------- */
  const fetchLandingTrending = async () => {
    return fetchWithCache("landing-trending-v1", async () => {
      try {
        const query = `
          query {
            Page(page: 1, perPage: 6) {
              media(type: ANIME, isAdult: false, genre_not_in: ["Hentai"], sort: TRENDING_DESC) {
                id
                idMal
                title { english romaji native }
                description(asHtml: false)
                bannerImage
                coverImage { extraLarge large color }
                format
                status
                episodes
                duration
                averageScore
                seasonYear
                startDate { year }
                genres
              }
            }
          }
        `;
        const result = await anilistQuery(query);
        return result?.data?.Page?.media || [];
      } catch (err) {
        console.error("Landing trending fetch failed:", err);
        return [];
      }
    }, FIVE_HOURS);
  };

  /* -------------------- EPISODE AVAILABILITY -------------------- */
  const checkEpisodeAvailability = async (animeId, episodeNumber, malId) => {
    try {
      const response = await fetch(`/.netlify/functions/check-episode?animeId=${animeId}&episode=${episodeNumber}&malId=${malId || ""}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.error("Check episode availability failed:", err);
      return null;
    }
  };

  /* -------------------- APP RELEASE VERSION -------------------- */
  const fetchLatestAppRelease = async () => {
    try {
      const baseUrl = import.meta.env.VITE_OTAKUSTREAMS_BACKEND_URL || "https://otakustreams-backend-j3h5.onrender.com/api";
      const response = await fetch(`${baseUrl}/app/version?platform=android&versionCode=0`);
      if (!response.ok) return null;
      const data = await response.json();
      return data?.latest || null;
    } catch (err) {
      console.error("Error fetching latest release info:", err);
      return null;
    }
  };

  /* -------------------- INITIAL LOAD -------------------- */
  // Homedata is fetched lazily by Home.jsx when navigating to /home

  return (
    <DataContext.Provider
      value={{
        homedata,
        fetchHomedata,
        fetchNewReleases,
        fetchMoviesSection,
        fetchRecentlyUpdated,
        fetchanimeinfo,
        fetchsearch,
        fetchsearchsuggestions,
        fetchepisodeinfo,
        fetchestimatedschedules,
        fetchnextepisodeschedule,
        fetchcategories,
        fetchgenres,
        fetchproducers,
        fetchepisodeserver,
        fetchmediarelations,
        fetchLandingTrending,
        checkEpisodeAvailability,
        fetchLatestAppRelease,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
