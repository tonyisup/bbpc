"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "motion/react";
import { X, Check, LinkIcon, RefreshCwIcon, PlusCircle, CheckCircle, Info } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ChristmasSnow from "@/components/AnimatedChristmas";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

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
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

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
      refetchOnMount: 'always', // Always fetch fresh data on mount
      staleTime: 0, // Consider data stale immediately to ensure fresh fetches
      enabled: movies.length < 3, // Refetch when we're running low
    }
  );

  const { data: stats } = api.tag.getStats.useQuery(
    { tag: tag, tmdbId: movies[currentIndex]?.id ?? 0 },
    { enabled: !!movies[currentIndex] }
  );

  const { data: session } = useSession();
  const [isAddingToSyllabus, setIsAddingToSyllabus] = useState(false);
  const [addedToSyllabus, setAddedToSyllabus] = useState(false);

  const submitVote = api.tag.submitVote.useMutation();
  const addMovie = api.movie.add.useMutation();
  const addToSyllabus = api.syllabus.add.useMutation();

  useEffect(() => {
    // Reset added state when current movie changes
    setAddedToSyllabus(false);
  }, [currentIndex]);

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
      setHasFetchedOnce(true);

      // Update pagination info
      if (movieData.pagination) {
        setTotalPages(movieData.pagination.totalPages);

        // If stored page is higher than actual totalPages, reset to page 1
        // This handles stale localStorage data
        if (currentPage > movieData.pagination.totalPages && movieData.pagination.totalPages > 0) {
          setCurrentPage(1);
          localStorage.setItem(`tag_page_${tag}`, "1");
          return; // Exit early, the query will refetch with page 1
        }
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
  }, [movieData, votedMovieIds, movies, currentPage, tag]);

  const handleAddToSyllabus = async () => {
    const user = session?.user;
    if (!user || !currentMovie || isAddingToSyllabus || addedToSyllabus) return;

    setIsAddingToSyllabus(true);
    try {
      const year = new Date(currentMovie.release_date).getFullYear();

      // Determine URL - prefer IMDB, fallback to TMDB
      let url = `https://www.themoviedb.org/movie/${currentMovie.id}`;
      if (currentMovie.imdb_id) {
        url = `https://www.imdb.com/title/${currentMovie.imdb_id}`;
      }

      // 1. Add/Ensure movie exists in our DB
      const savedMovie = await addMovie.mutateAsync({
        title: currentMovie.title,
        year: year,
        poster: currentMovie.poster_path ?? "", // Fallback if null, schema might require string
        url: url,
      });

      // 2. Add to Syllabus
      await addToSyllabus.mutateAsync({
        userId: user.id,
        movieId: savedMovie.id,
        order: 9999, // Append to end
      });

      setAddedToSyllabus(true);
    } catch (error) {
      console.error("Failed to add to syllabus:", error);
      // Optional: Show error toast
    } finally {
      setIsAddingToSyllabus(false);
    }
  };

  const currentMovie = movies[0];

  const handleSignInToAdd = () => {
    if (!currentMovie) return;
    localStorage.setItem("pending_syllabus_add", JSON.stringify({
      tag,
      movie: currentMovie
    }));
    void signIn();
  };

  // Handle post-signin pending addition
  useEffect(() => {
    const user = session?.user;
    if (user && hasFetchedOnce) {
      const pending = localStorage.getItem("pending_syllabus_add");
      if (pending) {
        try {
          const { tag: pendingTag, movie: pendingMovie } = JSON.parse(pending) as { tag: string, movie: Movie };
          if (pendingTag === tag) {
            // Remove early to prevent double-processing if effect re-runs
            localStorage.removeItem("pending_syllabus_add");

            // Check if this movie is already in our local voted list to avoid duplicates
            if (votedMovieIds.includes(pendingMovie.id)) {
              return;
            }
            // This ensures the pending movie is at the front, 
            // and removes any "duplicate" of it that might have loaded naturally.
            setMovies(prev => [pendingMovie, ...prev.filter(m => m.id !== pendingMovie.id)]);

            const year = new Date(pendingMovie.release_date).getFullYear();
            let url = `https://www.themoviedb.org/movie/${pendingMovie.id}`;
            if (pendingMovie.imdb_id) {
              url = `https://www.imdb.com/title/${pendingMovie.imdb_id}`;
            }

            toast.promise(
              (async () => {
                const savedMovie = await addMovie.mutateAsync({
                  title: pendingMovie.title,
                  year: year,
                  poster: pendingMovie.poster_path ?? "",
                  url: url,
                });

                await addToSyllabus.mutateAsync({
                  userId: user.id,
                  movieId: savedMovie.id,
                  order: 9999,
                });
              })(),
              {
                loading: 'Adding movie from your previous session...',
                success: `Added ${pendingMovie.title} to your syllabus!`,
                error: 'Failed to add movie to syllabus.',
              }
            );
          }
        } catch (e) {
          console.error("Failed to process pending syllabus add", e);
          localStorage.removeItem("pending_syllabus_add");
        }
      }
    }
  }, [session, hasFetchedOnce, tag, votedMovieIds, addMovie, addToSyllabus]);

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

  // const currentMovie = movies[0]; // Moved up

  // Show loading if we haven't fetched yet, are currently loading, or we're fetching more movies from another page
  if (!currentMovie && (isLoading || !hasFetchedOnce || currentPage < totalPages)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="animate-pulse">{hasFetchedOnce ? "Loading more movies..." : `Loading movies for "${tag}"...`}</div>
      </div>
    );
  }

  if (!currentMovie && !isLoading && hasFetchedOnce && currentPage >= totalPages) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-white p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No more movies to vote on!</h2>
        <p className="mb-8">You've gone through all the movies we found for "{tag}".</p>
        <button
          type="button"
          onClick={() => {
            setVotedMovieIds([]);
            localStorage.removeItem(`voted_movies_${tag}`);
            setCurrentPage(1);
            localStorage.setItem(`tag_page_${tag}`, "1");
            setHasFetchedOnce(false);
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
    <div className="flex min-h-screen flex-col items-center text-white overflow-hidden p-4">
      {tag === "christmas" && <div className="mb-8">
        <span className="flex items-center justify-center gap-2">
          <span className="text-3xl text-center font-bold capitalize">Is it?</span>
          <Link href={`/tags/${tag}/stats`}>
            <Button

              variant="ghost"
              aria-label="View Stats"
              title="View Stats"
            >
              <Info />
            </Button>
          </Link>
        </span>
        <ChristmasSnow />
      </div>}
      {tag !== "christmas" && <span className="flex items-center justify-center gap-2">
        <span className="text-3xl text-center font-bold capitalize">Is it {tag}?</span>
        <Link href={`/tags/${tag}/stats`}>
          <Button

            variant="ghost"
            aria-label="View Stats"
            title="View Stats"
          >
            <Info />
          </Button>
        </Link>
      </span>}

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
        <div className="w-full max-w-sm flex flex-col items-center gap-2">
          <p className="text-center text-sm text-gray-400 p-2">
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
          {!session?.user && (
            <p className="text-center text-sm text-gray-400 p-2">
              Please <button onClick={handleSignInToAdd} className="font-semibold text-red-600 hover:text-red-400 transition-colors">Sign in</button> to add to syllabus
            </p>
          )}
          {session?.user && (
            <button
              onClick={handleAddToSyllabus}
              disabled={isAddingToSyllabus || addedToSyllabus}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${addedToSyllabus
                  ? "bg-green-600/20 text-green-400 cursor-default"
                  : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 active:scale-95"
                }
                ${isAddingToSyllabus ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {addedToSyllabus ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Added to Syllabus
                </>
              ) : (
                <>
                  {isAddingToSyllabus ? (
                    <RefreshCwIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  Add to Syllabus
                </>
              )}
            </button>
          )}

          <div className="w-full mt-2">
            <StatsBar stats={stats} />
          </div>
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
        className="absolute top-0 w-full h-[500px] rounded-xl overflow-hidden shadow-2xl"
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
        className="absolute top-0 w-full h-[500px] rounded-xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
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
