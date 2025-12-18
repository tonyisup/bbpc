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
    .input(z.object({ tag: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!process.env.TMDB_API_KEY) {
        throw new Error("TMDB_API_KEY is not set");
      }

      // 1. Find the keyword ID
      const searchUrl = `${TMDB_API_BASE}/search/keyword?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(input.tag)}&page=1`;
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
        };
      }

      // 2. Discover movies with this keyword
      // We want random movies, so we'll fetch the first page to get total_pages,
      // then pick a random page if total_pages > 1.
      const discoverUrlBase = `${TMDB_API_BASE}/discover/movie?api_key=${process.env.TMDB_API_KEY}&with_keywords=${keyword.id}&language=en-US&include_adult=false&sort_by=popularity.desc`;

      const firstPageResp = await fetch(`${discoverUrlBase}&page=1`);
      const firstPageData = (await firstPageResp.json()) as DiscoverMovieResponse;

      let movies = firstPageData.results;
      const totalPages = Math.min(firstPageData.total_pages, 500); // TMDB limits to 500 pages

      if (totalPages > 1) {
        const randomPage = Math.floor(Math.random() * totalPages) + 1;
        if (randomPage !== 1) {
           const randomPageResp = await fetch(`${discoverUrlBase}&page=${randomPage}`);
           const randomPageData = (await randomPageResp.json()) as DiscoverMovieResponse;
           movies = randomPageData.results;
        }
      }

      // Process image URLs
      const processedMovies = movies.map((movie) => ({
        ...movie,
        poster_path: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        backdrop_path: movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : null,
      }));

      // Shuffle the results on the server side as well for good measure
      const shuffled = processedMovies.sort(() => 0.5 - Math.random());

      return {
        tag: input.tag,
        keywordId: keyword.id,
        movies: shuffled,
      };
    }),

  submitVote: publicProcedure
    .input(
      z.object({
        tag: z.string(),
        tmdbId: z.number(),
        isTag: z.boolean(),
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
