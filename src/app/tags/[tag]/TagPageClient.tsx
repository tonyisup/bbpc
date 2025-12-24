"use client";

import { useEffect, useState, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { api } from "@/trpc/react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, LinkIcon, RefreshCwIcon, PlusCircle, CheckCircle, Info, Share2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import ChristmasSnow from "@/components/AnimatedChristmas";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import TinderCard from "react-tinder-card";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  imdb_id?: string | null;
}

export function TagPageClient({ tag, initialMovieId }: { tag: string; initialMovieId?: number }) {
  const [sessionId, setSessionId] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  // currentIndex is always 0 with the slicing strategy, but keeping state for compatibility if needed, though unused effectively.
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votedMovieIds, setVotedMovieIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [sharedMovieLoaded, setSharedMovieLoaded] = useState(false);
  const [hasVotedOnSharedMovie, setHasVotedOnSharedMovie] = useState(false);
  const [sharedMovieWasAlreadyVoted, setSharedMovieWasAlreadyVoted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [salt, setSalt] = useState(0);
  const [ignoreSharedMovie, setIgnoreSharedMovie] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Confirmation state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionKey: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionKey: "",
    onConfirm: () => {},
  });

  const requestConfirmation = (
    actionKey: string,
    title: string,
    description: string,
    callback: () => void
  ) => {
    const dontAskAgain = localStorage.getItem(`dont_ask_again_${actionKey}`);
    if (dontAskAgain === "true") {
      callback();
      return;
    }

    setConfirmConfig({
      isOpen: true,
      title,
      description,
      actionKey,
      onConfirm: callback,
    });
  };

  const handleConfirmAction = (dontAskAgain: boolean) => {
    if (dontAskAgain) {
      localStorage.setItem(`dont_ask_again_${confirmConfig.actionKey}`, "true");
    }
    confirmConfig.onConfirm();
    setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
  };


  // Ref for the currently active card to allow programmatic swipes
  const cardRef = useRef<any>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sharedMovieId = initialMovieId;

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
  const { data: movieData, isLoading, isFetching, refetch: refetchMovies } = api.tag.getMoviesForTag.useQuery(
    {
      tag: tag,
      page: currentPage,
      movieId: ignoreSharedMovie ? undefined : sharedMovieId,
      salt: salt,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: 'always', // Always fetch fresh data on mount
      staleTime: 0, // Consider data stale immediately to ensure fresh fetches
      // Always enable when there's a shared movie ID, otherwise only when running low on movies
      enabled: !!sharedMovieId || movies.length < 3,
    }
  );

  const { data: stats } = api.tag.getStats.useQuery(
    { tag: tag, tmdbId: movies[0]?.id ?? 0 },
    { enabled: !!movies[0] }
  );

  const { data: session } = useSession();
  const [isAddingToSyllabus, setIsAddingToSyllabus] = useState(false);
  const [addedToSyllabus, setAddedToSyllabus] = useState(false);

  const submitVote = api.tag.submitVote.useMutation();
  const addMovie = api.movie.add.useMutation();
  const addToSyllabus = api.syllabus.add.useMutation();


  const currentMovie = movies[0]; // Always index 0

  useEffect(() => {
    // Reset added state when current movie changes
    setAddedToSyllabus(false);
  }, [currentMovie?.id]);

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
        let votedIds: number[] = JSON.parse(storedVotes);

        // If there's a shared movie ID in the URL and it's already been voted on,
        // track this so we can show "Already Voted" UI, but still allow viewing
        if (sharedMovieId && votedIds.includes(sharedMovieId)) {
          setSharedMovieWasAlreadyVoted(true);
          // Remove from votedIds so the movie can still be displayed
          votedIds = votedIds.filter(id => id !== sharedMovieId);
        }

        setVotedMovieIds(votedIds);
      } catch (e) {
        console.error("Failed to parse voted movies", e);
      }
    }
  }, [tag, sharedMovieId]);

  // Handle incoming movie data
  useEffect(() => {
    if (movieData) {
      setHasFetchedOnce(true);
      setIsTransitioning(false);
      setIsInitialLoad(false);

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

      // Filter out movies that have been voted on, but ALLOW the shared movie if not voted on this session
      const newMovies = movieData.movies.filter(
        (m) => {
          // If this is the shared movie, allow it only if we haven't voted on it this session
          if (sharedMovieId && m.id === sharedMovieId) {
            return !hasVotedOnSharedMovie;
          }

          return !votedMovieIds.includes(m.id) && !movies.find((existing) => existing.id === m.id);
        }
      );

      // Also deduplicate against existing state movies, but be careful not to remove the shared one if it's new
      const uniqueNewMovies = newMovies.filter(m => !movies.find(existing => existing.id === m.id));

      // Check if we received the shared movie in this response
      // Mark as loaded either way after first fetch to avoid infinite loading
      if (sharedMovieId && !sharedMovieLoaded) {
        const foundSharedMovie = movieData.movies.some(m => m.id === sharedMovieId);
        // Mark as loaded regardless - we either found it or the API didn't return it
        setSharedMovieLoaded(true);
        if (!foundSharedMovie) {
          console.warn(`Shared movie ID ${sharedMovieId} was not returned by the API`);
        }
      }

      if (uniqueNewMovies.length > 0) {
        // If there's a shared movie, ensure it goes to the front
        if (sharedMovieId) {
          const sharedMovie = uniqueNewMovies.find(m => m.id === sharedMovieId);
          const otherMovies = uniqueNewMovies.filter(m => m.id !== sharedMovieId);

          if (sharedMovie) {
            // Prepend shared movie, then append others
            setMovies((prev) => {
              // Remove the shared movie if it somehow got in already at wrong position
              const withoutShared = prev.filter(m => m.id !== sharedMovieId);
              return [sharedMovie, ...withoutShared, ...otherMovies];
            });
          } else {
            setMovies((prev) => [...prev, ...uniqueNewMovies]);
          }
        } else {
          setMovies((prev) => [...prev, ...uniqueNewMovies]);
        }
      } else if (!sharedMovieId && movieData.pagination && currentPage < movieData.pagination.totalPages) {
        // No new movies on this page, advance to next page
        setCurrentPage((prev) => prev + 1);
      }
    }
  }, [movieData, votedMovieIds, movies, currentPage, tag, sharedMovieId, sharedMovieLoaded, hasVotedOnSharedMovie]);

  const handleShare = () => {
    requestConfirmation(
      "share_movie",
      "Share this movie?",
      "This will copy the link to your clipboard.",
      async () => {
        if (!currentMovie) return;
        const url = `${window.location.origin}/tags/${tag}/${currentMovie.id}`;
        try {
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
        } catch (err) {
          console.error("Failed to copy link:", err);
          toast.error("Failed to copy link");
        }
      }
    );
  };

  const handleAddToSyllabus = () => {
    requestConfirmation(
      "add_to_syllabus",
      "Add to Syllabus?",
      `Are you sure you want to add "${currentMovie?.title}" to your syllabus?`,
      async () => {
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
            tmdbId: currentMovie.id,
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
      }
    );
  };

  const handleSignInToAdd = () => {
    requestConfirmation(
      "sign_in_to_add",
      "Sign In to Add?",
      "You need to sign in to add this movie to your syllabus. Continue?",
      () => {
        if (!currentMovie) return;
        localStorage.setItem("pending_syllabus_add", JSON.stringify({
          tag,
          movie: currentMovie
        }));
        void signIn();
      }
    );
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

            setIsAddingToSyllabus(true);

            toast.promise(
              (async () => {
                const savedMovie = await addMovie.mutateAsync({
                  title: pendingMovie.title,
                  year: year,
                  poster: pendingMovie.poster_path ?? "",
                  url: url,
                  tmdbId: pendingMovie.id,
                });

                await addToSyllabus.mutateAsync({
                  userId: user.id,
                  movieId: savedMovie.id,
                  order: 9999,
                });

                setAddedToSyllabus(true);
              })(),
              {
                loading: 'Adding movie from your previous session...',
                success: `Added ${pendingMovie.title} to your syllabus!`,
                error: 'Failed to add movie to syllabus.',
                finally: () => {
                  setIsAddingToSyllabus(false);
                }
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
    requestConfirmation(
      "pass_movie",
      "Pass this movie?",
      "This will skip the current movie and load a new one.",
      () => {
        // Manually skip the current movie
        setMovies((prev) => prev.slice(1));
        refetchMovies();
      }
    );
  }

  // Called by buttons to trigger a swipe animation
  const handleButtonVote = (isTag: boolean) => {
    const actionKey = isTag ? "vote_yes" : "vote_no";
    const title = isTag ? `Vote Yes for ${tag}?` : `Vote No for ${tag}?`;
    const description = isTag
      ? `Are you sure you want to vote YES that this movie is ${tag}?`
      : `Are you sure you want to vote NO that this movie is NOT ${tag}?`;

    requestConfirmation(
      actionKey,
      title,
      description,
      () => {
        if (cardRef.current) {
          cardRef.current.swipe(isTag ? 'right' : 'left');
        }
      }
    );
  }

  // Called when the card is swiped (either by drag or by button triggered swipe)
  const onSwipe = (direction: string) => {
    // direction is 'left', 'right', 'up', 'down'
    if (direction !== 'left' && direction !== 'right') return;

    const isTag = direction === 'right';

    if (!currentMovie) return;

    // Prevent duplicate votes on the same movie
    if (votedMovieIds.includes(currentMovie.id)) {
      console.warn(`Already voted on movie ${currentMovie.id}, skipping`);
      return;
    }

    // If voting on the shared movie, mark it so it won't be re-added
    if (sharedMovieId && currentMovie.id === sharedMovieId) {
      setHasVotedOnSharedMovie(true);
      router.replace(`/tags/${tag}`, { scroll: false });
    }

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
  };

  const onCardLeftScreen = (myIdentifier: string) => {
    // Remove the card from the state to bring the next one forward
    setMovies((prev) => prev.slice(1));
  }


  // Check if we're still waiting for a shared movie to be fetched
  const isWaitingForSharedMovie = sharedMovieId && !sharedMovieLoaded && (isLoading || !hasFetchedOnce);

  // Show loading if we haven't fetched yet, are currently loading, are fetching more movies, or waiting for a shared movie
  if (!currentMovie && (isLoading || isFetching || !hasFetchedOnce || isInitialLoad || isTransitioning || isWaitingForSharedMovie)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="animate-pulse">
          {isFetching || isTransitioning ? "Loading more movies..." : `Loading movies for "${tag}"...`}
        </div>
      </div>
    );
  }

  // Only show "no more movies" if:
  // - No current movie
  // - Not loading/fetching/initial load
  // - We've fetched at least once
  // - We've exhausted all pages
  const canShowNoMovies = (!sharedMovieId || sharedMovieLoaded) && !isInitialLoad && !isTransitioning;

  if (!currentMovie && !isLoading && !isFetching && !isTransitioning && hasFetchedOnce && !isInitialLoad && currentPage >= totalPages && canShowNoMovies) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-white p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No more movies to vote on!</h2>
        <p className="mb-8">You've gone through all the movies we found for "{tag}".</p>
        <button
          type="button"
          onClick={() => {
            setVotedMovieIds([]);
            setMovies([]);
            setHasVotedOnSharedMovie(false);
            setSharedMovieWasAlreadyVoted(false);
            setSharedMovieLoaded(false);
            setIgnoreSharedMovie(false);
            setSalt(s => s + 1);
            localStorage.removeItem(`voted_movies_${tag}`);
            setCurrentPage(1);
            localStorage.setItem(`tag_page_${tag}`, "1");
            setHasFetchedOnce(false);
          }}
          className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center text-white  p-4">
      {tag === "christmas" && <div>
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

      <div className="relative w-full max-w-sm md:max-w-md h-[480px] sm:h-[580px] md:h-[680px] mx-auto flex justify-center">
        {movies.map((movie, index) => {
          // Only render the top 2 cards for performance
          if (index > 1) return null;

          return (
            <SwipeCard
              key={movie.id}
              movie={movie}
              index={index}
              onSwipe={onSwipe}
              onCardLeftScreen={onCardLeftScreen}
              cardRef={cardRef}
              isFront={index === 0}
              disableSwipe={sharedMovieId === movie.id && sharedMovieWasAlreadyVoted}
            />
          );
        })}

        {/* Buttons for non-swipe interaction - placed outside the card stack */}
        {currentMovie && (
          <div className="absolute top-[400px] sm:top-[500px] md:top-[590px] left-0 right-0 mx-auto w-full flex flex-col items-center gap-2 z-10 mt-4">
            {/* Show "Already Voted" message if this is the shared movie and user already voted */}
            {sharedMovieId && currentMovie.id === sharedMovieId && sharedMovieWasAlreadyVoted ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-full text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">You already voted on this movie</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Mark as voted in this session and move to next
                    setHasVotedOnSharedMovie(true);
                    setIsTransitioning(true);
                    setIgnoreSharedMovie(true);
                    setSalt(s => s + 1);
                    setMovies((prev) => prev.slice(1));
                    // Clear the movieId from URL
                    router.replace(`/tags/${tag}`, { scroll: false });
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white text-sm font-medium transition-colors"
                >
                  Next Movie →
                </button>
              </div>
            ) : (
              <div className="flex justify-center gap-2 sm:gap-4 md:gap-6">
                {/* Add to Syllabus / Sign in Toggle */}
                {!session?.user ? (
                  <button
                    type="button"
                    onClick={handleSignInToAdd}
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square shrink-0 rounded-full bg-gray-800/80 hover:bg-gray-700/80 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 text-red-500/80"
                    aria-label="Sign in to add to syllabus"
                    title="Sign in to add to syllabus"
                  >
                    <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToSyllabus}
                    disabled={isAddingToSyllabus || addedToSyllabus}
                    className={`
                      w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square shrink-0 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95
                      ${addedToSyllabus
                        ? "bg-green-600/30 text-green-400 border border-green-500/50"
                        : "bg-gray-800/80 hover:bg-gray-700/80 text-blue-400"
                      }
                      ${isAddingToSyllabus ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    aria-label={addedToSyllabus ? "Added to Syllabus" : "Add to Syllabus"}
                    title={addedToSyllabus ? "Added to Syllabus" : "Add to Syllabus"}
                  >
                    {addedToSyllabus ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    ) : (
                      isAddingToSyllabus ? (
                        <RefreshCwIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 animate-spin" />
                      ) : (
                        <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                      )
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleButtonVote(false)}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square shrink-0 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                  aria-label={`Is NOT ${tag}`}
                  title={`Is NOT ${tag}`}
                >
                  <X className="w-6 h-6 sm:w-8 sm:h-8 font-bold" />
                </button>

                <button
                  type="button"
                  onClick={() => handlePassAndRefresh()}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square shrink-0 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                  aria-label="Pass and refresh"
                  title="Pass and refresh"
                >
                  <RefreshCwIcon className="w-6 h-6 sm:w-8 sm:h-8 font-bold" />
                </button>

                <button
                  type="button"
                  onClick={() => handleButtonVote(true)}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square shrink-0 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                  aria-label={`It IS ${tag}`}
                  title={`It IS ${tag}`}
                >
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 font-bold" />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square shrink-0 rounded-full bg-gray-800/80 hover:bg-gray-700/80 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 text-white"
                  aria-label="Share this movie"
                  title="Share this movie"
                >
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Bar */}
      {currentMovie && (
        <div className="w-full max-w-sm md:max-w-md flex flex-col items-center gap-2 mt-2 px-4">
          <StatsBar stats={stats} />
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmConfig.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          }
        }}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}

const Overlays = forwardRef<{ setDir: (dir: string | null) => void }, {}>(
  (props, ref) => {
    const [swipeDir, setSwipeDir] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      setDir: (dir: string | null) => setSwipeDir(dir),
    }));

    return (
      <>
        {/* Yes/No Overlays */}
        <div
          className={`absolute inset-0 bg-green-500/40 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${swipeDir === "right" ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-white font-black text-4xl border-4 border-white p-2 rounded transform -rotate-12">
            YES
          </span>
        </div>

        <div
          className={`absolute inset-0 bg-red-500/40 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${swipeDir === "left" ? "opacity-100" : "opacity-0"}`}
        >
          <span className="text-white font-black text-4xl border-4 border-white p-2 rounded transform rotate-12">
            NO
          </span>
        </div>
      </>
    );
  }
);
Overlays.displayName = "Overlays";

function SwipeCard({
  movie,
  index,
  onSwipe,
  onCardLeftScreen,
  cardRef,
  isFront,
  disableSwipe = false,
}: {
  movie: Movie,
  index: number,
  onSwipe: (dir: string) => void,
  onCardLeftScreen: (id: string) => void,
  cardRef: any,
  isFront: boolean,
  disableSwipe?: boolean,
}) {
  const overlayRef = useRef<{ setDir: (dir: string | null) => void }>(null);

  // Wrappers for TinderCard events to update local state for overlays
  const onSwipeRequirementFulfilled = useCallback((dir: string) => {
    overlayRef.current?.setDir(dir);
  }, []);

  const onSwipeRequirementUnfulfilled = useCallback(() => {
    overlayRef.current?.setDir(null);
  }, []);

  const handleCardLeftScreen = useCallback(() => {
    onCardLeftScreen(movie.id.toString());
  }, [onCardLeftScreen, movie.id]);

  const cardClasses = "absolute top-0 w-[260px] sm:w-[320px] md:w-[380px] h-[390px] sm:h-[480px] md:h-[570px]";

  // If it's not the front card, it sits behind
  if (!isFront) {
    return (
      <motion.div
        className={`${cardClasses} rounded-xl shadow-2xl`}
        initial={false}
        animate={{ scale: 0.95, y: 20, zIndex: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/*
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
             */}
        <div className="w-full h-full bg-gray-900 flex items-center justify-center rounded-xl overflow-hidden">
          {movie.poster_path ? (
            <img src={movie.poster_path} alt={movie.title} className="w-full h-full object-contain" draggable={false} />
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
    <TinderCard
      ref={isFront ? cardRef : null}
      onSwipe={onSwipe}
      onCardLeftScreen={handleCardLeftScreen}
      preventSwipe={disableSwipe ? ['up', 'down', 'left', 'right'] : ['up', 'down']}
      onSwipeRequirementFulfilled={onSwipeRequirementFulfilled}
      onSwipeRequirementUnfulfilled={onSwipeRequirementUnfulfilled}
      className={`${cardClasses} z-10`}
      swipeRequirementType="position"
      swipeThreshold={100}
    >
      <div
        className="relative w-full h-full bg-gray-900 flex items-center justify-center rounded-xl shadow-2xl overflow-hidden"
        style={{ cursor: disableSwipe ? 'default' : 'grab' }}
      >
        <Overlays ref={overlayRef} />

        {movie.poster_path ? (
          <img src={movie.poster_path} alt={movie.title} className="w-full h-full object-contain pointer-events-none" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
            No Poster
          </div>
        )}
        {movie.imdb_id ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchStartCapture={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://www.imdb.com/title/${movie.imdb_id}`, '_blank');
            }}
            className="absolute bottom-2 z-20 pointer-events-auto"
          >
            <span className="bg-black/50 p-2 rounded-md text-white text-xl">{(new Date(movie?.release_date)).getFullYear()}</span>
          </motion.button>
        ) : (
          <span className="absolute bottom-2 bg-black/50 p-2 rounded-md text-white text-xl z-20">{(new Date(movie?.release_date)).getFullYear()}</span>
        )}
      </div>
    </TinderCard>
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
    <div className="w-full h-14 flex rounded-md  text-lg font-bold">
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
