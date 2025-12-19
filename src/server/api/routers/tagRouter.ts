import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { tmdb } from "@/server/tmdb/client";

// Define response types for TMDB
interface KeywordSearchResponse {
  page: number;
  results: {
    id: number;
    name: string;
  }[];
  total_pages: number;
  total_results: number;
}

interface DiscoverMovieResponse {
  page: number;
  results: {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    release_date: string;
  }[];
  total_pages: number;
  total_results: number;
}

const TMDB_API_BASE = "https://api.themoviedb.org/3";

export const tagRouter = createTRPCRouter({
  getMoviesForTag: publicProcedure
    .input(z.object({ tag: z.string(), page: z.number().min(1).default(1) }))
    .query(async ({ ctx, input }) => {
      if (!process.env.TMDB_API_KEY) {
        throw new Error("TMDB_API_KEY is not set");
      }

      // 1. Find the keyword ID
      const searchUrl = `${TMDB_API_BASE}/search/keyword?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(input.tag)}&page=${input.page}`;
      const searchResp = await fetch(searchUrl);
      const searchData = (await searchResp.json()) as KeywordSearchResponse;

      // Exact match check (case insensitive)
      const keyword = searchData.results.find(
        (k) => k.name.toLowerCase() === input.tag.toLowerCase()
      );

      if (!keyword) {
        return {
          tag: input.tag,
          keywordId: null,
          movies: [],
          pagination: {
            currentPage: input.page,
            totalPages: searchData.total_pages,
            totalResults: searchData.total_results,
          },
        };
      }

      // 2. Discover movies with this keyword
      // Fetch both high and low rated movies for a fun mix
      const baseParams = `api_key=${process.env.TMDB_API_KEY}&with_keywords=${keyword.id}&language=en-US&include_adult=false&vote_count.gte=10`;
      const discoverUrlHigh = `${TMDB_API_BASE}/discover/movie?${baseParams}&sort_by=vote_average.desc`;
      const discoverUrlLow = `${TMDB_API_BASE}/discover/movie?${baseParams}&sort_by=vote_average.asc`;

      // Fetch first pages to get total_pages for both sorts
      const [highRatedResp, lowRatedResp] = await Promise.all([
        fetch(`${discoverUrlHigh}&page=1`),
        fetch(`${discoverUrlLow}&page=1`)
      ]);

      const highRatedData = (await highRatedResp.json()) as DiscoverMovieResponse;
      const lowRatedData = (await lowRatedResp.json()) as DiscoverMovieResponse;

      const highTotalPages = Math.min(highRatedData.total_pages, 500);
      const lowTotalPages = Math.min(lowRatedData.total_pages, 500);
      const totalPages = Math.max(highTotalPages, lowTotalPages);

      // Pick random pages for variety
      let highMovies = highRatedData.results;
      let lowMovies = lowRatedData.results;

      if (highTotalPages > 1) {
        const randomHighPage = Math.floor(Math.random() * highTotalPages) + 1;
        if (randomHighPage !== 1) {
          const resp = await fetch(`${discoverUrlHigh}&page=${randomHighPage}`);
          highMovies = ((await resp.json()) as DiscoverMovieResponse).results;
        }
      }

      if (lowTotalPages > 1) {
        const randomLowPage = Math.floor(Math.random() * lowTotalPages) + 1;
        if (randomLowPage !== 1) {
          const resp = await fetch(`${discoverUrlLow}&page=${randomLowPage}`);
          lowMovies = ((await resp.json()) as DiscoverMovieResponse).results;
        }
      }

      // Interleave high and low rated movies for variety
      const interleaved: typeof highMovies = [];
      const maxLen = Math.max(highMovies.length, lowMovies.length);
      for (let i = 0; i < maxLen; i++) {
        const highMovie = highMovies[i];
        const lowMovie = lowMovies[i];
        if (highMovie) interleaved.push(highMovie);
        if (lowMovie) interleaved.push(lowMovie);
      }

      // Remove duplicates (same movie might appear in both lists)
      const seen = new Set<number>();
      const movies = interleaved.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      // Process image URLs and fetch IMDB IDs
      const processedMovies = await Promise.all(movies.map(async (movie) => {
        if (!movie) return null;
        // Fetch details to get imdb_id
        const detailsUrl = `${TMDB_API_BASE}/movie/${movie.id}?api_key=${process.env.TMDB_API_KEY}`;
        const detailsResp = await fetch(detailsUrl);
        const detailsData = await detailsResp.json();

        if (!detailsData) {
          return {
            ...movie,
            imdb_id: null,
            poster_path: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null,
            backdrop_path: movie.backdrop_path
              ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
              : null,
          };
        }

        return {
          ...movie,
          imdb_id: (detailsData as { imdb_id: string | null }).imdb_id,
          poster_path: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
          backdrop_path: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : null,
        };
      }));

      // Shuffle the results on the server side as well for good measure
      // Filter out nulls and force type
      const shuffled = processedMovies
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .sort(() => 0.5 - Math.random());

      return {
        tag: input.tag,
        keywordId: keyword.id,
        movies: shuffled,
        pagination: {
          currentPage: input.page,
          totalPages: totalPages,
          totalResults: highRatedData.total_results + lowRatedData.total_results,
        },
      };
    }),

  submitVote: publicProcedure
    .input(
      z.object({
        tag: z.string(),
        tmdbId: z.number(),
        isTag: z.boolean().nullable(),
        sessionId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.tagVote.create({
        data: {
          tag: input.tag,
          tmdbId: input.tmdbId,
          isTag: input.isTag,
          sessionId: input.sessionId,
        },
      });
    }),

  getStats: publicProcedure
    .input(
      z.object({
        tag: z.string(),
        tmdbId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.tagVote.groupBy({
        by: ["isTag"],
        where: {
          tag: input.tag,
          tmdbId: input.tmdbId,
        },
        _count: {
          isTag: true,
        },
      });

      const yesCount = stats.find((s) => s.isTag === true)?._count.isTag ?? 0;
      const noCount = stats.find((s) => s.isTag === false)?._count.isTag ?? 0;

      return {
        yes: yesCount,
        no: noCount,
        total: yesCount + noCount,
      };
    }),

  getTagStats: publicProcedure.query(async ({ ctx }) => {
    const stats = await ctx.db.tagVote.groupBy({
      by: ["tag", "isTag"],
      _count: {
        isTag: true,
      },
    });

    const aggregate = new Map<string, { yes: number; no: number; total: number }>();
    for (const s of stats) {
      const current = aggregate.get(s.tag) ?? { yes: 0, no: 0, total: 0 };
      const count = s._count.isTag;
      if (s.isTag === true) current.yes += count;
      if (s.isTag === false) current.no += count;
      current.total += count;
      aggregate.set(s.tag, current);
    }

    return Array.from(aggregate.entries())
      .map(([tag, counts]) => ({
        tag,
        ...counts,
      }))
      .sort((a, b) => b.total - a.total);
  }),

  getAllStats: publicProcedure.query(async ({ ctx }) => {
    // 1. Group votes by tmdbId, tag, isTag
    const stats = await ctx.db.tagVote.groupBy({
      by: ["tmdbId", "tag", "isTag"],
      _count: {
        isTag: true,
      },
    });

    // 2. Aggregate into a structure: Map<tmdbId, Map<tag, { yes: number, no: number }>>
    const movieStats = new Map<number, Map<string, { yes: number; no: number }>>();

    for (const s of stats) {
      if (!movieStats.has(s.tmdbId)) {
        movieStats.set(s.tmdbId, new Map());
      }
      const tags = movieStats.get(s.tmdbId)!;
      if (!tags.has(s.tag)) {
        tags.set(s.tag, { yes: 0, no: 0 });
      }
      const count = s._count.isTag;
      if (s.isTag === true) {
        tags.get(s.tag)!.yes += count;
      } else if (s.isTag === false) {
        tags.get(s.tag)!.no += count;
      }
    }

    // 3. Fetch movie details for each tmdbId
    const tmdbIds = Array.from(movieStats.keys());
    const movieDetails = await Promise.all(
      tmdbIds.map(async (id) => {
        try {
          const detailsUrl = `${TMDB_API_BASE}/movie/${id}?api_key=${process.env.TMDB_API_KEY}`;
          const resp = await fetch(detailsUrl);
          if (!resp.ok) return null;
          const data = await resp.json();
          return {
            id: data.id,
            title: data.title as string,
            poster_path: data.poster_path
              ? `https://image.tmdb.org/t/p/w200${data.poster_path}`
              : null,
          };
        } catch (e) {
          console.error(`Failed to fetch movie ${id}`, e);
          return null;
        }
      })
    );

    // 4. Construct final result
    const result = tmdbIds
      .map((id) => {
        const details = movieDetails.find((m) => m?.id === id);
        const title = details?.title ?? `Movie #${id}`;
        const poster_path = details?.poster_path ?? null;

        const tagsMap = movieStats.get(id)!;
        const tags = Array.from(tagsMap.entries()).map(([tag, counts]) => ({
          tag,
          yes: counts.yes,
          no: counts.no,
        }));

        return {
          tmdbId: id,
          title,
          poster_path,
          tags,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }),

  getMoviesStats: publicProcedure
    .input(z.object({
      tag: z.string(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.tagVote.groupBy({
        by: ["tmdbId", "isTag"],
        where: {
          tag: input.tag,
        },
        _count: {
          isTag: true,
        },
      });

      // Aggregate counts by tmdbId
      const movieStatsMap = new Map<
        number,
        { yes: number; no: number; total: number }
      >();

      for (const stat of stats) {
        const current = movieStatsMap.get(stat.tmdbId) ?? {
          yes: 0,
          no: 0,
          total: 0,
        };
        const count = stat._count.isTag;
        if (stat.isTag === true) current.yes += count;
        if (stat.isTag === false) current.no += count;
        current.total += count;
        movieStatsMap.set(stat.tmdbId, current);
      }

      // Convert to array and sort by total votes desc
      const sortedStats = Array.from(movieStatsMap.entries())
        .map(([tmdbId, s]) => ({ tmdbId, ...s }))
        .sort((a, b) => b.total - a.total);

      // Pagination slice
      const pagedStats = sortedStats.slice(input.cursor, input.cursor + input.limit);
      const nextCursor = input.cursor + input.limit < sortedStats.length ? input.cursor + input.limit : undefined;

      // Fetch movie details only for the current page
      const moviesWithDetails = await Promise.all(
        pagedStats.map(async (stat) => {
          try {
            const detailsUrl = `${TMDB_API_BASE}/movie/${stat.tmdbId}?api_key=${process.env.TMDB_API_KEY}`;
            const detailsResp = await fetch(detailsUrl);

            if (!detailsResp.ok) {
              // If fail, return partial
              return {
                ...stat,
                title: `Unknown Movie (${stat.tmdbId})`,
                poster_path: null as string | null,
              }
            }

            const detailsData = await detailsResp.json();

            return {
              ...stat,
              title: detailsData.title as string,
              poster_path: detailsData.poster_path
                ? `https://image.tmdb.org/t/p/w200${detailsData.poster_path}`
                : null as string | null,
            };
          } catch (e) {
            return {
              ...stat,
              title: `Error Loading (${stat.tmdbId})`,
              poster_path: null as string | null,
            }
          }
        })
      );

      return {
        items: moviesWithDetails,
        nextCursor,
      };
    }),
});
