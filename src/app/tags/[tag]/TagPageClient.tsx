"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "motion/react";
import { X, Check, LinkIcon, RefreshCwIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ChristmasSnow from "@/components/AnimatedChristmas";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  imdb_id?: string | null;
}

export function TagPageClient({ tag }: { tag: string }) {
  const [sessionId, setSessionId] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votedMovieIds, setVotedMovieIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Initialize page from localStorage
  useEffect(() => {
    const storedPage = localStorage.getItem(`tag_page_${tag}`);
    if (storedPage) {
      const page = parseInt(storedPage, 10);
      if (!isNaN(page) && page >= 1) {
        setCurrentPage(page);
      }
    }
  }, [tag]);

  // Save page to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`tag_page_${tag}`, currentPage.toString());
  }, [tag, currentPage]);

  // Queries
  const { data: movieData, isLoading, refetch: refetchMovies } = api.tag.getMoviesForTag.useQuery(
    { tag: tag, page: currentPage },
    {
      refetchOnWindowFocus: false,
      enabled: movies.length < 3, // Refetch when we're running low
    }
  );

  const { data: stats } = api.tag.getStats.useQuery(
    { tag: tag, tmdbId: movies[currentIndex]?.id ?? 0 },
    { enabled: !!movies[currentIndex] }
  );

  const submitVote = api.tag.submitVote.useMutation();

  // Initialize session and local storage
  useEffect(() => {
    // Session ID for this visit (or could persist if desired, but "anonymous" usually implies session-based or device-based)
    let sid = localStorage.getItem("tag_vote_session_id");
    if (!sid) {
      sid = uuidv4();
      localStorage.setItem("tag_vote_session_id", sid);
    }
    setSessionId(sid);

    // Load voted IDs
    const storedVotes = localStorage.getItem(`voted_movies_${tag}`);
    if (storedVotes) {
      try {
        setVotedMovieIds(JSON.parse(storedVotes));
      } catch (e) {
        console.error("Failed to parse voted movies", e);
      }
    }
  }, [tag]);

  // Handle incoming movie data
  useEffect(() => {
    if (movieData) {
      // Update pagination info
      if (movieData.pagination) {
        setTotalPages(movieData.pagination.totalPages);
      }

      const newMovies = movieData.movies.filter(
        (m) => !votedMovieIds.includes(m.id) && !movies.find((existing) => existing.id === m.id)
      );

      if (newMovies.length > 0) {
        setMovies((prev) => [...prev, ...newMovies]);
      } else if (movieData.pagination && currentPage < movieData.pagination.totalPages) {
        // No new movies on this page, advance to next page
        setCurrentPage((prev) => prev + 1);
      }
    }
  }, [movieData, votedMovieIds, movies, currentPage]);

  const handlePassAndRefresh = () => {
    handleVote(null);
    refetchMovies();
  }

  const handleVote = async (isTag: boolean | null) => {
    const currentMovie = movies[currentIndex];
    if (!currentMovie) return;

    // Optimistic UI update: move to next card immediately
    // In a real tinder-style, we remove the card.
    // Here we'll just increment index or slice the array.
    // Slicing is better for "stack" logic.

    // Save to DB
    submitVote.mutate({
      tag: tag,
      tmdbId: currentMovie.id,
      isTag,
      sessionId,
    });

    // Save to LocalStorage
    const newVotedIds = [...votedMovieIds, currentMovie.id];
    setVotedMovieIds(newVotedIds);
    localStorage.setItem(`voted_movies_${tag}`, JSON.stringify(newVotedIds));

    // Wait a tiny bit for animation if triggered by button,
    // but the swipe logic usually handles the removal animation itself.
    // If this function is called by button, we need to trigger an exit animation manually?
    // For simplicity with SwipeCard, we'll let the parent manage the list state
    // AFTER the child component says "I'm done".

    setMovies((prev) => prev.slice(1));
    // Index stays 0 because we removed the first item
  };

  const currentMovie = movies[0];

  if (isLoading && movies.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="animate-pulse">Loading movies for "{tag}"...</div>
      </div>
    );
  }

  // Show loading if we're fetching more movies from another page
  if (!currentMovie && !isLoading && currentPage < totalPages) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="animate-pulse">Loading more movies...</div>
      </div>
    );
  }

  if (!currentMovie && !isLoading && currentPage >= totalPages) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No more movies to vote on!</h2>
        <p className="mb-8">You've gone through all the movies we found for "{tag}".</p>
        <button
          type="button"
          onClick={() => {
            setVotedMovieIds([]);
            localStorage.removeItem(`voted_movies_${tag}`);
            setCurrentPage(1);
            localStorage.setItem(`tag_page_${tag}`, "1");
            refetchMovies();
          }}
          className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white overflow-hidden p-4">
      {tag === "christmas" && <div className="mb-8"><h1 className="text-3xl text-center font-bold capitalize">Is it?</h1><ChristmasSnow /></div>}
      {tag !== "christmas" && <h1 className="text-3xl font-bold mb-8 capitalize">Is it {tag} ?</h1>}

      <div className="relative w-full max-w-sm h-[600px] flex flex-col items-center">
        <AnimatePresence>
          {movies.map((movie, index) => {
            // Only render the top 2 cards for performance
            if (index > 1) return null;

            return (
              <SwipeCard
                key={movie.id}
                movie={movie}
                index={index}
                onVote={handleVote}
                onPassAndRefresh={handlePassAndRefresh}
                isFront={index === 0}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Stats Bar */}
      {currentMovie && (
        <div className="w-full max-w-sm">
          <p className="text-center text-sm text-gray-400 p-4">
            {currentMovie.imdb_id ? (
              <a
                href={`https://www.imdb.com/title/${currentMovie.imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white hover:underline transition-colors"
              >
                {currentMovie.title}
                <LinkIcon className="pl-2 w-4 h-4 inline" />
              </a>
            ) : (
              currentMovie.title
            )}
          </p>
          <StatsBar stats={stats} />
        </div>
      )}
    </div>
  );
}

function SwipeCard({
  movie,
  index,
  onVote,
  isFront,
  onPassAndRefresh,
}: {
  movie: Movie,
  index: number,
  onVote: (vote: boolean) => void,
  isFront: boolean,
  onPassAndRefresh: () => void
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Color overlays
  const rightOpacity = useTransform(x, [0, 150], [0, 1]);
  const leftOpacity = useTransform(x, [0, -150], [0, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onVote(true);
    } else if (info.offset.x < -100) {
      onVote(false);
    }
  };

  const handleButtonVote = (vote: boolean) => {
    onVote(vote);
  }

  // If it's not the front card, it sits behind
  if (!isFront) {
    return (
      <motion.div
        className="absolute top-0 w-full h-[500px] rounded-xl overflow-hidden shadow-2xl bg-gray-900"
        style={{
          scale: 0.95,
          zIndex: 0,
          y: 20
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          {movie.poster_path ? (
            <img src={movie.poster_path} alt={movie.title} className="max-w-full max-h-full object-contain" draggable={false} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
              No Poster
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        className="absolute top-0 w-full h-[500px] rounded-xl overflow-hidden shadow-2xl bg-gray-900 cursor-grab active:cursor-grabbing"
        style={{ x, rotate, zIndex: 1 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        {/* Yes/No Overlays */}
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute inset-0 bg-green-500/40 z-10 flex items-center justify-center pointer-events-none"
        >
          <span className="text-white font-black text-4xl border-4 border-white p-2 rounded transform -rotate-12">YES</span>
        </motion.div>
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute inset-0 bg-red-500/40 z-10 flex items-center justify-center pointer-events-none"
        >
          <span className="text-white font-black text-4xl border-4 border-white p-2 rounded transform rotate-12">NO</span>
        </motion.div>

        <div className="w-full h-full flex items-center justify-center">
          {movie.poster_path ? (
            <img src={movie.poster_path} alt={movie.title} className="max-w-full max-h-full object-contain pointer-events-none" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
              No Poster
            </div>
          )}
        </div>
      </motion.div>

      {/* Buttons for non-swipe interaction - placed outside the card but logically coupled */}
      <div className="absolute top-[520px] w-full flex justify-between px-8 z-10">
        <button
          type="button"
          onClick={() => handleButtonVote(false)}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
          aria-label="Not the tag"
        >
          <X className="w-8 h-8 font-bold" />
        </button>
        <button
          type="button"
          onClick={() => onPassAndRefresh()}
          className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
          aria-label="Pass and refresh"
        >
          <RefreshCwIcon className="w-8 h-8 font-bold" />
        </button>
        <button
          type="button"
          onClick={() => handleButtonVote(true)}
          className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
          aria-label="Is the tag"
        >
          <Check className="w-8 h-8 font-bold" />
        </button>
      </div>
    </>
  );
}

function StatsBar({ stats }: { stats?: { yes: number, no: number, total: number } }) {
  if (!stats || stats.total === 0) {
    return (
      <div className="w-full h-12 bg-gray-800 rounded-md flex items-center justify-center text-gray-400">
        No votes yet
      </div>
    )
  }

  const yesPercent = (stats.yes / stats.total) * 100;
  const noPercent = (stats.no / stats.total) * 100;

  return (
    <div className="w-full h-14 flex rounded-md overflow-hidden text-lg font-bold">
      {stats.no > 0 && (
        <div
          className="bg-red-500 h-full flex items-center justify-center text-white transition-all duration-500"
          style={{ width: `${noPercent}%` }}
        >
          {stats.no}
        </div>
      )}
      {stats.yes > 0 && (
        <div
          className="bg-green-500 h-full flex items-center justify-center text-white transition-all duration-500"
          style={{ width: `${yesPercent}%` }}
        >
          {stats.yes}
        </div>
      )}
    </div>
  )
}
