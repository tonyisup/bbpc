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
        // Fetch details to get imdb_id
        const detailsUrl = `${TMDB_API_BASE}/movie/${movie.id}?api_key=${process.env.TMDB_API_KEY}`;
        const detailsResp = await fetch(detailsUrl);
        const detailsData = await detailsResp.json();

        return {
          ...movie,
          imdb_id: detailsData.imdb_id as string | null,
          poster_path: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : null,
          backdrop_path: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : null,
        };
      }));

      // Shuffle the results on the server side as well for good measure
      const shuffled = processedMovies.sort(() => 0.5 - Math.random());

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
});
